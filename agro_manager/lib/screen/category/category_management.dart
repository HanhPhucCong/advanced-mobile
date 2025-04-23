import 'dart:convert';
import 'package:flutter/material.dart';
import '../../constants/api_constants.dart';
import 'package:http/http.dart' as http;

// === Model ===
class Category {
  final int id;
  final String name;
  final bool isDeleted;

  Category({
    required this.id,
    required this.name,
    required this.isDeleted,
  });

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'],
        name: json['name'],
        isDeleted: json['isDeleted'],
      );
}

// === Service ===
class CategoryService {
  static Future<List<Category>> fetchAll() async {
    final res = await http.get(Uri.parse(ApiConstants.getAllCategories));
    if (res.statusCode == 200) {
      final List data = json.decode(res.body);
      return data.map((e) => Category.fromJson(e)).toList();
    }
    throw Exception('Failed to load categories');
  }

  static Future<void> create(String name) async {
    final res = await http.post(
      Uri.parse(ApiConstants.createCategory),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'name': name}),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) throw Exception('Create failed');
  }

  static Future<void> update(int id, String name) async {
    final res = await http.put(
      Uri.parse('${ApiConstants.updateCategory}$id'),
      headers: {'Content-Type': 'application/json'},
      body: json.encode({'name': name}),
    );
    if (res.statusCode < 200 || res.statusCode >= 300) throw Exception('Update failed');
  }

  static Future<void> delete(int id) async {
    final res = await http.delete(Uri.parse('${ApiConstants.blockCategory}$id'));
    if (res.statusCode < 200 || res.statusCode >= 300) throw Exception('Delete failed');
  }

  static Future<void> restore(int id) async {
    final res = await http.patch(Uri.parse('${ApiConstants.restoreCategory}$id'));
    if (res.statusCode < 200 || res.statusCode >= 300) throw Exception('Restore failed');
  }
}

// === Screen ===
class CategoryManagementScreen extends StatefulWidget {
  const CategoryManagementScreen({Key? key}) : super(key: key);

  @override
  _CategoryManagementScreenState createState() => _CategoryManagementScreenState();
}

class _CategoryManagementScreenState extends State<CategoryManagementScreen> {
  late Future<List<Category>> _futureCategories;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    setState(() {
      _futureCategories = CategoryService.fetchAll();
    });
  }

  Future<void> _showForm({Category? cat}) async {
    final nameCtrl = TextEditingController(text: cat?.name);
    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(cat == null ? 'Add Category' : 'Edit Category'),
        content: TextField(
          controller: nameCtrl,
          decoration: const InputDecoration(
            labelText: 'Name',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              final name = nameCtrl.text.trim();
              if (name.isEmpty) return;
              Navigator.pop(context);
              try {
                if (cat == null) {
                  await CategoryService.create(name);
                } else {
                  await CategoryService.update(cat.id, name);
                }
                _load();
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Error: \$e')),
                );
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Category Management'),
        backgroundColor: Colors.white,
        elevation: 2,
        iconTheme: const IconThemeData(color: Colors.black87),
      ),
      body: FutureBuilder<List<Category>>(
        future: _futureCategories,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: \${snapshot.error}'));
          }
          final categories = snapshot.data!;
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: categories.length + 1,
            itemBuilder: (_, i) {
              if (i == 0) {
                return const Padding(
                  padding: EdgeInsets.only(bottom: 12),
                  child: Text(
                    '💡 Kéo Catelory sang trái để chỉnh sửa',
                    style: TextStyle(color: Colors.grey),
                  ),
                );
              }

              final cat = categories[i - 1];
              return Dismissible(
                key: ValueKey(cat.id),
                background: Container(
                  color: cat.isDeleted ? Colors.green : Colors.red,
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Icon(cat.isDeleted ? Icons.restore : Icons.delete, color: Colors.white),
                ),
                secondaryBackground: Container(
                  color: Colors.blue,
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: const Icon(Icons.edit, color: Colors.white),
                ),
                confirmDismiss: (dir) async {
                  try {
                    if (dir == DismissDirection.startToEnd) {
                      if (cat.isDeleted) {
                        await CategoryService.restore(cat.id);
                      } else {
                        await CategoryService.delete(cat.id);
                      }
                    } else if (dir == DismissDirection.endToStart) {
                      await _showForm(cat: cat);
                    }
                    _load();
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Error: $e')),
                    );
                  }
                  return false;
                },
                child: Card(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 2,
                  child: ListTile(
                    title: Text(cat.name, style: const TextStyle(fontSize: 18)),
                    leading: CircleAvatar(
                      backgroundColor: cat.isDeleted ? Colors.red[100] : Colors.teal[100],
                      child: Icon(
                        cat.isDeleted ? Icons.delete : Icons.category,
                        color: cat.isDeleted ? Colors.red : Colors.teal,
                      ),
                    ),
                    trailing: IconButton(
                      icon: Icon(cat.isDeleted ? Icons.restore : Icons.delete),
                      color: cat.isDeleted ? Colors.green : Colors.red,
                      onPressed: () async {
                        try {
                          if (cat.isDeleted) {
                            await CategoryService.restore(cat.id);
                          } else {
                            await CategoryService.delete(cat.id);
                          }
                          _load();
                        } catch (e) {
                          ScaffoldMessenger.of(context)
                              .showSnackBar(SnackBar(content: Text('Error: $e')));
                        }
                      },
                    ),
                  ),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showForm(),
        backgroundColor: Colors.teal,
        child: const Icon(Icons.add),
      ),
    );
  }
}
