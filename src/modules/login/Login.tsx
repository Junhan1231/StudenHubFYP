import React, {useState} from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {formatPhone} from '../../modules/utils/StringUtil'
import {replaceBlank} from '../..//modules/utils/StringUtil'
import {LayoutAnimation} from 'react-native'

import * as GoogleSignIn from 'expo-google-sign-in';
import * as Google from "expo-auth-session/providers/google"; 
import { auth } from '../../config/firebaseConfig';
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import * as WebBrowser from 'expo-web-browser';

import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";

import { Animated } from 'react-native';


import {get} from '../../modules/utils/request'
import {post} from '../../modules/utils/request'

  
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    TextInput,
} from 'react-native';

import MainIcon from '../../img/MainIcon.png';
import UnSelected_ICON from '../../img/Unselected.png'
import Selected_ICON from'../../img/Selected.png'
import RightArrow from '../../img/RightArrow.png'
import GmailLogin from '../../img/Gmail.png'
import IphoneLogin from '../../img/Apple.png'
import TriangoArrow from '../../img/TriangoArrow.png'
import HidePWD from '../../img/HidePWD.png'
import SEEPWD from '../../img/SeePWD.png'
import Switch from '../../img/Switch.png'
import CloseIcon from '../../img/CloseIcon.png'


