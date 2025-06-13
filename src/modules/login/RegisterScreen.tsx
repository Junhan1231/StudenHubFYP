import React, { useState } from "react";
import { View, TextInput, Button, Text, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from '@react-navigation/stack';

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation<StackNavigationProp<any>>();

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Registration successful!");
      navigation.replace("MainTab");
    } catch (error: any) {
      Alert.alert("Registration failed", error.message);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text> Email</Text>
      <TextInput style={{ borderWidth: 1, width: 200, marginBottom: 10, padding: 5 }} value={email} onChangeText={setEmail} />
      <Text>Password</Text>
      <TextInput style={{ borderWidth: 1, width: 200, marginBottom: 10, padding: 5 }} secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Register" onPress={handleSignUp} />
    </View>
  );
}
