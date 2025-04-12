import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Swiper from 'react-native-swiper';
import { appColors } from '../../constants/appColors';
import { appInfo } from '../../constants/appInfos';
import { globalStyles } from '../../styles/globalStyles';

const OnbroadingScreen = ({ navigation }: any) => {
    const [index, setIndex] = useState(0);

    return (
        <View style={[globalStyles.container]}>
            <Swiper
                style={{}}
                loop={false}
                onIndexChanged={(num) => setIndex(num)}
                index={index}
                activeDotColor={appColors.white}
            >
                <Image
                    source={require('../../assets/images/onboarding-1.png')}
                    style={{
                        flex: 1,
                        width: appInfo.sizes.WIDTH,
                        height: appInfo.sizes.HEIGHT,
                        resizeMode: 'cover',
                    }}
                />
                <Image
                    source={require('../../assets/images/onboarding-2.png')}
                    style={{
                        flex: 1,
                        width: appInfo.sizes.WIDTH,
                        height: appInfo.sizes.HEIGHT,
                        resizeMode: 'cover',
                    }}
                />
                <Image
                    source={require('../../assets/images/onboarding-2.png')}
                    style={{
                        flex: 1,
                        width: appInfo.sizes.WIDTH,
                        height: appInfo.sizes.HEIGHT,
                        resizeMode: 'cover',
                    }}
                />
            </Swiper>
            <View
                style={[
                    {
                        paddingHorizontal: 16,
                        paddingVertical: 20,
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        left: 20,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    },
                ]}
            >
                <TouchableOpacity onPress={() => navigation.navigate('Main')}>
                    <Text style={[styles.text]}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => (index < 2 ? setIndex(index + 1) : navigation.navigate('Main'))}
                ></TouchableOpacity>
            </View>
        </View>
    );
};

export default OnbroadingScreen;

const styles = StyleSheet.create({
    text: {
        color: appColors.white,
        fontSize: 16,
        fontWeight: '500',
    },
});
