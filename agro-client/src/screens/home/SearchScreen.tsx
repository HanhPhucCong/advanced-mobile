import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import productService from '../../service/api/productService';

interface Product {
    id: number;
    name: string;
    price: number;
    imageUrls: string[];
}

const SearchScreen = ({ navigation }: any) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<Product[]>([]);
    const [randomProducts, setRandomProducts] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'default'>('default');

    useEffect(() => {
        fetchRandomProducts();
    }, []);

    const fetchRandomProducts = async () => {
        try {
            const response = await productService.getRandomProducts();
            setRandomProducts(response.data.content);
        } catch (error) {
            console.error('Error fetching random products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            const response = await productService.searchProductsByName({ name: query });
            let searchResults = response.data.content;
            if (sortOrder !== 'default') {
                searchResults = sortProducts(searchResults, sortOrder);
            }

            setResults(searchResults);
        } catch (error) {
            console.error('Error searching products:', error);
        }
    };
    const sortProducts = (products: Product[], order: 'asc' | 'desc') => {
        return [...products].sort((a, b) => {
            return order === 'asc' ? a.price - b.price : b.price - a.price;
        });
    };
    const handleSortChange = (order: 'asc' | 'desc' | 'default') => {
        setSortOrder(order);
        if (isSearching && results.length > 0) {
            if (order === 'default') {
                handleSearch(searchQuery);
            } else {
                setResults(sortProducts(results, order));
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Nhập từ khóa tìm kiếm..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            {isSearching && (
                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Sắp xếp theo giá:</Text>
                    <Picker
                        selectedValue={sortOrder}
                        style={styles.picker}
                        onValueChange={(itemValue) => handleSortChange(itemValue)}
                    >
                        <Picker.Item label="Mặc định" value="default" />
                        <Picker.Item label="Giá: Thấp đến cao" value="asc" />
                        <Picker.Item label="Giá: Cao đến thấp" value="desc" />
                    </Picker>
                </View>
            )}
            {loading ? (
                <ActivityIndicator size="large" color="#ff5733" />
            ) : (
                <FlatList
                    data={isSearching ? results : randomProducts}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    ListEmptyComponent={<Text style={styles.noResults}>Không có kết quả.</Text>}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.productItem} onPress={() => navigation.navigate('ProductDetailScreen', { product: item })}>
                            <Image source={{ uri: item.imageUrls[0] }} style={styles.productImage} />
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#fff' },
    searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, height: 50, marginBottom: 15, backgroundColor: '#f8f8f8', elevation: 2 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16 },
    pickerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    pickerLabel: { fontSize: 16, marginRight: 10 },
    picker: { flex: 1, height: 50 },
    productItem: { flex: 1, alignItems: 'center', padding: 10, margin: 5, borderRadius: 10, backgroundColor: '#f9f9f9', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    productImage: { width: 100, height: 100, borderRadius: 10 },
    productName: { fontSize: 16, fontWeight: 'bold', marginTop: 5 },
    productPrice: { fontSize: 14, color: 'green', marginTop: 3 },
    noResults: { textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' }
});

export default SearchScreen;