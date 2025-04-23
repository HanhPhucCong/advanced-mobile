class User {
  final int id;
  final String fullName;
  final String email;
  final String? phoneNumber;
  final String? address;
  final String? dateOfBirth;
  final String? avatarUrl;
  final int orders;
  final bool isDeleted;

  User({
    required this.id,
    required this.fullName,
    required this.email,
    this.phoneNumber,
    this.address,
    this.dateOfBirth,
    this.avatarUrl,
    required this.orders,
    required this.isDeleted,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      fullName: json['fullName'],
      email: json['email'],
      phoneNumber: json['phoneNumber'],
      address: json['address'],
      dateOfBirth: json['dateOfBirth'],
      avatarUrl: json['avatarUrl'],
      orders: json['orders'],
      isDeleted: json['isDeleted'],
    );
  }
}
