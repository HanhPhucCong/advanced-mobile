import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Button,
} from 'react-native';
import { Image } from 'react-native';
import { RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/AntDesign';
import { showMessage } from 'react-native-flash-message';
import { RouteProp, useRoute } from '@react-navigation/native';
import productService from '../../../service/api/productService';
import orderService from '../../../service/api/orderService';
import couponService from '../../../service/api/couponService';

interface LineItem {
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    unit: string;
    imageUrls: string[];
    quantity: number;
}

interface Coupon {
    id: number;
    code: string;
    expirationDate: string;
    minimumOrderAmount: number;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
}

type CheckoutRouteProp = RouteProp<{ CheckoutScreen: { selectedLineItems: LineItem[] } }, 'CheckoutScreen'>;

const CheckoutScreen = ({ navigation }: any) => {
    const route = useRoute<CheckoutRouteProp>();
    const { selectedLineItems } = route.params;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [shippingAddress, setShippingAddress] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ shippingAddress?: string }>({});
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPay'>('COD');

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const response = await couponService.myCoupons();
                setCoupons(response.data);
            } catch (error) {
                console.error('Error fetching coupons:', error);
            }
        };

        fetchCoupons();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const productRequests = selectedLineItems.map((lineItem) => productService.getById(lineItem.productId));
                const responses = await Promise.all(productRequests);
                const fetchedProducts = responses.map((response) => response.data);
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedLineItems]);

    const validateForm = () => {
        let valid = true;
        let newErrors: { shippingAddress?: string } = {};

        if (!shippingAddress.trim()) {
            newErrors.shippingAddress = 'Địa chỉ giao hàng không được để trống!';
            valid = false;
        } else if (shippingAddress.length > 255) {
            newErrors.shippingAddress = 'Địa chỉ không được dài quá 255 ký tự!';
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    const handleCheckout = async () => {
        if (!validateForm()) return;

        const lineItemIds = selectedLineItems.map((item) => item.id).join(',');

        const checkoutRequest = {
            lineItemIds,
            shippingAddress,
            note,
            couponCode: selectedCoupon || undefined,
        };

        try {
            setIsProcessing(true);

            if (paymentMethod === 'COD') {
                const checkoutCODResponse: any = await orderService.checkoutByCOD(checkoutRequest);
                navigation.navigate('Main');
                showMessage({
                    message: checkoutCODResponse.message || 'Đơn hàng đã được đặt thành công!',
                    type: 'success',
                    backgroundColor: '#28a745',
                    color: '#fff',
                });
            } else if (paymentMethod === 'VNPay') {
                const response: any = await orderService.checkoutByVnpay(checkoutRequest);

                if (response?.status === 'Ok' && response?.url) {
                    navigation.navigate('VnpayScreen', { vnpayUrl: response.url });
                } else {
                    showMessage({
                        message: response?.message || 'Thanh toán VNPay thất bại!',
                        type: 'danger',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                    });
                }
            }
        } catch (error: any) {
            if (error.response && error.response.data) {
                const { status, data } = error.response;

                if (status === 400) {
                    showMessage({
                        message: data?.message || 'Yêu cầu không hợp lệ! Vui lòng kiểm tra lại thông tin.',
                        type: 'danger',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                    });
                    return;
                }

                if (status === 409) {
                    showMessage({
                        message: data?.message || 'Bạn đang xử lý một đơn hàng khác!',
                        type: 'warning',
                        backgroundColor: '#ffc107',
                        color: '#000',
                    });
                    return;
                }
            }

            showMessage({
                message: 'Đã xảy ra lỗi không xác định, vui lòng thử lại!',
                type: 'danger',
                backgroundColor: '#dc3545',
                color: '#fff',
            });

            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const getTotalPrice = () => {
        let total = selectedLineItems.reduce((sum, lineItem) => {
            const product = products.find((p) => p.id === lineItem.productId);
            return sum + (product ? product.price * lineItem.quantity : 0);
        }, 0);

        const appliedCoupon = coupons.find((c) => c.code === selectedCoupon);

        if (appliedCoupon) {
            if (appliedCoupon.type === 'PERCENTAGE') {
                total -= (total * appliedCoupon.discountValue) / 100;
            } else if (appliedCoupon.type === 'FIXED_AMOUNT') {
                total -= appliedCoupon.discountValue;
            }
        }

        return Math.max(total, 0); // Đảm bảo tổng tiền không âm
    };

    if (loading) {
        return <ActivityIndicator size='large' color='#ff5733' style={styles.loading} />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0} // Điều chỉnh vị trí cuộn
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps='handled'>
                    <View style={styles.container}>
                        <Text style={styles.header}>Thanh toán</Text>
                        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                            <Icon name='arrowleft' size={26} color='#fff' />
                        </TouchableOpacity>

                        {selectedLineItems.map((lineItem) => {
                            const product = products.find((p) => p.id === lineItem.productId);
                            if (!product) return null;

                            return (
                                <View key={lineItem.id} style={styles.productCard}>
                                    <View style={styles.imageContainer}>
                                        <TouchableOpacity
                                            onPress={() =>
                                                navigation.navigate('ProductDetailScreen', { product: product })
                                            }
                                        >
                                            <Image
                                                source={{ uri: product.imageUrls[0] }}
                                                style={styles.productImage}
                                                resizeMode='cover'
                                            />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={styles.productInfo}>
                                        <Text style={styles.productName}>{product.name}</Text>
                                        <Text style={styles.productPrice}>
                                            {product.price.toLocaleString()}đ x {lineItem.quantity} ={' '}
                                            <Text style={styles.totalItemPrice}>
                                                {(product.price * lineItem.quantity).toLocaleString()}đ
                                            </Text>
                                        </Text>
                                    </View>
                                </View>
                            );
                        })}

                        {coupons.length > 0 && (
                            <View style={styles.couponContainer}>
                                <Text style={styles.paymentLabel}>Chọn mã giảm giá:</Text>
                                {coupons.map((coupon) => (
                                    <TouchableOpacity
                                        key={coupon.id}
                                        style={[
                                            styles.couponItem,
                                            selectedCoupon === coupon.code && styles.selectedCouponItem,
                                        ]}
                                        onPress={() =>
                                            setSelectedCoupon(selectedCoupon === coupon.code ? null : coupon.code)
                                        }
                                    >
                                        <Text style={styles.couponText}>
                                            {coupon.code} - Giảm {coupon.discountValue}% (đơn từ{' '}
                                            {coupon.minimumOrderAmount.toLocaleString()}đ)
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        <View style={styles.totalContainer}>
                            <Text style={styles.totalLabel}>Tổng tiền:</Text>
                            <Text style={styles.totalAmount}>{getTotalPrice().toLocaleString()}đ</Text>
                        </View>

                        <Text style={styles.paymentLabel}>Chọn phương thức thanh toán:</Text>
                        <RadioButton.Group
                            onValueChange={(value) => setPaymentMethod(value as 'COD' | 'VNPay')}
                            value={paymentMethod}
                        >
                            <View style={styles.radioContainer}>
                                <RadioButton value='COD' />
                                <Text>Thanh toán khi nhận hàng (COD)</Text>
                            </View>
                            <View style={styles.radioContainer}>
                                <RadioButton value='VNPay' />
                                <Text>Thanh toán qua VNPay</Text>
                            </View>
                        </RadioButton.Group>

                        <TextInput
                            style={[styles.input, errors.shippingAddress && styles.inputError]}
                            placeholder='Nhập địa chỉ giao hàng'
                            value={shippingAddress}
                            onChangeText={setShippingAddress}
                        />
                        {errors.shippingAddress ? <Text style={styles.errorText}>{errors.shippingAddress}</Text> : null}

                        <TextInput
                            style={styles.input}
                            placeholder='Ghi chú (tùy chọn)'
                            value={note}
                            onChangeText={setNote}
                        />

                        <TouchableOpacity
                            onPress={handleCheckout}
                            style={[styles.checkoutButton, isProcessing && styles.buttonDisabled]}
                            disabled={isProcessing}
                        >
                            <Text style={styles.checkoutButtonText}>
                                {isProcessing ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        marginTop: 50,
        backgroundColor: '#f8f8f8',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 50,
        color: '#333',
    },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(212, 216, 220, 0.7)',
        padding: 12,
        borderRadius: 50,
        elevation: 5,
    },
    productCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
        marginBottom: 10,
        alignItems: 'center',
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden', // Bắt buộc để áp dụng borderRadius
        marginRight: 15,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    productInfo: {
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    productPrice: {
        fontSize: 16,
        color: '#ff5733',
        marginTop: 5,
    },
    totalItemPrice: {
        fontWeight: 'bold',
        color: '#d9534f',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        shadowColor: '#63788f',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#d9534f',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ff5733',
    },
    paymentLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        margin: 8,
        color: '#333',
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ff5733',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedRadioCircle: {
        backgroundColor: '#ff5733',
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    radioText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 10,
    },
    checkoutButton: {
        backgroundColor: '#ff5733',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    loading: {
        marginTop: 20,
    },
    couponContainer: {
        marginTop: 4,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#aac0ce',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    couponItem: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginTop: 8,
        backgroundColor: '#f9f9f9',
    },
    selectedCouponItem: {
        borderColor: '#419961',
        backgroundColor: '#e5ffed',
    },
    couponText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
    },
});

export default CheckoutScreen;
