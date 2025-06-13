import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';

type RegisterStackParamList = {
  Step4_Email: undefined;
  Step5_VerifyEmail: { email: string };
  Step6_Password: undefined;
};

type NavigationProp = StackNavigationProp<RegisterStackParamList, 'Step4_Email'>;

const Step4_EmailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const tempPassword = 'defaultPassword123'; // 默认密码

  const handleSendVerification = async () => {
    try {
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email, tempPassword);
      await sendEmailVerification(user);
      navigation.navigate('Step5_VerifyEmail', { email });
    } catch (error: any) {
      Alert.alert('Registration Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your email?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendVerification}>
        <Text style={styles.buttonText}>Send Verification Email</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Step4_EmailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { borderBottomWidth: 1, fontSize: 18, paddingVertical: 8, marginBottom: 40 },
  button: { backgroundColor: '#383536', paddingVertical: 14, alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18 },
});
