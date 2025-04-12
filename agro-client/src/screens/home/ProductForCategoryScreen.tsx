import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import productService from '../../service/api/productService';
import formatCurrency from '../../utils/formatCurrency';

interface Product {
    id: number;
    name: string;
    price: number;
    imageUrls: string[];
}

const ProductForCategoryScreen = ({ navigation, route }: any) => {
    const { categoryId, categoryName } = route.params as { categoryId: number; categoryName: string };

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        fetchProductsByCategory();
    }, []);

    const fetchProductsByCategory = async () => {
        try {
            const response = await productService.getProductByCategory(categoryId);
            setProducts(response.data.content);
        } catch (error) {
            console.error('Lỗi khi tải sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    const sortProducts = () => {
        const sorted = [...products].sort((a, b) => {
            return sortOrder === 'asc' ? a.price - b.price : b.price - a.price;
        });
        setProducts(sorted);
        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Icon name='arrowleft' size={24} color='#333' />
            </TouchableOpacity>

            <Text style={styles.header}>{categoryName}</Text>

            <TouchableOpacity
                style={[styles.sortButton, { backgroundColor: sortOrder === 'asc' ? '#7BC46B' : '#FF6F61' }]}
                onPress={sortProducts}
            >
                <Text style={styles.sortText}>Sort by Price ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})</Text>
                <Icon name={sortOrder === 'asc' ? 'arrowdown' : 'arrowup'} size={18} color='#fff' />
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size='large' color='#FF6F61' />
            ) : products.length === 0 ? (
                <Text style={styles.noProducts}>No products in this category.</Text>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.productItem}
                            onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}
                        >
                            <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fafafa', // Light background for elegance
        marginTop: 20,
    },

    backButton: {
        position: 'absolute',
        top: 20,
        left: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Subtle transparent background
        padding: 10,
        borderRadius: 50,
        zIndex: 10,
    },

    header: {
        fontSize: 24,
        fontWeight: '500',
        textAlign: 'center',
        marginVertical: 20,
        color: '#333',
    },

    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10, // Rounded corners for a softer look
        marginBottom: 15,
        backgroundColor: '#7BC46B', // Softer green
        elevation: 2, // Lighter shadow
        fontSize: 16,
    },

    sortText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '500',
        marginRight: 8,
    },

    noProducts: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 20,
    },

    productItem: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
        margin: 8,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.12, // Subtle shadow for a soft effect
        shadowRadius: 6,
        elevation: 2,
        height: 230, // Fixed height for items to align well
    },

    productImage: {
        width: 120,
        height: 120,
        borderRadius: 12, // Slightly rounded corners
        resizeMode: 'cover',
        marginBottom: 12,
    },

    productName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 6,
        textAlign: 'center',
    },

    productPrice: {
        fontSize: 14,
        color: '#FF6F61', // Softer red color
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default ProductForCategoryScreen;
