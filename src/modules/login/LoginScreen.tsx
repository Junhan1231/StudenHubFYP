import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<StackNavigationProp<any>>();
  
  const isLoginEnabled = email.length > 5 && password.length >= 6;

  const handleSignIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful! User information：", userCredential.user);
      //Alert.alert("✅ 登录成功", `欢迎, ${userCredential.user.email}`);
      navigation.replace("MainTab");
    } catch (error: any) {
      console.error("❌ login fail", error);
      //Alert.alert("❌ 登录失败", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <Text style={styles.label}>User Registed Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Please enter your email"
        placeholderTextColor="#aaa"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

    
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Please enter your password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />


      <TouchableOpacity onPress={() => Alert.alert("Forgotten password", "Please contact the administrator to reset your password.")} style={styles.forgotPassword}>
        <Text style={styles.forgotText}>Forgot your Password？</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[styles.loginButton, !isLoginEnabled && styles.loginButtonDisabled]}
        onPress={handleSignIn}
        disabled={!isLoginEnabled}
      >
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop:30,
  },
  label: {
    fontSize: 16,
    color: "#888",
    marginBottom: 5,
    marginTop:30,
  },
  input: {
    height: 45,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    fontSize: 14,
    color: "#000",
    marginBottom: 20,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: "#007AFF",
  },
  loginButton: {
    height: 50,
    backgroundColor: "#383536",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop:70,
  },
  loginButtonDisabled: {
    backgroundColor: "#ccc",
  },
  loginText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    
  },
});
