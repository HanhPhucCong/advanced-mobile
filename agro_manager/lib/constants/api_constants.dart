class ApiConstants {
  static const String baseUrl = "http://localhost:8083";
//   static const String baseUrl = "http://10.0.2.2:8083";

  // ================== Product APIs ==================
  static const String getAllProducts = "$baseUrl/api/public/products/all-active"; // GET
  static const String getDetailProduct = "$baseUrl/api/public/products/"; // GET
  static const String createProduct = "$baseUrl/api/products"; // POST
  static const String updateProduct = "$baseUrl/products"; // PUT

  // ================== User APIs ==================
  static const String getAllUsers = "$baseUrl/admin/user"; // GET
  static const String getDetailUser = "$baseUrl/admin/user/";
  static const String blockUser = "$baseUrl/admin/user/"; // DELETE id 
  static const String unblockUser = "$baseUrl/admin/user/restore/"; // PATCH id 


  // ================== Category APIs ==================
  static const String getAllCategories = "$baseUrl/admin/categories"; // GET
  static const String createCategory = "$baseUrl/admin/categories"; // POST
  static const String updateCategory = "$baseUrl/admin/categories/"; // PUT id 
  static const String blockCategory = "$baseUrl/admin/categories/"; // DELETE id
  static const String restoreCategory = "$baseUrl/admin/categories/restore/"; // PATCH  id

}
