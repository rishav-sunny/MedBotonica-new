// app/screens/SplashScreen.tsx
import React, { useEffect } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const SplashScreen = ({ navigation }: SplashScreenProps) => {
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        navigation.replace('Login');
      }
    }, 3000); // show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <ImageBackground
      source={require('../assets/splash_screen.png')}
      style={styles.background}
      resizeMode="cover" // or "contain" if your splash image is smaller
    />
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
