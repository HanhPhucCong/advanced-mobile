import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RequireLoginComponent = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            {/* Nội dung chính */}
            <Text style={styles.message}>You need to log in to use this feature.</Text>
            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.loginText}>Log in</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        color: '#333',
    },
    loginButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    loginText: {
        color: '#007AFF',
        fontSize: 18,
        textDecorationLine: 'underline',
    },
});

export default RequireLoginComponent;
