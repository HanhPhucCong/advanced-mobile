import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import categoryService from '../../service/api/categoryService';
import productService from '../../service/api/productService';
import formatCurrency from '../../utils/formatCurrency';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    purchaseCount: number;
    description: string;
    price: number;
    imageUrls: string[];
}

const HomeScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [visibleCount, setVisibleCount] = useState<number>(4); // Số sản phẩm hiển thị ban đầu

    const [banners] = useState<string[]>([
        'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1143754/pexels-photo-1143754.jpeg?auto=compress&cs=tinysrgb&w=600',
    ]);

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        fetchCategories();
        fetchTopProducts();
        fetchAllProducts();
        startAutoSlide();
    }, []);

    const fetchCategories = async () => {
        try {
            const response: any = await categoryService.getAll();
            setCategories(response);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchTopProducts = async () => {
        try {
            const response = await productService.getAllActive({ size: 5 });
            setTopProducts(response.data.content);
        } catch (error) {
            console.error('Error fetching top products:', error);
        }
    };

    const fetchAllProducts = async () => {
        setLoading(true);
        let allFetchedProducts: Product[] = [];
        let page = 0;
        const size = 4; // Số sản phẩm mỗi lần gọi API
        let hasMore = true;

        try {
            while (hasMore) {
                const response = await productService.getAllActive({ page, size });
                const products = response.data.content;
                allFetchedProducts = [...allFetchedProducts, ...products];

                if (products.length < size) {
                    hasMore = false; // Nếu số lượng trả về nhỏ hơn `size`, nghĩa là hết sản phẩm
                } else {
                    page++; // Tiếp tục lấy trang tiếp theo
                }
            }

            setAllProducts(allFetchedProducts);
            setDisplayedProducts(allFetchedProducts.slice(0, visibleCount));
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMoreProducts = () => {
        if (isFetching || displayedProducts.length >= allProducts.length) {
            return;
        }

        console.log(`🔄 Đang hiển thị: ${displayedProducts.length}/${allProducts.length}`);
        console.log(`⏳ Đang load thêm sản phẩm...`);

        setIsFetching(true);
        setTimeout(() => {
            setDisplayedProducts((prevProducts) => {
                const newCount = Math.min(prevProducts.length + 4, allProducts.length);
                console.log(`🛒 Cập nhật danh sách: ${newCount}/${allProducts.length}`);

                if (newCount >= allProducts.length) {
                    console.log(`✅ Đã load hết sản phẩm: ${newCount}/${allProducts.length}`);
                }

                return allProducts.slice(0, newCount);
            });

            setVisibleCount((prev) => Math.min(prev + 4, allProducts.length));
            setIsFetching(false);
        }, 1000);
    };

    const startAutoSlide = () => {
        let index = 0;
        setInterval(() => {
            if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ index, animated: true }); // cuộn FlatList đến vị trí index
                index = (index + 1) % banners.length;
            }
        }, 3000);
    };

    const renderBanner = ({ item }: { item: string }) => <Image source={{ uri: item }} style={styles.carouselImage} />;

    const renderCategoryItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() =>
                navigation.navigate('ProductForCategoryScreen', {
                    categoryId: item.id,
                    categoryName: item.name,
                })
            }
        >
            <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
    );

    const renderProductItem = ({ item }: { item: Product }) => (
        <TouchableOpacity onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}>
            <View style={styles.productItem}>
                <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <FlatList
            ListHeaderComponent={
                <>
                    <FlatList
                        ref={flatListRef}
                        data={banners}
                        renderItem={renderBanner}
                        keyExtractor={(item, index) => index.toString()}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                    />

                    <FlatList
                        horizontal
                        data={categories}
                        renderItem={renderCategoryItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryList}
                    />

                    <Text style={styles.sectionTitle}>Hot Products</Text>
                    <FlatList
                        horizontal
                        data={topProducts}
                        renderItem={renderProductItem}
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                        style={styles.productList}
                    />

                    <Text style={styles.sectionTitle}>All Products</Text>
                </>
            }
            data={displayedProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            columnWrapperStyle={styles.row}
            onEndReached={loadMoreProducts}
            onEndReachedThreshold={0.1}
            ListFooterComponent={isFetching ? <ActivityIndicator size='large' color='#ff5733' /> : null}
        />
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    carouselImage: { width: width, height: 220, resizeMode: 'cover' },
    categoryList: { paddingVertical: 10 },
    categoryItem: { marginHorizontal: 10, padding: 10, backgroundColor: '#ddd', borderRadius: 5 },
    categoryText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    productList: { paddingVertical: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, marginLeft: 10 },
    row: { justifyContent: 'space-between', paddingHorizontal: 10 },
    productItem: {
        width: width / 2 - 20,
        marginBottom: 10,
        backgroundColor: '#f8f8f8',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    productImage: { width: '100%', height: 150, borderRadius: 10, resizeMode: 'cover' },
    productName: { fontSize: 14, fontWeight: 'bold', marginTop: 5, textAlign: 'center' },
    productPrice: { fontSize: 14, color: '#ff5733', marginTop: 3 },
});

export default HomeScreen;
