import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from 'react-native';
import orderService from '../../../service/api/orderService';
import productService from '../../../service/api/productService';
import Icon from 'react-native-vector-icons/AntDesign';

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

interface Order {
    id: number;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    isDeleted: boolean;
    userId: number;
    lineItems: LineItem[];
    shippingAddress: string;
    note: string;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentDate: string | null;
}

interface Product {
    id: number;
    name: string;
    imageUrls: string[];
    price: number;
}

const OrderDetailScreen = ({ navigation, route }: any) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState<Order | null>(null);
    const [products, setProducts] = useState<{ [key: number]: Product }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [hasReview, setHasReview] = useState<boolean>(false);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const hasReview = await orderService.checkReviewStatus(orderId);
            setHasReview(hasReview.data);
            const response = await orderService.getOrderById(orderId);
            const orderData: Order = response.data;
            setOrder(orderData);

            const productIdsSet = new Set<number>();
            orderData.lineItems.forEach((item) => {
                productIdsSet.add(item.productId);
            });
            const productIds = Array.from(productIdsSet);

            const productPromises = productIds.map(async (id) => {
                const res = await productService.getById(id);
                return res.data;
            });
            const productsData: Product[] = await Promise.all(productPromises);
            const productsDict: { [key: number]: Product } = {};
            productsData.forEach((product) => {
                productsDict[product.id] = product;
            });
            setProducts(productsDict);
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOrderDetail();
    }, []);
    useFocusEffect(
        React.useCallback(() => {
            fetchOrderDetail();
        }, [])
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
        return `${day}/${month}/${year}`;
    };

    const renderLineItem = (lineItem: LineItem) => {
        const product = products[lineItem.productId];
        return (
            <View key={lineItem.id} style={styles.lineItemContainer}>
                {product ? (
                    <>
                        <Image source={{ uri: product.imageUrls[0] }} style={styles.productImage} />
                        <View style={styles.productDetails}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productInfo}>{`Số lượng: ${lineItem.quantity}`}</Text>
                            <Text style={styles.productInfo}>{`Giá: ${product.price}`}</Text>
                        </View>
                    </>
                ) : (
                    <Text>{`Đang tải thông tin sản phẩm...`}</Text>
                )}
            </View>
        );
    };

    const canCancelOrder = (order: Order): boolean => {
        const createdDate = new Date(order.createdAt);
        const now = new Date();
        const diffInMinutes = (now.getTime() - createdDate.getTime()) / 60000;
        if (order.paymentMethod === 'PAID') return false;
        if (!['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) return false;
        if (diffInMinutes > 30) return false;
        return true;
    };

    const handleCancelOrder = async () => {
        try {
            const response = await orderService.cancelOrder(orderId);
            Alert.alert('Thông báo', response.data.message || 'Hủy đơn hàng thành công!');
            fetchOrderDetail();
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng.');
        }
    };

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '#FFA500';
            case 'CONFIRMED':
                return '#008000';
            case 'PROCESSING':
                return '#1E90FF';
            case 'SHIPPING':
                return '#FF4500';
            case 'DELIVERED':
                return '#32CD32';
            case 'CANCELED':
                return '#FF0000';
            case 'CANCELED_REQUEST':
                return '#8B0000';
            default:
                return '#808080';
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator size='large' color='#0000ff' style={styles.loader} />
            </SafeAreaView>
        );
    }

    if (!order) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.emptyText}>Không tìm thấy thông tin đơn hàng.</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name='arrowleft' size={24} color='#000' />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
            </View>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.orderDetailContainer}>
                    <Text style={styles.orderTitle}>{`Đơn hàng ngày ${formatDate(order.createdAt)}`}</Text>
                    <Text style={styles.orderInfo}>{`Địa chỉ giao hàng: ${order.shippingAddress}`}</Text>
                    <Text style={styles.orderInfo}>{`Ghi chú: ${order.note}`}</Text>
                    <Text style={styles.orderInfo}>{`Tổng tiền: ${order.totalAmount}`}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.orderInfo}>Trạng thái: </Text>
                        <Text style={[styles.orderInfo, { color: getOrderStatusColor(order.status) }]}>
                            {order.status}
                        </Text>
                    </View>
                    {order.status === 'DELIVERED' &&
                        (!hasReview ? (
                            <TouchableOpacity
                                style={styles.reviewButton}
                                onPress={() =>
                                    navigation.navigate('ReviewScreen', {
                                        lineItems: order.lineItems,
                                        orderId: order.id,
                                    })
                                }
                            >
                                <Text style={styles.reviewButtonText}>Review</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.reviewedText}>Đơn hàng đã được review</Text>
                        ))}

                    <Text style={styles.sectionTitle}>Sản phẩm</Text>
                    {order.lineItems.map(renderLineItem)}
                    {canCancelOrder(order) && (
                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
                            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 50,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    container: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 20,
    },
    orderDetailContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginBottom: 16,
    },
    orderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    orderInfo: {
        fontSize: 14,
        marginBottom: 4,
        color: '#555',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    lineItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    productImage: {
        width: 50,
        height: 50,
        marginRight: 12,
        borderRadius: 4,
    },
    productDetails: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    productInfo: {
        fontSize: 14,
        color: '#666',
    },
    loader: {
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888',
    },
    cancelButton: {
        marginTop: 20,
        backgroundColor: '#FF0000',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    reviewButton: {
        backgroundColor: '#1E90FF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    reviewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    reviewedText: {
        fontSize: 16,
        color: '#32CD32',
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
    },
});

export default OrderDetailScreen;
