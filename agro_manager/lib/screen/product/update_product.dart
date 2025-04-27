import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dotted_border/dotted_border.dart';

import '../../models/product.dart';
import '../../service/api_service.dart';

class UpdateProductScreen extends StatefulWidget {
  const UpdateProductScreen({Key? key}) : super(key: key);

  @override
  State<UpdateProductScreen> createState() => _UpdateProductScreenState();
}

class _UpdateProductScreenState extends State<UpdateProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _qtyCtrl = TextEditingController();

  final ImagePicker _picker = ImagePicker();
  List<XFile> _newImages = [];
  List<String> _existingImageUrls = [];

  bool _isLoading = true;
  late int _productId;
  Product? _product;

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

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isLoading) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is Product) {
        _product = args;
        _productId = args.id;
        _populateFields();
        setState(() => _isLoading = false);
      } else if (args is int) {
        _productId = args;
        _fetchProductById();
      }
    }
  }

  Future<void> _fetchProductById() async {
    try {
      final prod = await ApiService.fetchProductById(_productId);
      _product = prod;
      _populateFields();
    } catch (e) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Error fetching product: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _populateFields() {
    if (_product == null) return;
    _nameCtrl.text = _product!.name;
    _descCtrl.text = _product!.description;
    _priceCtrl.text = _product!.price.toString();
    _qtyCtrl.text = _product!.quantity.toString();
    _existingImageUrls = List.from(_product!.imageUrls);
    _selectedUnit = _product!.unit;
    _selectedCategoryId = _product!.categoryId;
  }

  Future<void> _fetchCategories() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rawToken = prefs.getString('token');
      if (rawToken == null) return;
      final auth =
          rawToken.startsWith('Bearer ') ? rawToken : 'Bearer $rawToken';
      final dio = Dio(
        BaseOptions(
          headers: {'Authorization': auth},
          validateStatus: (s) => s! < 500,
        ),
      );
      final resp = await dio.get('http://10.0.2.2:8083/admin/categories');
      if (resp.statusCode == 200) {
        setState(() {
          _categories = List<Map<String, dynamic>>.from(resp.data);
          _selectedCategoryId ??= _categories.first['id'] as int;
        });
      }
    } catch (_) {}
  }

  Future<void> _pickImages() async {
    final picked = await _picker.pickMultiImage(imageQuality: 80);
    if (picked != null && picked.isNotEmpty) {
      setState(() => _newImages.addAll(picked));
    }
  }

  Future<void> _updateProduct() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    try {
      if (_newImages.isNotEmpty) {
        final uploaded = await _uploadImages(_newImages);
        for (var url in uploaded) {
          if (!_existingImageUrls.contains(url)) {
            _existingImageUrls.add(url);
          }
        }
          _newImages.clear();
      }

      final payload = {
        'name': _nameCtrl.text.trim(),
        'description': _descCtrl.text.trim(),
        'price': double.parse(_priceCtrl.text),
        'quantity': int.parse(_qtyCtrl.text),
        'unit': _selectedUnit,
        'categoryId': _selectedCategoryId,
        'imageUrls': _existingImageUrls,
      };

      final prefs = await SharedPreferences.getInstance();
      final rawToken = prefs.getString('token')!;
      final auth =
          rawToken.startsWith('Bearer ') ? rawToken : 'Bearer $rawToken';
      final dio = Dio(
        BaseOptions(
          headers: {'Authorization': auth},
          validateStatus: (s) => s! < 500,
        ),
      );

      final resp = await dio.put(
        'http://10.0.2.2:8083/admin/products/$_productId',
        data: payload,
      );

      if (resp.statusCode! >= 200 && resp.statusCode! < 300) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('🎉 Product updated successfully!')),
        );
        Navigator.of(context).pop(true);
      } else {
        throw Exception('Server error ${resp.statusCode}');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('❌ Update failed: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<List<String>> _uploadImages(List<XFile> images) async {
    final prefs = await SharedPreferences.getInstance();
    final rawToken = prefs.getString('token');
    if (rawToken == null || rawToken.isEmpty)
      throw Exception('Token not found');
    final auth = rawToken.startsWith('Bearer ') ? rawToken : 'Bearer $rawToken';
    final dio = Dio(
      BaseOptions(
        headers: {'Authorization': auth},
        validateStatus: (s) => s! < 500,
      ),
    );
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
        title: const Text('Update Product'),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 1,
        iconTheme: const IconThemeData(color: Colors.black),
        titleTextStyle: const TextStyle(
          color: Colors.black,
          fontSize: 20,
          fontWeight: FontWeight.bold,
        ),
      ),
      body:
          _isLoading
              ? const Center(child: CircularProgressIndicator())
              : SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildTextField(
                        _nameCtrl,
                        'Product Name',
                        validator: (v) {
                          if (v == null || v.trim().isEmpty)
                            return 'Enter product name';
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Image picker + carousel
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
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child:
                                _existingImageUrls.isEmpty && _newImages.isEmpty
                                    ? Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: const [
                                        Icon(Icons.add_a_photo, size: 36),
                                        SizedBox(height: 8),
                                        Text('Tap to add images'),
                                      ],
                                    )
                                    : ListView(
                                      scrollDirection: Axis.horizontal,
                                      children: [
                                        // nút thêm ảnh luôn hiện
                                        GestureDetector(
                                          onTap: _pickImages,
                                          child: Container(
                                            width: 120,
                                            margin: const EdgeInsets.symmetric(
                                              horizontal: 8,
                                            ),
                                            decoration: BoxDecoration(
                                              color: Colors.grey[200],
                                              borderRadius:
                                                  BorderRadius.circular(12),
                                              border: Border.all(
                                                color: Colors.grey,
                                              ),
                                            ),
                                            child: const Center(
                                              child: Icon(
                                                Icons.add_a_photo,
                                                size: 36,
                                                color: Colors.grey,
                                              ),
                                            ),
                                          ),
                                        ),
                                        // hiển thị ảnh cũ
                                        ..._existingImageUrls.map(
                                          (url) => _buildNetworkImage(url),
                                        ),
                                        // hiển thị ảnh mới vừa pick
                                        ..._newImages.map(
                                          (f) => _buildMemoryImage(f),
                                        ),
                                      ],
                                    ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      _buildDropdown<String>(
                        label: 'Unit',
                        value: _selectedUnit,
                        items: _units,
                        onChanged: (v) => setState(() => _selectedUnit = v),
                      ),
                      const SizedBox(height: 16),

                      _buildDropdown<int>(
                        label: 'Category',
                        value: _selectedCategoryId,
                        items:
                            _categories
                                .map((c) => c['name'] as String)
                                .toList(),
                        itemIds:
                            _categories.map((c) => c['id'] as int).toList(),
                        onChanged:
                            (v) => setState(() => _selectedCategoryId = v),
                      ),
                      const SizedBox(height: 24),

                      _buildTextField(_descCtrl, 'Description', maxLines: 3),
                      const SizedBox(height: 16),

                      Row(
                        children: [
                          Expanded(
                            child: _buildTextField(
                              _priceCtrl,
                              'Price',
                              keyboardType: TextInputType.number,
                              validator: (v) {
                                if (v == null || double.tryParse(v) == null)
                                  return 'Enter valid price';
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildTextField(
                              _qtyCtrl,
                              'Quantity',
                              keyboardType: TextInputType.number,
                              validator: (v) {
                                if (v == null || int.tryParse(v) == null)
                                  return 'Enter valid quantity';
                                return null;
                              },
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 30),

                      ElevatedButton(
                        onPressed: _updateProduct,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Save Product',
                          style: TextStyle(fontSize: 16),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
    );
  }

  Widget _buildTextField(
    TextEditingController ctrl,
    String label, {
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
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
        final id = itemIds != null ? itemIds[i] : items[i] as T;
        return DropdownMenuItem<T>(value: id, child: Text('${items[i]}'));
      }),
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      validator: (v) => v == null ? 'Please select $label' : null,
    );
  }

  Widget _buildNetworkImage(String url) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(url, width: 120, height: 120, fit: BoxFit.cover),
      ),
    );
  }

  Widget _buildMemoryImage(XFile file) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: FutureBuilder<Uint8List>(
          future: file.readAsBytes(),
          builder: (_, snap) {
            if (snap.connectionState == ConnectionState.done && snap.hasData) {
              return Image.memory(
                snap.data!,
                width: 120,
                height: 120,
                fit: BoxFit.cover,
              );
            }
            return const SizedBox(
              width: 120,
              height: 120,
              child: Center(child: CircularProgressIndicator()),
            );
          },
        ),
      ),
    );
  }
}
