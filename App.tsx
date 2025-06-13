import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { TransitionPresets } from '@react-navigation/stack'; // 修正导入路径

import Welcome from './src/modules/welcome/Welcome'
import Login from './src/modules/login/Login'
import MainTab from './src/modules/mainTab/MainTab';
import PostDetail from'./src/modules/home/ ArticleDetail/PostDetailScreen'
import PostScreen from './src/modules/Post_Screen/PostScreen'; // ✅ 确保 `PostScreen` 存在
import LoginScreen from './src/modules/login/LoginScreen';
import RegisterScreen from './src/modules/login/RegisterScreen';
import UserProfileScreen from './src/modules/me/UserProfileScreen'
import ChatScreen from './src/modules/message/ChatScreen'
import LikeNotificationPage from './src/modules/message/LikeNotificationPage'
import FollowNotificationPage from './src/modules/message/FollowNotificationPage'
import EditProfileScreen from './src/modules/me/EditProfileScreen'
import Step1_NameScreen from './src/modules/login/Register/Step1_NameScreen'
import Step2_BirthdayScreen from './src/modules/login/Register/Step2_BirthdayScreen'
import Step3_UsernameScreen from './src/modules/login/Register/Step3_UsernameScreen'
import Step4_EmailScreen from './src/modules/login/Register/Step4_EmailScreen'
import Step5_VerifyEmailScreen from './src/modules/login/Register/Step5_VerifyEmailScreen'
import Step6_PasswordScreen from './src/modules/login/Register/Step6_PasswordScreen'




import { LayoutAnimation, UIManager, Platform } from 'react-native';
import { SlideFromLeftIOS } from '@react-navigation/stack/lib/typescript/commonjs/src/TransitionConfigs/TransitionPresets';

if (Platform.OS === 'ios' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}


const Stack = createStackNavigator();
export type RegisterStackParamList = {
  Step1_Name: undefined;
  Step2_Birthday: { name: string };
  Step3_Username: { name: string; birthday: Date };
  Step4_Email: { name: string; birthday: Date; username: string };
  Step5_VerifyEmail: { name: string; birthday: Date; username: string; email: string };
  Step6_Password: undefined;
};

function App(): JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            cardStyle: { elevation: 1 }, // 添加阴影效果
            ...TransitionPresets.SlideFromRightIOS, // 默认使用滑动过渡
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={Welcome}
            options={{ headerShown: false }} // 隐藏标题栏
          />
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              headerShown: false,

            }}
          />
          <Stack.Screen 
            name="LoginScreen" 
            component={LoginScreen}
            options={{ headerShown: false }} // 隐藏标题栏
           />
          <Stack.Screen name="Step1_Name" component={Step1_NameScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Step2_Birthday" component={Step2_BirthdayScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Step3_Username" component={Step3_UsernameScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Step4_Email" component={Step4_EmailScreen} options={{ headerShown: false }}  />
        <Stack.Screen name="Step5_VerifyEmail" component={Step5_VerifyEmailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Step6_Password" component={Step6_PasswordScreen} options={{ headerShown: false }}  />
          


          <Stack.Screen
            name="MainTab"
            component={MainTab}
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="PostDetail"
            component={PostDetail}  
            options={{
              headerShown: false,
            }}
          />
           <Stack.Screen
            name="PostScreen"
                    component={PostScreen}
                    options={{ headerShown: false }} // 隐藏标题栏
            />
          <Stack.Screen 
            name="UserProfile" component={UserProfileScreen}
            options={{ headerShown: false }}
            />
          <Stack.Screen name="Chat" component={ChatScreen}
            options={{ headerShown: false }} />
          <Stack.Screen name="LikeNotification" 
            component={LikeNotificationPage} 
            options={{ headerShown: false }}/>
          <Stack.Screen name="FollowNotification" 
            component={FollowNotificationPage} 
            options={{ headerShown: false }}/>
          <Stack.Screen name="EditProfile" 
            component={EditProfileScreen} 
            options={{ headerShown: false }}/>
      </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;