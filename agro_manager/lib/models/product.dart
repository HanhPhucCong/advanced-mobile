class Product {
  final int id;
  final String name;
  final String description;
  final double price;
  final int quantity;
  final List<String> imageUrls;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.quantity,
    required this.imageUrls,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'],
      imageUrls: List<String>.from(json['imageUrls'] ?? []),
    );
  }
}
