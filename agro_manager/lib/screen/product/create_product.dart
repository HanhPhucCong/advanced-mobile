import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CreateProductScreen extends StatefulWidget {
  const CreateProductScreen({Key? key}) : super(key: key);

  @override
  State<CreateProductScreen> createState() => _CreateProductScreenState();
}

class _CreateProductScreenState extends State<CreateProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _qtyCtrl = TextEditingController();
  final ImagePicker _picker = ImagePicker();
  List<XFile> _images = [];
  bool _loading = false;

  List<Map<String, dynamic>> _categories = [];
  int? _selectedCategoryId;

  final List<String> _units = ['PIECE', 'KILOGRAM', 'GRAM'];
  String? _selectedUnit;

  @override
  void initState() {
    super.initState();
    _fetchCategories();
    _selectedUnit = _units.first;
  }

  Future<void> _fetchCategories() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rawToken = prefs.getString('token');
      if (rawToken == null || rawToken.isEmpty) return;
      final auth = rawToken.startsWith('Bearer ') ? rawToken : 'Bearer $rawToken';
      final dio = Dio(BaseOptions(
        headers: {'Authorization': auth},
        validateStatus: (s) => s! < 500,
      ));
      final resp = await dio.get('http://10.0.2.2:8083/admin/categories');
      if (resp.statusCode == 200) {
        final List data = resp.data;
        setState(() {
          _categories = data.map((e) => Map<String, dynamic>.from(e)).toList();
          if (_categories.isNotEmpty) {
            _selectedCategoryId = _categories.first['id'] as int;
          }
        });
      }
    } catch (_) {}
  }

  Future<void> _pickImages() async {
    final picked = await _picker.pickMultiImage(imageQuality: 80);
    if (picked != null && picked.isNotEmpty) {
      setState(() => _images = picked);
    }
  }

  Future<List<String>> _uploadImages(List<XFile> images) async {
    final prefs = await SharedPreferences.getInstance();
    final rawToken = prefs.getString('token');
    if (rawToken == null || rawToken.isEmpty) throw Exception('Token not found');
    final auth = rawToken.startsWith('Bearer ') ? rawToken : 'Bearer $rawToken';
    final dio = Dio(BaseOptions(
      headers: {'Authorization': auth},
      validateStatus: (s) => s! < 500,
    ));
    const uploadUrl = 'http://10.0.2.2:8083/api/file/image/upload';
    final urls = <String>[];
    for (var img in images) {
      final fileName = img.path.split('/').last;
      final form = FormData.fromMap({
        'file': await MultipartFile.fromFile(img.path, filename: fileName),
      });
      final resp = await dio.post(uploadUrl, data: form);
      if (resp.statusCode == 200) {
        final data = resp.data['data'] as Map<String, dynamic>?;
        String? url = data?['secure_url'] ?? data?['url'];
        if (url != null) urls.add(url);
      } else {
        throw Exception('Upload failed ${resp.statusCode}');
      }
    }
    return urls;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final urls = await _uploadImages(_images);
      final payload = {
        'name': _nameCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
        'price': double.parse(_priceCtrl.text),
        'quantity': int.parse(_qtyCtrl.text),
        'unit': _selectedUnit,
        'categoryId': _selectedCategoryId,
        'imageUrls': urls,
      };

      final prefs = await SharedPreferences.getInstance();
      final rawToken = prefs.getString('token')!;
      final auth = rawToken.startsWith('Bearer ') ? rawToken : 'Bearer $rawToken';
      final dio = Dio(BaseOptions(
        headers: {'Authorization': auth},
        validateStatus: (s) => s! < 500,
      ));

      final resp = await dio.post(
        'http://10.0.2.2:8083/admin/products',
        data: payload,
      );

      if (resp.statusCode! >= 200 && resp.statusCode! < 300) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('🎉 Product created successfully!')),
        );
        Navigator.of(context).pop(true);
      } else {
        throw Exception('Create failed ${resp.statusCode}');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('❌ Create failed: $e')),
      );
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _priceCtrl.dispose();
    _qtyCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Product'),
        backgroundColor: Colors.white,
        elevation: 1,
        centerTitle: true,
        iconTheme: const IconThemeData(color: Colors.black),
        titleTextStyle: const TextStyle(color: Colors.black, fontSize: 20, fontWeight: FontWeight.bold),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Name
                    _buildTextField(_nameCtrl, 'Product Name', validator: (v) {
                      if (v == null || v.trim().isEmpty) return 'Enter product name';
                      return null;
                    }),
                    const SizedBox(height: 16),

                    // Image Picker
                    GestureDetector(
                      onTap: _pickImages,
                      child: DottedBorder(
                        borderType: BorderType.RRect,
                        radius: const Radius.circular(12),
                        dashPattern: const [6, 3],
                        color: Colors.grey,
                        child: Container(
                          height: 140,
                          alignment: Alignment.center,
                          decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
                          child: _images.isEmpty
                              ? Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: const [
                                    Icon(Icons.add_a_photo, size: 36),
                                    SizedBox(height: 8),
                                    Text('Tap to add images'),
                                  ],
                                )
                              : ListView.builder(
                                  scrollDirection: Axis.horizontal,
                                  itemCount: _images.length,
                                  itemBuilder: (_, i) {
                                    return Padding(
                                      padding: const EdgeInsets.all(8.0),
                                      child: ClipRRect(
                                        borderRadius: BorderRadius.circular(12),
                                        child: Image.file(
                                          File(_images[i].path),
                                          width: 120,
                                          height: 120,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Description
                    _buildTextField(_descCtrl, 'Description', maxLines: 3),
                    const SizedBox(height: 16),

                    // Price & Quantity
                    Row(
                      children: [
                        Expanded(
                          child: _buildTextField(_priceCtrl, 'Price', keyboardType: TextInputType.number, validator: (v) {
                            if (v == null || double.tryParse(v) == null) return 'Enter valid price';
                            return null;
                          }),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildTextField(_qtyCtrl, 'Quantity', keyboardType: TextInputType.number, validator: (v) {
                            if (v == null || int.tryParse(v) == null) return 'Enter valid quantity';
                            return null;
                          }),
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Unit Dropdown
                    _buildDropdown<String>(
                      label: 'Unit',
                      value: _selectedUnit,
                      items: _units,
                      onChanged: (v) => setState(() => _selectedUnit = v),
                    ),
                    const SizedBox(height: 16),

                    // Category Dropdown
                    _buildDropdown<int>(
                      label: 'Category',
                      value: _selectedCategoryId,
                      items: _categories.map((e) => e['name'] as String).toList(),
                      itemIds: _categories.map((e) => e['id'] as int).toList(),
                      onChanged: (v) => setState(() => _selectedCategoryId = v),
                    ),
                    const SizedBox(height: 24),

                    // Save Button
                    ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: const Text('Save Product', style: TextStyle(fontSize: 16)),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildTextField(TextEditingController ctrl, String label,
      {int maxLines = 1, TextInputType? keyboardType, String? Function(String?)? validator}) {
    return TextFormField(
      controller: ctrl,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
    );
  }

  Widget _buildDropdown<T>({
    required String label,
    required T? value,
    required List items,
    List<T>? itemIds,
    required void Function(T?) onChanged,
  }) {
    return DropdownButtonFormField<T>(
      value: value,
      items: List.generate(items.length, (i) {
        final id = itemIds != null ? itemIds[i] : items[i];
        final text = items[i];
        return DropdownMenuItem<T>(value: id, child: Text('$text'));
      }),
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      validator: (v) => v == null ? 'Please select $label' : null,
    );
  }
}
