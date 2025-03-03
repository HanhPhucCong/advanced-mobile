import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import productService from '../../service/api/productService';

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
                <Icon name="arrowleft" size={24} color="#000" />
            </TouchableOpacity>

            <Text style={styles.header}>{categoryName}</Text>

            <TouchableOpacity 
                style={[styles.sortButton, { backgroundColor: sortOrder === 'asc' ? '#28a745' : '#ff5733' }]} 
                onPress={sortProducts}
            >
                <Text style={styles.sortText}>
                    Sắp xếp theo giá ({sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'})
                </Text>
                <Icon name={sortOrder === 'asc' ? 'arrowdown' : 'arrowup'} size={18} color="#fff" />
            </TouchableOpacity>

            {loading ? (
                <ActivityIndicator size="large" color="#ff5733" />
            ) : products.length === 0 ? (
                <Text style={styles.noProducts}>Không có sản phẩm trong danh mục này.</Text>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.productItem} onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}>
                            <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },

    backButton: {
        position: 'absolute',
        top: 60,
        left: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: 8,
        borderRadius: 50,
        zIndex: 10,
    },

    header: { 
        fontSize: 22, 
        fontWeight: 'bold', 
        textAlign: 'center', 
        marginVertical: 20, 
        color: '#333',
    },

    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        alignSelf: 'center',
    },

    sortText: {
        fontSize: 16,
        color: '#fff',
        fontWeight: 'bold',
        marginRight: 5,
    },

    noProducts: { 
        textAlign: 'center', 
        fontSize: 16, 
        color: 'gray', 
        marginTop: 20 
    },

    productItem: { 
        flex: 1, 
        alignItems: 'center', 
        padding: 10, 
        margin: 5, 
        borderRadius: 10, 
        backgroundColor: '#fff', 
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowRadius: 5, 
        elevation: 3,
    },

    productImage: { 
        width: 120, 
        height: 120, 
        borderRadius: 10, 
        resizeMode: 'cover',
    },

    productName: { 
        fontSize: 16, 
        fontWeight: 'bold', 
        marginTop: 5, 
        color: '#333', 
        textAlign: 'center',
    },

    productPrice: { 
        fontSize: 14, 
        color: '#ff5733', 
        marginTop: 3, 
        fontWeight: 'bold',
    },
});

export default ProductForCategoryScreen;