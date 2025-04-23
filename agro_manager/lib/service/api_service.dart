import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../constants/api_constants.dart';
import '../models/product.dart';
import '../models/user.dart';

class ApiService {
  /// Fetches all active products
  static Future<List<Product>> fetchAllActiveProducts() async {
    final uri = Uri.parse(ApiConstants.getAllProducts);
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final body = json.decode(response.body);
      final List content = body['data']['content'];
      return content.map((e) => Product.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load products (${response.statusCode})');
    }
  }

  /// Fetches a product by its ID
  static Future<Product> fetchProductById(int id) async {
    final uri = Uri.parse(ApiConstants.getDetailProduct + id.toString());
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final body = json.decode(response.body);
      return Product.fromJson(body['data']);
    } else {
      throw Exception('Failed to fetch product #$id (status ${response.statusCode})');
    }
  }

  /// Creates a new product
  static Future<Product> createProduct(Product product) async {
    final uri = Uri.parse(ApiConstants.createProduct);
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'quantity': product.quantity,
      }),
    );
    if (response.statusCode == 200 || response.statusCode == 201) {
      final body = json.decode(response.body);
      // Giả sử API trả về data chứa object sản phẩm vừa tạo
      return Product.fromJson(body['data']);
    } else {
      throw Exception('Create failed (${response.statusCode})');
    }
  }

  /// Updates an existing product
  static Future<void> updateProduct(Product product) async {
    final uri = Uri.parse(ApiConstants.updateProduct + '/${product.id}');
    final response = await http.put(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: json.encode({
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'quantity': product.quantity,
      }),
    );
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Update failed (${response.statusCode})');
    }
  }

  /// Uploads multiple images for a product, returns list of uploaded image URLs
  static Future<List<String>> uploadProductImages(int productId, List<XFile> files) async {
    final uri = Uri.parse('${ApiConstants.baseUrl}/api/products/$productId/images');
    final request = http.MultipartRequest('POST', uri);

    for (final file in files) {
      final bytes = await file.readAsBytes();
      request.files.add(
        http.MultipartFile.fromBytes(
          'images',
          bytes,
          filename: file.name,
        ),
      );
    }

    final streamedResponse = await request.send();
    final responseString = await streamedResponse.stream.bytesToString();

    if (streamedResponse.statusCode == 200) {
      final body = json.decode(responseString);
      return List<String>.from(body['data']);
    } else {
      throw Exception('Image upload failed (${streamedResponse.statusCode})');
    }
  }
  static Future<List<User>> getAllUsers() async {
    final res = await http.get(Uri.parse(ApiConstants.getAllUsers));
    if (res.statusCode == 200) {
      List data = json.decode(res.body);
      return data.map((json) => User.fromJson(json)).toList();
    } else {
      throw Exception('Failed to load users');
    }
  }

  static Future<User> getUserDetail(int id) async {
    final res = await http.get(Uri.parse('${ApiConstants.getDetailUser}$id'));
    if (res.statusCode == 200) {
      return User.fromJson(json.decode(res.body));
    } else {
      throw Exception('Failed to load user detail');
    }
  }

  static Future<void> blockUser(int id) async {
    await http.delete(Uri.parse('${ApiConstants.blockUser}$id'));
  }

  static Future<void> unblockUser(int id) async {
    await http.patch(Uri.parse('${ApiConstants.unblockUser}$id'));
  }
}