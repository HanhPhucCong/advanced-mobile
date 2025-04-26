import 'user.dart';

class LineItem {
  final int id;
  final int productId;
  final int quantity;

  LineItem({required this.id, required this.productId, required this.quantity});

  factory LineItem.fromJson(Map<String, dynamic> json) {
    return LineItem(
      id: json['id'],
      productId: json['productId'],
      quantity: json['quantity'],
    );
  }
}

class Order {
  final int id;
  final int userId;
  final String createdAt;
  final String shippingAddress;
  final String note;
  final String phoneNumber;
  final double totalAmount;
  String status;
  final String paymentMethod;
  final List<LineItem> lineItems;
  User? user; // 🆕 Thêm thuộc tính user

  Order({
    required this.id,
    required this.userId,
    required this.createdAt,
    required this.shippingAddress,
    required this.note,
    required this.phoneNumber,
    required this.totalAmount,
    required this.status,
    required this.paymentMethod,
    required this.lineItems,
    this.user,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    var items =
        (json['lineItems'] as List)
            .map((item) => LineItem.fromJson(item))
            .toList();

    return Order(
      id: json['id'],
      userId: json['userId'],
      createdAt: json['createdAt'],
      shippingAddress: json['shippingAddress'],
      note: json['note'],
      phoneNumber: json['phoneNumber'],
      totalAmount: (json['totalAmount'] as num).toDouble(),
      status: json['status'],
      paymentMethod: json['paymentMethod'],
      lineItems: items,
    );
  }
}
