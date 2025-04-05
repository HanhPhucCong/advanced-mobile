import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import orderService from '../../../service/api/orderService';
import productService from '../../../service/api/productService';
import Icon from 'react-native-vector-icons/AntDesign';
import couponService from '../../../service/api/couponService';

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

interface Coupon {
    code: string;
    expirationDate: string;
    minimumOrderAmount: number;
    type: string;
    discountValue: number;
    userId: number;
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
    coupon: Coupon | null;
}

interface Product {
    id: number;
    name: string;
    imageUrls: string[];
    price: number;
}

const ListOrderScreen = ({ navigation }: any) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<{ [key: number]: Product }>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

    const statuses: string[] = [
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPING',
        'DELIVERED',
        'CANCELED',
        'CANCELED_REQUEST',
    ];
    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            PENDING: 'Chờ xác nhận',
            CONFIRMED: 'Đã xác nhận',
            PROCESSING: 'Đang xử lý',
            SHIPPING: 'Đang vận chuyển',
            DELIVERED: 'Đã giao hàng',
            CANCELED: 'Đã hủy',
            CANCELED_REQUEST: 'Yêu cầu hủy',
        };
        return labels[status] || status;
    };

    const fetchOrdersAndProducts = async () => {
        setLoading(true);
        try {
            const response = await orderService.getMyOrder();
            const ordersData: Order[] = response.data || [];

            // Không cần gọi API coupon, vì coupon đã có sẵn trong OrderResponse
            setOrders(ordersData);

            // Lấy thông tin sản phẩm
            const productIdsSet = new Set<number>();
            ordersData.forEach((order) => {
                order.lineItems.forEach((item) => {
                    productIdsSet.add(item.productId);
                });
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
            console.error('Error fetching orders or products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrdersAndProducts();
    }, []);

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
                            <Text style={styles.productInfo}>{`Giá: ${product.price.toLocaleString()}đ`}</Text>
                        </View>
                    </>
                ) : (
                    <Text>Đang tải thông tin sản phẩm...</Text>
                )}
            </View>
        );
    };

    const filteredOrders = selectedStatus ? orders.filter((order) => order.status === selectedStatus) : orders;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = filteredOrders.length;
    const renderOrder = ({ item }: { item: Order }) => {
        const displayedLineItems = item.lineItems.slice(0, 1);
        const remainingCount = item.lineItems.length - displayedLineItems.length;

        return (
            <TouchableOpacity onPress={() => navigation.navigate('OrderScreen', { orderId: item.id })}>
                <View style={styles.orderContainer}>
                    <Text style={styles.orderTitle}>{`Đơn hàng ngày ${formatDate(item.createdAt)}`}</Text>
                    <Text style={styles.orderInfo}>{`Địa chỉ giao hàng: ${item.shippingAddress}`}</Text>
                    <Text style={styles.orderInfo}>{`Tổng tiền: ${item.totalAmount.toLocaleString()}đ`}</Text>

                    {item.coupon ? (
                        <View style={styles.couponContainer}>
                            <Text style={styles.couponLabel}>Mã giảm giá:</Text>
                            <Text
                                style={styles.couponText}
                            >{`${item.coupon.code} - Giảm ${item.coupon.discountValue}%`}</Text>
                        </View>
                    ) : (
                        <Text style={styles.orderInfo}>Không áp dụng mã giảm giá</Text>
                    )}

                    <Text style={styles.orderInfo}>
                        Trạng thái:{' '}
                        <Text style={{ color: getOrderStatusColor(item.status) }}>{getStatusLabel(item.status)}</Text>
                    </Text>

                    <View style={styles.lineItemsContainer}>
                        {displayedLineItems.map(renderLineItem)}
                        {remainingCount > 0 && (
                            <Text style={styles.moreItemsText}>{`và ${remainingCount} sản phẩm khác`}</Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Icon name='arrowleft' size={24} color='#000' />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Danh sách đơn hàng</Text>
            </View>

            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {statuses.map((status) => (
                        <TouchableOpacity
                            key={status}
                            style={[styles.filterItem, selectedStatus === status && styles.filterItemActive]}
                            onPress={() => setSelectedStatus(status)}
                        >
                            <Text style={[styles.filterText, selectedStatus === status && styles.filterTextActive]}>
                                {getStatusLabel(status)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size='large' color='#0000ff' />
                ) : filteredOrders.length === 0 ? (
                    <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
                ) : (
                    <>
                        <View style={styles.summaryContainer}>
                            {/* <Text style={styles.summaryTitle}>Thống kê đơn hàng</Text> */}
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tổng số đơn hàng:</Text>
                                <Text style={styles.summaryValue}>{totalOrders}</Text>
                            </View>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tổng số tiền:</Text>
                                <Text style={styles.summaryValue}>{totalRevenue.toLocaleString()}đ</Text>
                            </View>
                        </View>

                        <FlatList
                            data={filteredOrders}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderOrder}
                            contentContainerStyle={styles.flatListContent}
                        />
                    </>
                )}
            </View>
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
        paddingTop: 20,
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
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingTop: 30,
    },
    filterContainer: {
        marginVertical: 10,
        paddingHorizontal: 16,
    },
    filterItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#eee',
        marginRight: 8,
    },
    filterItemActive: {
        backgroundColor: '#008000',
    },
    filterText: {
        fontSize: 14,
        color: '#333',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 10,
    },
    flatListContent: {
        paddingBottom: 20,
    },
    orderContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
    lineItemsContainer: {
        marginTop: 8,
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
    moreItemsText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#888',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888',
    },
    couponContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    couponLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        marginRight: 8,
    },
    couponText: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 14,
        fontWeight: 'bold',
        color: '#D32F2F',
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.3)',
        textAlign: 'center',
    },
    summaryContainer: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#8cabb8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#555',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#222',
    },
});

export default ListOrderScreen;
