package org.agromarket.agro_server.service.customer.Impl;

import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.agromarket.agro_server.exception.CustomException;
import org.agromarket.agro_server.exception.NotFoundException;
import org.agromarket.agro_server.model.dto.response.CartResponse;
import org.agromarket.agro_server.model.entity.Cart;
import org.agromarket.agro_server.model.entity.LineItem;
import org.agromarket.agro_server.model.entity.Product;
import org.agromarket.agro_server.model.entity.User;
import org.agromarket.agro_server.repositories.customer.CartRepository;
import org.agromarket.agro_server.repositories.customer.LineItemRepository;
import org.agromarket.agro_server.repositories.customer.ProductRepository;
import org.agromarket.agro_server.service.customer.CartService;
import org.agromarket.agro_server.util.mapper.CartMapper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartServiceImpl implements CartService {

  private final CartRepository cartRepository;
  private final ProductRepository productRepository;
  private final LineItemRepository lineItemRepository;
  private final CartMapper cartMapper;

  @Transactional
  @Override
  public CartResponse adjustQuantity(long productId, int quantityChange) {
    if (quantityChange != 1 && quantityChange != -1) {
      throw new CustomException("Invalid quantity change! Must be +1 or -1.", 400);
    }

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    User currUser = (User) authentication.getPrincipal();

    Cart cart = cartRepository.findByUserId(currUser.getId());
    if (cart == null) {
      cart = new Cart();
      cart.setUser(currUser);
      currUser.setCart(cart);
      cartRepository.save(cart);
    }

    Product product =
        productRepository
            .findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

    Optional<LineItem> existingLineItem =
        cart.getLineItems().stream()
            .filter(item -> item.getProduct().getId() == productId)
            .findFirst();

    if (existingLineItem.isPresent()) {
      LineItem lineItem = existingLineItem.get();
      int newQuantity = lineItem.getQuantity() + quantityChange;

      // +1 and out of stock
      if (quantityChange == 1 && newQuantity > product.getQuantity()) {
        throw new CustomException("The quantity of products in stock is no longer enough!", 400);
      }

      // -1 and <=0
      if (newQuantity <= 0) {
        cart.getLineItems().remove(lineItem);
        lineItemRepository.delete(lineItem);
      } else {
        lineItem.setQuantity(newQuantity);
        lineItemRepository.save(lineItem);
      }
    }
    // +1 and chua co trong gio hang
    else if (quantityChange == 1) {
      if (product.getQuantity() < 1) {
        throw new CustomException("The quantity of products in stock is no longer enough!", 400);
      }

      LineItem newLineItem = new LineItem();
      newLineItem.setCart(cart);
      newLineItem.setQuantity(1);
      newLineItem.setProduct(product);
      cart.getLineItems().add(newLineItem);
      lineItemRepository.save(newLineItem);
    }
    // -1 and chua co trong gio hang
    else {
      throw new CustomException("Product is not in Cart!", 400);
    }

    cartRepository.save(cart);
    return cartMapper.convertToResponse(cart);
  }

  @Transactional
  @Override
  public CartResponse updateQuantity(long productId, int quantity) {
    if (quantity <= 0) {
      throw new CustomException("Invalid quantity. Quantity must be greater than 0!", 400);
    }

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    User currUser = (User) authentication.getPrincipal();

    Cart cart = cartRepository.findByUserId(currUser.getId());
    if (cart == null) {
      cart = new Cart();
      cart.setUser(currUser);
      currUser.setCart(cart);
      cartRepository.save(cart);
    }
    Product product =
        productRepository
            .findById(productId)
            .orElseThrow(() -> new NotFoundException("Product not found with id: " + productId));

    if (product.getQuantity() < quantity) {
      throw new CustomException("The quantity of products in stock is no longer enough!", 400);
    }

    Optional<LineItem> existingLineItem =
        cart.getLineItems().stream()
            .filter(item -> item.getProduct().getId() == productId)
            .findFirst();
    if (existingLineItem.isPresent()) {
      LineItem lineItem = existingLineItem.get();
      lineItem.setQuantity(quantity);
    } else {
      LineItem newLineItem = new LineItem();
      newLineItem.setCart(cart);
      newLineItem.setQuantity(quantity);
      newLineItem.setProduct(product);
      cart.getLineItems().add(newLineItem);
      lineItemRepository.save(newLineItem);
    }

    cartRepository.save(cart);

    return cartMapper.convertToResponse(cart);
  }

  @Override
  public CartResponse getCartByCurrenUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    User currUser = (User) authentication.getPrincipal();

    Cart cart = cartRepository.findByUserId(currUser.getId());
    if (cart == null) {
      cart = new Cart();
      cart.setUser(currUser);
      currUser.setCart(cart);
      cartRepository.save(cart);
    }
    return cartMapper.convertToResponse(cart);
  }

  @Override
  public CartResponse removeFromCart(long lineItemId) {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    User currUser = (User) authentication.getPrincipal();

    Cart cart = cartRepository.findByUserId(currUser.getId());
    if (cart == null) {
      cart = new Cart();
      cart.setUser(currUser);
      currUser.setCart(cart);
      cartRepository.save(cart);
    }

    LineItem lineItem =
        lineItemRepository
            .findById(lineItemId)
            .orElseThrow(() -> new NotFoundException("LineItem not found with id: " + lineItemId));

    if (!cart.getLineItems().contains(lineItem)) {
      throw new CustomException("This LineItem does not belong to the user's cart!", 403);
    }

    cart.getLineItems().remove(lineItem);
    lineItemRepository.delete(lineItem);

    cartRepository.save(cart);

    return cartMapper.convertToResponse(cart);
  }

  @Override
  public CartResponse clearCart() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    User currUser = (User) authentication.getPrincipal();

    Cart cart = cartRepository.findByUserId(currUser.getId());
    if (cart == null) {
      cart = new Cart();
      cart.setUser(currUser);
      currUser.setCart(cart);
      cartRepository.save(cart);
    }

    cart.getLineItems().clear();
    lineItemRepository.deleteAllByCartId(cart.getId());

    cartRepository.save(cart);

    return cartMapper.convertToResponse(cart);
  }

  @Override
  public Double totalPrice() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    User currUser = (User) authentication.getPrincipal();

    Cart cart = cartRepository.findByUserId(currUser.getId());
    if (cart == null) {
      cart = new Cart();
      cart.setUser(currUser);
      currUser.setCart(cart);
      cartRepository.save(cart);
      return 0.0;
    }
    return cart.getLineItems().stream()
        .mapToDouble(item -> item.getProduct().getPrice() * item.getQuantity())
        .sum();
  }
}
