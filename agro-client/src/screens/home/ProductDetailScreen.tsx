import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import formatCurrency from '../../utils/formatCurrency';
import cartService from '../../service/api/cartService';
import favoriteService from '../../service/api/favoriteService';
import { showMessage, hideMessage } from 'react-native-flash-message';
import reviewService from '../../service/api/reviewService';
import Iconcc from 'react-native-vector-icons/FontAwesome';

// lấy chiều rộng màn hình để làm slideshow, css các kiểu
const { width } = Dimensions.get('window');

interface Product {
    id: number;
    name: string;
    description: string;
    purchaseCount: number;
    price: number;
    unit: string;
    imageUrls: string[];
    quantity: number;
}
interface Review {
    id: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isDeleted: boolean;
    ownerId: number;
    productId: number;
    star: number;
    comment: string;
}

type ProductDetailRouteProp = RouteProp<{ ProductDetail: { product: Product } }, 'ProductDetail'>;

const ProductDetailScreen = () => {
    const route = useRoute<ProductDetailRouteProp>();
    const { product } = route.params;
    const navigation = useNavigation();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeSlide, setActiveSlide] = useState(0);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await reviewService.getAllReviewByProductId(product.id);
                setReviews(response.data);
            } catch (error) {
                console.error('Failed to fetch reviews:', error);
            }
        };
        fetchReviews();
    }, [product.id]);
    // event.nativeEvent.contentOffset.x: toạ đọ X hiện tại
    const handleScroll = (event: any) => {
        const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
        setActiveSlide(slideIndex);
    };
    const reviewCount = reviews.length;
    const avgRating = reviewCount > 0 ? reviews.reduce((sum, review) => sum + review.star, 0) / reviewCount : 0;
    const handleAddToCart = async () => {
        if (product.quantity === 0) {
            showMessage({
                message: 'This product is out of stock!',
                type: 'danger',
                backgroundColor: '#dc3545',
            });
            return;
        }

        try {
            await cartService.addToCart(product.id);
            showMessage({
                message: 'Added to cart successfully!',
                type: 'success',
                backgroundColor: '#28a745',
            });
        } catch (error: any) {
            showMessage({
                message: error.response?.data?.message || 'Failed to add to cart!',
                type: 'danger',
                backgroundColor: '#dc3545',
            });
        }
    };

    const handleAddToFavorite = async () => {
        try {
            await favoriteService.addToFavorite(product.id);
            showMessage({
                message: 'Added to favorites successfully!',
                type: 'success',
                backgroundColor: '#ff5733',
            });
        } catch (error: any) {
            showMessage({
                message: error.response?.data?.message || 'Failed to add to favorites!',
                type: 'danger',
                backgroundColor: '#dc3545',
            });
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* Nút Back */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name='arrowleft' size={24} color='#000' />
            </TouchableOpacity>

            {/* Slideshow hình ảnh (kéo tay) */}
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.imageContainer}
            >
                {product.imageUrls.map((image, index) => (
                    <Image key={index} source={{ uri: image }} style={styles.image} />
                ))}
            </ScrollView>

            {/* Pagination (dấu chấm) */}
            <View style={styles.pagination}>
                {product.imageUrls.map((_, index) => (
                    <View key={index} style={[styles.dot, activeSlide === index && styles.activeDot]} />
                ))}
            </View>

            {/* Thông tin sản phẩm */}
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.price}>
                    {formatCurrency(product.price)} <Text style={styles.unit}>/ {product.unit}</Text>
                </Text>
                <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>
                        Rating: {avgRating.toFixed(1)} ({reviewCount} reviews)
                    </Text>
                </View>
                <Text style={[styles.quantity, product.quantity === 0 && styles.outOfStock]}>
                    {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of stock'}
                </Text>
                <Text style={styles.purchaseCount}>Purchased: {product.purchaseCount}</Text>
                <Text style={styles.description}>{product.description}</Text>
            </View>

            {/* Nút chức năng */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.favoriteButton} onPress={handleAddToFavorite}>
                    <Icon name='hearto' size={20} color='#ff5733' />
                    <Text style={styles.buttonText}>Favorite</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.cartButton, product.quantity === 0 && styles.disabledButton]}
                    onPress={handleAddToCart}
                    disabled={product.quantity === 0}
                >
                    <Icon name='shoppingcart' size={20} color='#fff' />
                    <Text style={styles.buttonTextWhite}>Add to Cart</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.reviewContainer}>
                <Text style={styles.reviewTitle}>Reviews</Text>
                {reviews.length > 0 ? (
                    displayedReviews.map((review) => (
                        <View key={review.id} style={styles.reviewItem}>
                            <View style={styles.reviewHeader}>
                                <Iconcc name='user-circle' size={30} color='#555' style={styles.userIcon} />
                                <Text style={styles.reviewStar}>
                                    {Array(5)
                                        .fill(0)
                                        .map((_, index) => (index < review.star ? '★' : '☆'))
                                        .join('')}
                                </Text>
                            </View>
                            <Text style={styles.reviewComment}>{review.comment}</Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noReview}>No reviews yet.</Text>
                )}
                {reviews.length > 2 && (
                    <TouchableOpacity onPress={() => setShowAllReviews(!showAllReviews)}>
                        <Text style={styles.viewMore}>{showAllReviews ? 'View Less' : 'View More'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 8,
        borderRadius: 50,
        zIndex: 10,
    },
    imageContainer: { width, height: 300 },
    image: { width, height: 300, resizeMode: 'cover' },
    pagination: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ddd', marginHorizontal: 4 },
    activeDot: { backgroundColor: '#ff5733' },
    infoContainer: { paddingHorizontal: 16, marginTop: 20 },
    name: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'left' },
    price: { fontSize: 18, color: '#ff5733', marginBottom: 10, textAlign: 'left' },
    unit: { fontSize: 16, color: '#777' },
    description: { fontSize: 16, color: '#555', textAlign: 'left' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 16 },
    favoriteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ff5733',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    cartButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ff5733',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: { marginLeft: 8, fontSize: 16, color: '#ff5733' },
    buttonTextWhite: { marginLeft: 8, fontSize: 16, color: '#fff' },
    quantity: { fontSize: 14, color: '#555', marginBottom: 10 },
    outOfStock: { color: '#dc3545', fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#ccc' },
    ratingContainer: {
        marginBottom: 10,
    },
    ratingText: {
        fontSize: 16,
        color: '#ff5733',
        fontWeight: 'bold',
    },
    reviewContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    reviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    reviewItem: {
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 12,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userIcon: {
        marginRight: 8,
    },
    reviewStar: {
        fontSize: 16,
        color: '#FFD700',
    },
    reviewComment: {
        fontSize: 14,
        color: '#333',
        marginLeft: 38,
    },
    noReview: {
        fontSize: 14,
        color: '#666',
        fontStyle: 'italic',
    },
    viewMore: {
        fontSize: 14,
        color: '#007BFF',
        textAlign: 'center',
        marginTop: 8,
    },
    purchaseCount: {
        fontSize: 15,
        color: 'black',
    },
});

export default ProductDetailScreen;
