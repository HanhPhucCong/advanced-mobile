import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import productService from '../../service/api/productService';
import formatCurrency from '../../utils/formatCurrency';

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
    const [showPicker, setShowPicker] = useState(false);

    const handlePickerSelect = (value: 'asc' | 'desc' | 'default') => {
        handleSortChange(value);
        setShowPicker(false);
    };

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
                <Ionicons name='search' size={20} color='gray' style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search by name...'
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
            </View>
            {isSearching && (
                <View style={styles.sortWrapper}>
                    <Text style={styles.sortLabel}>Sort by price:</Text>
                    <TouchableOpacity onPress={() => setShowPicker(!showPicker)} style={styles.sortSelection}>
                        <Text style={styles.sortText}>
                            {sortOrder === 'default' ? 'Default' : sortOrder === 'asc' ? 'Low to High' : 'High to Low'}
                        </Text>
                        <Ionicons name='chevron-down' size={16} color='#555' style={{ marginLeft: 6 }} />
                    </TouchableOpacity>
                    {showPicker && (
                        <View style={styles.sortDropdown}>
                            <TouchableOpacity onPress={() => handlePickerSelect('default')}>
                                <Text style={styles.sortOption}>Default</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePickerSelect('asc')}>
                                <Text style={styles.sortOption}>Low to High</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePickerSelect('desc')}>
                                <Text style={styles.sortOption}>High to Low</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {loading ? (
                <ActivityIndicator size='large' color='#ff5733' />
            ) : (
                <FlatList
                    data={isSearching ? results : randomProducts}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    ListEmptyComponent={<Text style={styles.noResults}>No results found.</Text>}
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: '#f1f3f6',
        paddingHorizontal: 15,
        height: 44,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 10,
        color: '#888',
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#333',
    },
    sortWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 4,
        position: 'relative',
    },
    sortLabel: {
        fontSize: 14,
        color: '#555',
        marginRight: 8,
    },
    sortSelection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        backgroundColor: '#f3f3f3',
    },
    sortText: {
        fontSize: 14,
        color: '#333',
    },
    sortDropdown: {
        position: 'absolute',
        top: 40,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 6,
        paddingVertical: 6,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 99,
    },
    sortOption: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        fontSize: 14,
        color: '#333',
    },
    productItem: {
        flex: 1,
        margin: 5,
        padding: 10,
        backgroundColor: '#f7f9fb',
        borderRadius: 12,
        alignItems: 'center',
    },
    productImage: {
        width: 120,
        height: 100,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    productName: {
        fontSize: 14,
        color: '#333',
        marginTop: 8,
        textAlign: 'center',
    },
    productPrice: {
        fontSize: 14,
        color: '#007AFF',
        marginTop: 4,
        fontWeight: '500',
    },
    noResults: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#999',
    },
});

export default SearchScreen;
