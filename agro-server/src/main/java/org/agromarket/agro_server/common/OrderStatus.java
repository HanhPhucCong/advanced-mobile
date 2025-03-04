package org.agromarket.agro_server.common;

public enum OrderStatus {
  PENDING,
  CONFIRMED,
  PROCESSING,
  SHIPPING,
  DELIVERED,
  CANCELED,
  CANCELED_REQUEST
}

// PENDING -> CONFIRMED -> PROCESSING -> SHIPPING -> DELIVERED

// checkout by COD : PENDING -> admin CONFIRMED
// checkout by CARD: PENDING -> pay success -> CONFIRMED

// CANCEL: within 30m after:
//                          PENDING: ok;
//                          CONFIRMED || PROCESSING: send request -> admin approve/reject
//                          others status: no

// CONFIRMED -> 30m -> PROCESSING -> 30m -> SHIPPING -> 30m -> DELIVERED
