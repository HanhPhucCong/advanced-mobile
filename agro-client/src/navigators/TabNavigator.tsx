import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/home/SearchScreen';
import ProfileScreen from '../screens/home/ProfileScreen';
import CartScreen from '../screens/home/CartScreen';
import FavoriteScreen from '../screens/home/FavoriteScreen';
import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();
const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'help-circle-outline';
                    if (route.name === 'Home') iconName = 'home-outline';
                    else if (route.name === 'Search') iconName = 'search-outline';
                    else if (route.name === 'Profile') iconName = 'person-outline';
                    else if (route.name === 'Cart') iconName = 'cart-outline';
                    else if (route.name === 'Favorite') iconName = 'heart-outline';

                    return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name='Home' component={HomeScreen} />
            <Tab.Screen name='Search' component={SearchScreen} />
            <Tab.Screen name='Cart' component={CartScreen} />
            <Tab.Screen name='Favorite' component={FavoriteScreen} />
            <Tab.Screen name='Profile' component={ProfileScreen} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
