class Product {
  final int id;
  final String name;
  final String description;
  final double price;
  final int quantity;
  final String unit;
  final int categoryId;
  final List<String> imageUrls;
  final bool isActive;
  final bool isDeleted;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.quantity,
    required this.unit,
    required this.categoryId,
    required this.imageUrls,
    required this.isActive,
    required this.isDeleted,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'],
      unit: json['unit'] as String,
      categoryId: json['categoryId'] as int,
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
      isActive: json['isActive'] as bool? ?? false,
      isDeleted: json['isDeleted'] as bool? ?? false,
    );
  }
}
