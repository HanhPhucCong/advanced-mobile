package org.agromarket.agro_server.service.customer.Impl;

import lombok.RequiredArgsConstructor;
import org.agromarket.agro_server.common.Role;
import org.agromarket.agro_server.exception.CustomException;
import org.agromarket.agro_server.exception.NotFoundException;
import org.agromarket.agro_server.model.dto.request.ReviewRequest;
import org.agromarket.agro_server.model.dto.response.ReviewResponse;
import org.agromarket.agro_server.model.entity.Product;
import org.agromarket.agro_server.model.entity.Review;
import org.agromarket.agro_server.model.entity.User;
import org.agromarket.agro_server.repositories.customer.ProductRepository;
import org.agromarket.agro_server.repositories.customer.ReviewRepository;
import org.agromarket.agro_server.repositories.customer.UserRepository;
import org.agromarket.agro_server.service.customer.ReviewService;
import org.agromarket.agro_server.util.mapper.ReviewMapper;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final ReviewMapper reviewMapper;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse createReview(Long productId, ReviewRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();

        Product product = productRepository.getActiveProductById(productId);
        if (product == null) {
            throw new NotFoundException("Product not found!");
        }

//    List<Review> existedReviewByUser = reviewRepository.getAllByUser(currUser.getId());
//    if (!existedReviewByUser.isEmpty()) {
//      throw new CustomException("You can only add 1 review in 1 product!", 409);
//    }
        currUser.setCoin(currUser.getCoin() + 1000);
        userRepository.save(currUser);

        Review review = new Review();
        review.setProduct(product);
        review.setUser(currUser);
        review.setComment(request.getComment());
        review.setRating(request.getStar());

        return reviewMapper.convertToResponse(reviewRepository.save(review));
    }

    @Override
    public List<ReviewResponse> getAllReview(Pageable pageable, Long productId) {
        Product product = productRepository.getActiveProductById(productId);
        if (product == null) {
            throw new NotFoundException("Product not found!");
        }
        return reviewRepository.getActiveReviewsByProductId(productId, pageable).stream()
                .sorted((r1, r2) -> r2.getCreatedAt().compareTo(r1.getCreatedAt())) // sort: mới nhất trước
                .map(reviewMapper::convertToResponse)
                .toList();
    }

    @Override
    public ReviewResponse getById(long reviewId) {
        Review review = reviewRepository.getByIdAndIsActiveTrueAndIsDeletedFalse(reviewId);
        if (review == null) {
            throw new NotFoundException("Review not found!");
        }
        return reviewMapper.convertToResponse(review);
    }

    @Override
    public ReviewResponse update(long reviewId, ReviewRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        Review review = reviewRepository.getByIdAndIsActiveTrueAndIsDeletedFalse(reviewId);
        if (review == null) {
            throw new NotFoundException("Review not found!");
        }

        boolean isOwner = currUser.getId() == review.getUser().getId();
        if (!isOwner) {
            throw new CustomException(
                    "You dont have permission to update this review", HttpStatus.BAD_REQUEST.value());
        }
        review.setRating(request.getStar());
        review.setComment(request.getComment());

        return reviewMapper.convertToResponse(reviewRepository.save(review));
    }

    @Override
    public ReviewResponse toggleSoftDelete(boolean flag, long reviewId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currUser = (User) authentication.getPrincipal();
        Review review =
                reviewRepository
                        .findById(reviewId)
                        .orElseThrow(() -> new NotFoundException("Review not found!"));

        boolean isOwner = currUser.getId() == review.getUser().getId();
        boolean isAdmin = currUser.getRole().equals(Role.ADMIN);
        if (!isOwner && !isAdmin) {
            throw new CustomException(
                    "You dont have permission to change status for this review",
                    HttpStatus.BAD_REQUEST.value());
        }

        review.setIsDeleted(flag);
        return reviewMapper.convertToResponse(reviewRepository.save(review));
    }

    @Override
    public ReviewResponse forceDelete(long reviewId) {
        Review review =
                reviewRepository
                        .findById(reviewId)
                        .orElseThrow(() -> new NotFoundException("Review not found!"));
        ReviewResponse response = reviewMapper.convertToResponse(review);
        reviewRepository.delete(review);
        return response;
    }
}
