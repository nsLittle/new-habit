import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [userContext, setUserContext] = useState({
        username: null,
        userId: null,
        habitId: null,
        token: null,
    });

    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                const storedUserId = await AsyncStorage.getItem('userId');
                const storedHabitId = await AsyncStorage.getItem('habitId');

                let storedToken = await SecureStore.getItemAsync('token');
                if (!storedToken) {
                    storedToken = await AsyncStorage.getItem('token');
                }

                console.log("Loaded Token:", storedToken); // ✅ Debugging output

                if (storedUsername && storedUserId) {
                    setUserContext({
                        username: storedUsername,
                        userId: storedUserId,
                        habitId: storedHabitId,
                        token: storedToken || null,
                    });
                }
            } catch (error) {
                console.error('Error retrieving user info:', error);
            }
        };

        loadUserInfo();
    }, []);

    useEffect(() => {
        const saveUserInfo = async () => {
            if (userContext.token) {
                await SecureStore.setItemAsync('token', userContext.token);
                await AsyncStorage.setItem('token', userContext.token);
            }
            if (userContext.userId) {
                await AsyncStorage.setItem('userId', userContext.userId);
            }
        };

        saveUserInfo();
    }, [userContext]);
    

    return (
        <UserContext.Provider value={{ userContext, setUserContext }}>
            {children}
        </UserContext.Provider>
    );
};
