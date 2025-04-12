import React, { useState, useCallback, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    StyleSheet,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';
import cartService from '../../service/api/cartService';
import productService from '../../service/api/productService';
import formatCurrency from '../../utils/formatCurrency';
import { appColors } from '../../constants/appColors';
import RequireLoginComponent from '../../components/RequireLoginComponent';

interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    product?: Product;
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

const CartScreen: React.FC = ({ navigation }: any) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectAll, setSelectAll] = useState<boolean>(false);
    const [editingQuantities, setEditingQuantities] = useState<{ [key: number]: string }>({});
    const [isRequireLogin, setIsRequireLogin] = useState(false);

    const checkLogin = async () => {
        try {
            //await AsyncStorage.clear();
            const token = await AsyncStorage.getItem('token');
            return token;
        } catch (error) {
            //console.error('Error retrieving token:', error);
        }
    };

    const handleQuantityChange = (productId: number, text: string) => {
        setEditingQuantities((prev) => ({ ...prev, [productId]: text }));
    };

    const handleQuantitySubmit = async (productId: number) => {
        const oldQuantity = cartItems.find((item) => item.productId === productId)?.quantity.toString() || '1';
        const newQuantity = parseInt(editingQuantities[productId] || '0', 10);

        if (isNaN(newQuantity) || newQuantity < 1) {
            Alert.alert('Lỗi', 'Số lượng không hợp lệ!');
            setEditingQuantities((prev) => ({
                ...prev,
                [productId]: oldQuantity,
            }));
            return;
        }

        try {
            const response: any = await cartService.updateQuantity(productId, newQuantity);

            if (response?.status === 400) {
                Alert.alert('Lỗi', response.message || 'Không đủ hàng trong kho');
                setEditingQuantities((prev) => ({
                    ...prev,
                    [productId]: oldQuantity, // Giữ nguyên số lượng cũ nếu lỗi
                }));
                return;
            }

            fetchCart();
        } catch (error: any) {
            if (error.response) {
                const { status, data } = error.response;
                if (status === 400) {
                    Alert.alert('Lỗi', data?.message || 'Không đủ hàng trong kho');
                    setEditingQuantities((prev) => ({
                        ...prev,
                        [productId]: oldQuantity, // Khôi phục số lượng cũ nếu lỗi
                    }));
                    return;
                }
            }

            // Lỗi khác (mạng, server, v.v.)
            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật số lượng. Vui lòng thử lại.');
            setEditingQuantities((prev) => ({
                ...prev,
                [productId]: oldQuantity, // Khôi phục số lượng cũ nếu có lỗi ngoài dự kiến
            }));
        }
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map((item) => item.id));
        }
        setSelectAll(!selectAll);
    };

    const handleRemoveAll = async () => {
        Alert.alert('Xóa toàn bộ giỏ hàng', 'Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    await cartService.clearAll();
                    setSelectedItems([]);
                    fetchCart();
                },
            },
        ]);
    };

    const fetchCart = async () => {
        const token = await checkLogin();
        if (!token) {
            setIsRequireLogin(true);
            return;
        }

        setLoading(true);
        try {
            const response = await cartService.myCart();
            const lineItems: CartItem[] = response.data?.lineItems || [];

            const updatedCartItems = await Promise.all(
                lineItems.map(async (item) => {
                    try {
                        const productResponse = await productService.getById(item.productId);
                        return { ...item, product: productResponse.data };
                    } catch (error) {
                        return { ...item, product: undefined };
                    }
                })
            );
            setCartItems(updatedCartItems);
        } catch (error) {
            console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchCart();
        }, [])
    );

    const handleIncrease = async (productId: number) => {
        await cartService.addToCart(productId);
        fetchCart();
    };

    const handleDecrease = async (productId: number) => {
        await cartService.decrease(productId);
        fetchCart();
    };

    const handleRemoveItem = async (lineItemId: number) => {
        Alert.alert('Xóa sản phẩm', 'Bạn có chắc chắn muốn xóa sản phẩm này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    await cartService.removeFromCart(lineItemId);
                    fetchCart();
                },
            },
        ]);
    };

    const handleRemoveSelected = async () => {
        Alert.alert('Xóa sản phẩm', 'Bạn có chắc chắn muốn xóa tất cả sản phẩm đã chọn?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    await Promise.all(selectedItems.map((id) => cartService.removeFromCart(id)));
                    setSelectedItems([]);
                    fetchCart();
                },
            },
        ]);
    };

    const toggleSelectItem = (id: number) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(id) ? prevSelected.filter((itemId) => itemId !== id) : [...prevSelected, id]
        );
    };

    const handleCheckout = () => {
        const selectedLineItems = cartItems.filter((item) => selectedItems.includes(item.id));
        if (selectedLineItems.length > 0) {
            navigation.navigate('CheckoutScreen', { selectedLineItems });
        }
    };

    const totalAmount = cartItems
        .filter((item) => selectedItems.includes(item.id))
        .reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

    return (
        <SafeAreaView style={styles.container}>
            {isRequireLogin ? (
                <View>
                    <RequireLoginComponent navigation={navigation} />
                </View>
            ) : (
                <>
                    {loading ? (
                        <ActivityIndicator size='large' color='#ff5733' style={{ marginTop: 10 }} />
                    ) : cartItems.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Icon name='arrowleft' size={26} color='#fff' />
                            </TouchableOpacity>
                            <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống!</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={cartItems}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            ListHeaderComponent={
                                <View style={styles.headerRow}>
                                    <TouchableOpacity onPress={handleSelectAll}>
                                        <Icon
                                            name={selectAll ? 'checkcircle' : 'checkcircleo'}
                                            size={20}
                                            color={selectAll ? '#ff5733' : '#ccc'}
                                            style={styles.checkIcon}
                                        />
                                    </TouchableOpacity>
                                    <Text style={styles.headerText}>Chọn tất cả</Text>
                                    <TouchableOpacity onPress={handleRemoveAll}>
                                        <Icon name='delete' size={20} color='gray' />
                                    </TouchableOpacity>
                                </View>
                            }
                            renderItem={({ item }) => (
                                <View style={styles.cartItem}>
                                    <TouchableOpacity onPress={() => toggleSelectItem(item.id)}>
                                        <Icon
                                            name={selectedItems.includes(item.id) ? 'checkcircle' : 'checkcircleo'}
                                            size={20}
                                            color={selectedItems.includes(item.id) ? '#ff5733' : '#ccc'}
                                            style={styles.checkIcon}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() =>
                                            navigation.navigate('ProductDetailScreen', { product: item.product })
                                        }
                                    >
                                        <Image
                                            source={{ uri: item.product?.imageUrls?.[0] }}
                                            style={styles.productImage}
                                        />
                                    </TouchableOpacity>
                                    <View style={styles.productDetails}>
                                        <Text style={styles.productName}>
                                            {item.product?.name || 'Không tìm thấy sản phẩm'}
                                        </Text>
                                        <Text style={styles.price}>
                                            {formatCurrency((item.product?.price || 0) * item.quantity)}
                                        </Text>
                                        <View style={styles.quantityContainer}>
                                            <TouchableOpacity onPress={() => handleDecrease(item.productId)}>
                                                <Icon name='minus' size={20} color='#ff5733' />
                                            </TouchableOpacity>
                                            <TextInput
                                                style={styles.quantityInput}
                                                value={editingQuantities[item.productId] ?? item.quantity.toString()}
                                                keyboardType='numeric'
                                                onChangeText={(text) => handleQuantityChange(item.productId, text)}
                                                onEndEditing={() => handleQuantitySubmit(item.productId)}
                                            />
                                            <TouchableOpacity onPress={() => handleIncrease(item.productId)}>
                                                <Icon name='plus' size={20} color='#ff5733' />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => handleRemoveItem(item.id)}>
                                        <Icon name='delete' size={20} color='gray' />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
                    {selectedItems.length > 0 && (
                        <View style={styles.footer}>
                            <Text style={styles.totalText}>Tổng cộng: {formatCurrency(totalAmount)}</Text>
                            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                                <Text style={styles.checkoutText}>Thanh toán</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={handleRemoveSelected}>
                                <Text style={styles.checkoutText}>Xóa tất cả đã chọn</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </SafeAreaView>
    );
};

export default CartScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, marginTop: 50, backgroundColor: '#f8f8f8' },
    emptyText: { textAlign: 'center', fontSize: 18, color: '#777', marginTop: 10 },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        paddingHorizontal: 20,
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
    checkIcon: { marginRight: 10 },
    productImage: { width: 70, height: 70, borderRadius: 10, marginRight: 15 },
    productDetails: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold' },
    price: { fontSize: 16, color: '#ff5733', fontWeight: 'bold', marginTop: 5 },
    quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    quantityInput: {
        width: 50,
        height: 40,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginHorizontal: 10,
        fontSize: 14,
    },

    footer: { padding: 15, backgroundColor: '#fff', elevation: 5, alignItems: 'center', marginBottom: 10 },
    totalText: { fontSize: 18, fontWeight: 'bold', margin: 4 },
    checkoutButton: { backgroundColor: '#ff5733', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
    checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    deleteButton: {
        backgroundColor: '#ccc',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    headerText: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    linkText: {
        fontSize: 16,
        color: appColors.blueLink,
    },
});
