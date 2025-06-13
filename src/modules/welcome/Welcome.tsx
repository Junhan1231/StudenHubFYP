import React ,{useEffect} from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import {
    View,
    Image,
    StyleSheet
} from 'react-native';

import MainIcon from '../../img/MainIcon.png';

export default () => {

    useEffect(() => {
        setTimeout(() =>{
            startLogin();
        }, 3000);
    },[]);

    const navigation = useNavigation<StackNavigationProp<any>>();

    const startLogin = () =>{
        navigation.replace('Login');
    }
    return (
        <View style={styles.root}>
            <Image source={MainIcon} style = {styles.logo_main}/>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        flexDirection: 'column',
        alignItems: 'center',
    },
    logo_main: {
        width: 300,
        height: 180,
        marginTop: 220,
        //resizeMode:'contain',
    },
});