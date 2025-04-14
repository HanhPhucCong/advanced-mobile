import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import productService from '../../service/api/productService';
import reviewService from '../../service/api/reviewService';
import orderService from '../../service/api/orderService';

interface LineItem {
    id: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isDeleted: boolean;
    orderId: number;
    cartId: number;
    productId: number;
    quantity: number;
}

interface Product {
    id: number;
    name: string;
    imageUrls: string[];
    price: number;
}

const ReviewScreen = ({ navigation, route }: any) => {
    const { lineItems, orderId } = route.params;
    const [remainingLineItems, setRemainingLineItems] = useState<LineItem[]>(lineItems);
    const [products, setProducts] = useState<{ [key: number]: Product }>({});
    const [reviewInputs, setReviewInputs] = useState<{ [key: number]: { star: string; comment: string } }>({});
    const [hasSubmittedReview, setHasSubmittedReview] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            const uniqueIds = Array.from(new Set(remainingLineItems.map((item) => item.productId)));
            const productsDict: { [key: number]: Product } = {};
            try {
                const productPromises = uniqueIds.map(async (id) => {
                    const res = await productService.getById(id);
                    return res.data;
                });
                const productsData: Product[] = await Promise.all(productPromises);
                productsData.forEach((product) => {
                    productsDict[product.id] = product;
                });
                setProducts(productsDict);
            } catch (error) {
                console.error('Error fetching products in review screen:', error);
            }
        };
        fetchProducts();
    }, [remainingLineItems]);

    const handleInputChange = (productId: number, field: 'star' | 'comment', value: string) => {
        setReviewInputs((prev) => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value,
            },
        }));
    };

    const handleSubmitReview = async (lineItem: LineItem) => {
        const productId = lineItem.productId;
        const reviewData = reviewInputs[productId];
        if (!reviewData || !reviewData.star || !reviewData.comment) {
            showMessage({
                message: 'Thiếu thông tin',
                description: 'Vui lòng nhập cả rating và bình luận.',
                type: 'danger',
                duration: 4000,
                position: 'top',
            });
            return;
        }
        const star = parseFloat(reviewData.star);
        if (isNaN(star) || star < 0 || star > 5) {
            showMessage({
                message: 'Giá trị không hợp lệ',
                description: 'Rating phải là số từ 0 đến 5.',
                type: 'danger',
                duration: 4000,
                position: 'top',
            });
            return;
        }
        try {
            await reviewService.createReview(productId, { star, comment: reviewData.comment });
            showMessage({
                message: 'Thành công',
                description: 'Review đã được gửi thành công. Bạn vừa nhận được 1000 xu!',
                type: 'success',
                duration: 4000,
                position: 'top',
            });
            setRemainingLineItems((prev) => prev.filter((item) => item.id !== lineItem.id));
            setReviewInputs((prev) => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
            if (!hasSubmittedReview) {
                setHasSubmittedReview(true);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showMessage({
                message: 'Lỗi',
                description: 'Không thể gửi review, vui lòng thử lại sau.',
                type: 'danger',
                duration: 4000,
                position: 'top',
            });
        }
    };

    const handleBack = async () => {
        if (hasSubmittedReview) {
            try {
                await orderService.markOrderAsReviewed(orderId);
            } catch (error) {
                console.error('Error marking order as reviewed:', error);
                showMessage({
                    message: 'Lỗi',
                    description: 'Không thể cập nhật trạng thái review của đơn hàng.',
                    type: 'danger',
                    duration: 4000,
                    position: 'top',
                });
            }
        }
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.title}>Review Sản phẩm</Text>
                {remainingLineItems.length === 0 ? (
                    <Text style={styles.infoText}>Bạn đã review hết các sản phẩm.</Text>
                ) : (
                    remainingLineItems.map((lineItem) => {
                        const product = products[lineItem.productId];
                        if (!product) {
                            return <Text key={lineItem.id}>Đang tải thông tin sản phẩm...</Text>;
                        }
                        return (
                            <View key={lineItem.id} style={styles.productContainer}>
                                <Image source={{ uri: product.imageUrls[0] }} style={styles.productImage} />
                                <View style={styles.productDetails}>
                                    <Text style={styles.productName}>{product.name}</Text>
                                    <Text style={styles.productInfo}>{`Giá: ${product.price}`}</Text>
                                    <Text style={styles.productInfo}>{`Số lượng: ${lineItem.quantity}`}</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Rating (0-5)'
                                        keyboardType='numeric'
                                        value={reviewInputs[product.id]?.star || ''}
                                        onChangeText={(text) => handleInputChange(product.id, 'star', text)}
                                    />
                                    <TextInput
                                        style={styles.input}
                                        placeholder='Bình luận'
                                        value={reviewInputs[product.id]?.comment || ''}
                                        onChangeText={(text) => handleInputChange(product.id, 'comment', text)}
                                    />
                                    <TouchableOpacity
                                        style={styles.submitButton}
                                        onPress={() => handleSubmitReview(lineItem)}
                                    >
                                        <Text style={styles.submitButtonText}>Gửi Review</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        padding: 16,
        backgroundColor: '#fff',
        flexGrow: 1,
        marginTop: 50,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        textAlign: 'center',
        marginVertical: 20,
    },
    productContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    productInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 8,
        marginBottom: 8,
    },
    submitButton: {
        backgroundColor: '#1E90FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    backButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ReviewScreen;
