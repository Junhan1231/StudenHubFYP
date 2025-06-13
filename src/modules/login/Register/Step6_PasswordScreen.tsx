import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getAuth, updatePassword } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RegisterStackParamList = {
  MainTab: undefined;
};

type NavigationProp = StackNavigationProp<RegisterStackParamList, 'MainTab'>;

const Step6_PasswordScreen = () => {
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const handleComplete = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        await updatePassword(user, password);
        Alert.alert('Success', 'Account setup complete!');
        navigation.navigate('MainTab');
      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set your password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.buttonText}>Finish</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Step6_PasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { borderBottomWidth: 1, fontSize: 18, paddingVertical: 8, marginBottom: 40 },
  button: { backgroundColor: '#000', paddingVertical: 14, alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18 },
});