export default () => {
    const navigation = useNavigation<StackNavigationProp<any>>();

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: "627756446259-29m5l7ucbjs1osahhg6l30v7h54cjssr.apps.googleusercontent.com", // Web 客户端 ID
        iosClientId: "627756446259-29m5l7ucbjs1osahhg6l30v7h54cjssr.apps.googleusercontent.com", // 你的 iOS 客户端 ID
        redirectUri: "https://auth.expo.io/@junhanfinalyearproject/StudentHub",

    });
    const handleGoogleLogin = async () => {
        try {
            const result = await promptAsync();
            console.log("Google Login result:", result); 
            if (result?.type === "success") {
                const { id_token } = result.params;
                console.log("ID Token:", id_token); 
                const credential = GoogleAuthProvider.credential(id_token);
                await signInWithCredential(auth, credential);
                console.log("✅ Google success！");
                navigation.replace("MainTab");
            }
        } catch (error) {
            console.error("❌ Google fail", error);
        }
    };
    

    const onPressLogin = async() =>{
        if(!canLogin){
            return;
        }
        navigation.replace('MainTab');
        const purePhone = replaceBlank(phone);

    }

    const [loginType, setLoginType] = useState<'quick' | 'input'>('quick');
    const [check, setCheck] = useState<boolean>(false);
    const [eveOpen,setEyeopen] = useState<boolean>(true);

    const[phone,setPhone] = useState<string>('');
    const[pwd,setPwd] = useState<string>('');
    const canLogin = phone ?.length == 12 &&pwd?.length === 6;



    const renderQuickLogin = () =>{
        return(
            <View style = {styles.root}>
                <View style={styles.protocolLayout}>
                    <TouchableOpacity

                        onPress={() =>{
                            setCheck(!check);
                        }}
                    
                    >
                    <Image source={check ? Selected_ICON : UnSelected_ICON} style={styles.CheckButton}/>
                    </TouchableOpacity>
                    <Text style = {styles.LableText}>I Know that I am reading</Text>
                </View>
                <TouchableOpacity 
                    style = {styles.OtherwaytoLogin}
                    onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        setLoginType((type:'quick' | 'input') => {

                            if(type === 'quick') {
                                return 'input';
                            }
                            return 'quick';
                        });
                    }}  
                    >
                        <Text style={styles.OtherwaytoLoginTxt}>Other Login Methods</Text>
                        <Image source={RightArrow} style = {styles.Arrow_Icon}></Image>
                </TouchableOpacity>

                <TouchableOpacity 
                    style = {styles.GoogleLoginButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("Step4_Email")}
                >
                    
                    <Text style ={styles.GoogleLogin}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style = {styles.FastLoginButton}
                    activeOpacity={0.7}
                    onPress={() => navigation.navigate("LoginScreen")}
                >
    
                    <Text style ={styles.FastLogin}>Login</Text>
                </TouchableOpacity>

                <Image source={MainIcon} style = {styles.LogoMain}></Image>
                
            </View>
        );

    }

    const renderInputLogin = () =>{

        return(
            <View style ={OtherWayLoginStyles.root}>

                <Text style  = {OtherWayLoginStyles.accountLogin}>Login with Password</Text>
                <Text style  = {OtherWayLoginStyles.Notice}>Unregistered numbers will be registered at login</Text>
                <View style = {OtherWayLoginStyles.PhoneLayout}>
                    <Text style = {OtherWayLoginStyles.IrelandNumber}>+353</Text>     
                    <Image source={TriangoArrow} style = {OtherWayLoginStyles.TriangoA}></Image> 
                    <TextInput
                        style = {OtherWayLoginStyles.phoneInput}
                        placeholderTextColor="#999"
                        placeholder='Please Enter the Phone number'
                        autoFocus = {false}
                        keyboardType='number-pad'
                        maxLength = {12}
                        value={phone}
                        onChangeText={(text:string) => {
                            setPhone(formatPhone(text));
                        }}   
                        />
                </View>

                <View style = {OtherWayLoginStyles.PWDLayout}>  
                    <TextInput
                        style = {[OtherWayLoginStyles.phoneInput,OtherWayLoginStyles.PWDInput]}
                        placeholderTextColor="#999"
                        placeholder='Please Enter the Password'
                        autoFocus = {false}
                        keyboardType='number-pad'
                        maxLength={6}
                        secureTextEntry = {!eveOpen}
                        value={pwd} 
                        onChangeText={(text: string) => {
                            setPwd(text);
                        }}
                    />

                    <TouchableOpacity
                        onPress={() => {
                            setEyeopen(!eveOpen)
                        }}
                    
                    >
                        <Image 
                            source={eveOpen ? SEEPWD : HidePWD} 
                            style={OtherWayLoginStyles.HidePWD}
                        />
                    </TouchableOpacity>

                </View>

                <View style = {OtherWayLoginStyles.changeLayout}>

                    <Image source={Switch} style = {OtherWayLoginStyles.Switch_Icon}></Image>
                    <Text style = {OtherWayLoginStyles.SwitchTxt}>Code-Based Login</Text>
                    <Text style = {OtherWayLoginStyles.ForgetPWD}>Forgot Password?</Text>
                </View>

                <TouchableOpacity
                    activeOpacity={canLogin ? 0.7 : 1}
                    style = { 
                        canLogin ? OtherWayLoginStyles.loginBtn : OtherWayLoginStyles.loginBtnDisable
                    }
                    onPress = {onPressLogin}
                >
                    <Text
                        style = {OtherWayLoginStyles.loginTxt}
                    >Login</Text>
                </TouchableOpacity>

                <View style = {OtherWayLoginStyles.AppleGmailLogin}>
                    <Image source={IphoneLogin} style ={OtherWayLoginStyles.AppleLogin}></Image>
                    <Image source={GmailLogin} style ={OtherWayLoginStyles.GmailLogin}></Image>
                </View>

                <TouchableOpacity
                    style = {OtherWayLoginStyles.Closebtn}
                    onPress={() => {
                        LayoutAnimation.easeInEaseOut();
                        setLoginType('quick')
                    }}
                >
                    <Image source={CloseIcon} style = {OtherWayLoginStyles.CloseImg} ></Image>
                </TouchableOpacity>
            </View> 
        );

    }


    
    return (
        <View style={styles.root}>
            {
                loginType === 'quick' ?
                renderQuickLogin() : renderInputLogin()
            }

        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        width: '100%',
        height: '100%',
        flexDirection:'column-reverse',
        backgroundColor: 'white',
        alignItems: 'center',
        paddingHorizontal: 56,
    },
    protocolLayout: {
        width: '100%',
        flexDirection : 'row',
        alignItems: 'center',
        marginBottom:40,

    },
    CheckButton: {
        width:16,
        height:16,
    },
    LableText: {
        fontSize:12,
        color:'#999',
        marginLeft:6,
    },
    OtherwaytoLogin: {
        flexDirection:'row',
        alignItems:'center',
        paddingVertical:20,
        paddingHorizontal:10,
        marginBottom:120,

    },OtherwaytoLoginTxt:{
        fontSize:16,
        color:'#303080'

    },Arrow_Icon:{
        width:16,
        height:16,
        resizeMode:'contain',
        marginLeft: 6,
    },GoogleLoginButton: {

        width:'160%',
        height:56,
        backgroundColor:'#383536',
        borderRadius:28,
        justifyContent:'center',
        alignItems:'center',
        flexDirection: 'row',

    },GmailStyle:{
        width:25,
        height:25,

    },GoogleLogin:{
        fontSize:18,
        color:'white',
        marginLeft:6,

    },FastLoginButton:{
        width:'160%',
        height:56,
        backgroundColor:'#ffbd59',
        borderRadius:28,
        justifyContent:'center',
        alignItems:'center',
        flexDirection: 'row',
        marginBottom:20,

    },FastLogin:{

        fontSize:20,
        color:'white',
        marginLeft:6,

    },LogoMain:{
        width:300,
        height:200,
        resizeMode:'contain',
        position:"absolute",
        top: 120,
    },
});

