import React, { useState, useCallback } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    StyleSheet,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { showMessage } from 'react-native-flash-message';
import Icon from 'react-native-vector-icons/AntDesign';
import favoriteService from '../../service/api/favoriteService';
import cartService from '../../service/api/cartService';
import formatCurrency from '../../utils/formatCurrency';
import RequireLoginComponent from '../../components/RequireLoginComponent';

interface Product {
    id: number;
    name: string;
    price: number;
    imageUrls: string[];
}

const FavoriteScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [favorites, setFavorites] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
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

    const fetchFavorites = async () => {
        const token = await checkLogin();
        if (!token) {
            setIsRequireLogin(true);
            return;
        }

        setLoading(true);
        try {
            const response = await favoriteService.myFavorite();
            setFavorites(response.data.products || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchFavorites();
        }, [])
    );

    const toggleSelectAll = () => {
        if (selectedItems.length === favorites.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(favorites.map((item) => item.id));
        }
    };

    const toggleSelectItem = (productId: number) => {
        setSelectedItems((prev) =>
            prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
        );
    };

    const handleRemoveFavorite = async (productId: number) => {
        Alert.alert('Xóa sản phẩm', 'Bạn có chắc chắn muốn xóa sản phẩm này khỏi danh sách yêu thích?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    setFavorites((prev) => prev.filter((item) => item.id !== productId));
                    try {
                        await favoriteService.remove(productId);
                        showMessage({ message: 'Đã xóa khỏi danh sách yêu thích!', type: 'success' });
                    } catch (error) {
                        console.error('Lỗi khi xóa sản phẩm yêu thích:', error);
                        fetchFavorites();
                    }
                },
            },
        ]);
    };

    const handleRemoveAll = async () => {
        Alert.alert('Xóa tất cả', 'Bạn có chắc chắn muốn xóa toàn bộ danh sách yêu thích?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                onPress: async () => {
                    try {
                        await favoriteService.clearAll();
                        setFavorites([]);
                        setSelectedItems([]);
                        showMessage({ message: 'Đã xóa toàn bộ danh sách yêu thích!', type: 'success' });
                    } catch (error) {
                        console.error('Lỗi khi xóa tất cả sản phẩm yêu thích:', error);
                        fetchFavorites();
                    }
                },
            },
        ]);
    };

    const handleAddAllToCart = async () => {
        if (selectedItems.length === 0) return;
        await Promise.all(selectedItems.map((id) => cartService.addToCart(id)));
        showMessage({ message: 'Các sản phẩm đã được thêm vào giỏ hàng!', type: 'success' });
    };

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
                    ) : favorites.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                                <Icon name='arrowleft' size={26} color='#fff' />
                            </TouchableOpacity>
                            <Text style={styles.emptyText}>Danh sách yêu thích trống!</Text>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={favorites}
                                keyExtractor={(item) => item.id.toString()}
                                ListHeaderComponent={
                                    <View style={styles.headerRow}>
                                        <TouchableOpacity onPress={toggleSelectAll}>
                                            <Icon
                                                name={
                                                    selectedItems.length === favorites.length
                                                        ? 'checkcircle'
                                                        : 'checkcircleo'
                                                }
                                                size={20}
                                                color='blue'
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleRemoveAll}>
                                            <Icon name='delete' size={20} color='gray' />
                                        </TouchableOpacity>
                                    </View>
                                }
                                renderItem={({ item }) => (
                                    <View style={styles.favoriteItem}>
                                        <TouchableOpacity onPress={() => toggleSelectItem(item.id)}>
                                            <Icon
                                                name={selectedItems.includes(item.id) ? 'checkcircle' : 'checkcircleo'}
                                                size={20}
                                                color='blue'
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() =>
                                                navigation.navigate('ProductDetailScreen', { product: item })
                                            }
                                        >
                                            <Image source={{ uri: item.imageUrls?.[0] }} style={styles.productImage} />
                                        </TouchableOpacity>

                                        <View style={styles.productDetails}>
                                            <Text style={styles.productName}>{item.name}</Text>
                                            <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)}>
                                            <Icon name='delete' size={20} color='gray' />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                            {selectedItems.length > 0 && (
                                <TouchableOpacity style={styles.addToCartButton} onPress={handleAddAllToCart}>
                                    <Text style={styles.addToCartText}>Thêm vào giỏ hàng</Text>
                                </TouchableOpacity>
                            )}
                        </>
                    )}
                </>
            )}
        </SafeAreaView>
    );
};

export default FavoriteScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 10, marginTop: 50, backgroundColor: '#f8f8f8' },
    emptyText: { textAlign: 'center', fontSize: 18, color: '#777', marginTop: 10 },
    favoriteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
    },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 10,
    },
    productImage: { width: 70, height: 70, borderRadius: 10, marginHorizontal: 10 },
    productDetails: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold' },
    price: { fontSize: 16, color: '#ff5733', fontWeight: 'bold', marginTop: 5 },
    addToCartButton: { padding: 15, backgroundColor: 'green', alignItems: 'center', borderRadius: 10, margin: 10 },
    addToCartText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    backButton: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(212, 216, 220, 0.7)',
        padding: 12,
        borderRadius: 50,
        elevation: 5,
    },
});
