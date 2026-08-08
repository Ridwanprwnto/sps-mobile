// src/navigation/AppStack.js
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import useAuthStore from '../store/authStore';
import BootSplash from 'react-native-bootsplash';

// Auth Screens
import LoginScreen from '../screens/auth/login/LoginScreen';

// Main Screens
import HomeScreen from '../screens/main/home/HomeScreen';
import SortingPoolScreen from '../screens/main/sortingpool/SortingPoolScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="SortingPool" component={SortingPoolScreen} />
  </Stack.Navigator>
);

const AppStack = () => {
  const {isAuthenticated, isInitializing, initialize} = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      await initialize();
      BootSplash.hide({ fade: true });
    };
    initApp();
  }, [initialize]);

  if (isInitializing) {
    return null; // The native splash screen is visible here
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppStack;