const OtherWayLoginStyles = StyleSheet.create({

    root:{

        width:'100%',
        height:'100%',
        flexDirection:'column',
        alignItems:'center',
        backgroundColor:'white',
        paddingHorizontal:40,

    },accountLogin:{
        fontSize:23,
        width:'160%',
        textAlign: 'center',
        color:'#333',
        fontWeight:'bold',
        marginTop:150,
    },Notice:{

        fontSize:15,
        color:'#bbb',
        marginTop:6,
        width:'160%',
        textAlign: 'center',
    },PhoneLayout:{
        width:'140%',
        height:64,
        flexDirection:'row',
        alignItems:'center',
        borderBottomWidth:1,
        borderBlockColor:'#ddd',
        marginTop:20,

    },selectedCode:{
        fontSize: 16,
        marginRight: 10,
    },IrelandNumber:{

        fontSize:20,
        color:'#ddd',
        marginTop:20,


    },TriangoA:{

        width:10,
        height:7, 
        marginLeft:4,
        marginTop:20,
    },phoneInput: {
        flex:1,
        height:64,
        backgroundColor:'transparent',
        textAlign:'left',
        textAlignVertical:'center',
        fontSize:16,
        color: '#333',
        marginLeft:8,
        marginTop:20,

    },PWDLayout:{

        width:'140%',
        height:64,
        flexDirection:'row',
        alignItems:'center',
        borderBottomWidth:1,
        borderBlockColor:'#ddd',
        marginTop:8,

    },PWDInput:{
        marginLeft:0,
        marginRight:16,
        marginTop:20,


    },HidePWD:{
        width:25,
        height:25,
        marginTop:23,

    },changeLayout:{

        width:'100%',
        marginTop:10,
        alignItems:'center',
        flexDirection:'row',

    },Switch_Icon:{

        width:15,
        height:15,
        marginLeft:-42,

    },SwitchTxt:{
        fontSize:14,
        color:'#303080',
        marginLeft:5,

    },ForgetPWD:{

        fontSize:14,
        color:'#303080',
        marginLeft:50,

    },loginBtn:{

        width:'140%',
        height:56,
        backgroundColor: '#383536',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:28,
        marginTop:25,

    },loginBtnDisable:{

        width:'140%',
        height:56,
        backgroundColor: '#DDDDDD',
        justifyContent:'center',
        alignItems:'center',
        borderRadius:28,
        marginTop:25,

    },
    loginTxt:{

        fontSize:19,
        color:'white'

    },AppleGmailLogin:{

        width:'100%',
        flexDirection:'row',
        marginTop:100,
        justifyContent:'center'

    },AppleLogin:{
        width:45,
        height:45,
        marginRight:200, 

    },GmailLogin:{
        width:63,
        height:63,
        marginTop:-4,
        marginLeft:-90,
    },Closebtn:{

        position:'absolute',
        left:-20,
        top:65,

    },CloseImg:{
        width:28,
        height:28,
    }

            
})