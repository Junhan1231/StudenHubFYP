import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import PostScreen from '../Post_Screen/PostScreen'; 

import Home from '../home/Home';
import Map from '../map/Map';
import Message from '../message/Message';
import Me from '../me/Me';
import PostBTN from '../../img/PostBTN.png';

const BottomTab = createBottomTabNavigator();

const MyAppTabbar = ({ state, descriptors, navigation }: any) => {
    return (
        <View style={styles.TabbarContainer}>
            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const label = options.title;
                const isFocused = state.index === index;

                if (index === 2) { 
                    return (
                        <TouchableOpacity
                            key={label}
                            style={styles.TabItem}
                            onPress={() => navigation.navigate('PostScreen')} 
                        >
                            <Image source={PostBTN} style={styles.MainBTnContainer} />
                        </TouchableOpacity>
                    );
                }

                return (
                    <TouchableOpacity
                        key={label}
                        style={styles.TabItem}
                        onPress={() => navigation.navigate(route.name)}
                    >
                        <Text style={{
                            fontSize: isFocused ? 16 : 14,
                            color: isFocused ? '#333' : '#999',
                            fontWeight: isFocused ? 'bold' : 'normal'
                        }}>{label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default function BottomTabNavigator() {
    return (
        <View style={styles.root}>
            <BottomTab.Navigator tabBar={(props) => <MyAppTabbar {...props} />}>
                <BottomTab.Screen name='Home' component={Home} options={{ title: 'Main', headerShown: false }} />
                <BottomTab.Screen name='Map' component={Map} options={{ title: 'Map', headerShown: false }} />
                <BottomTab.Screen
                    name='Post'
                        component={PostScreen} 
                            options={{
                                        title: 'Post',
                                        headerShown: false,
                                        tabBarActiveTintColor: '#383536',
                                        tabBarInactiveTintColor: '#999',
                                    }}
                />
                
                <BottomTab.Screen name='Message' component={Message} options={{ title: 'Message',headerShown: false }} />
                <BottomTab.Screen name='Me' component={Me} options={{ title: 'User',headerShown: false  }} />
            </BottomTab.Navigator>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { width: '100%', height: '100%' },
    TabbarContainer: { width: '100%', height: 60, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white' },
    TabItem: { height: '100%', flex: 1, justifyContent: 'center', alignItems: 'center' },
    MainBTnContainer: { width: 100, height: 45, marginBottom: 10, resizeMode: 'contain' },
});
