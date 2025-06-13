import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Stack type
type RegisterStackParamList = {
  Step1_Name: undefined;
  Step2_Birthday: { name: string };
  Step3_Username: { name: string; birthday: Date };
  Step4_Email: { name: string; birthday: Date; username: string };
  Step5_VerifyEmail: { name: string; birthday: Date; username: string; email: string };
  Step6_Password: undefined;
};

// ✅ 给 navigation 添加类型（当前页面是 Step1）
type Step1ScreenNavigationProp = StackNavigationProp<RegisterStackParamList, 'Step1_Name'>;

const Step1_NameScreen = () => {
  const [name, setName] = useState('');
  const navigation = useNavigation<Step1ScreenNavigationProp>();

  const handleNext = () => {
    if (name.trim() !== '') {
      navigation.navigate('Step2_Birthday', { name });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>What's your name?</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={name}
        onChangeText={setName}
      />
      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Step1_NameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    borderBottomWidth: 1,
    fontSize: 18,
    paddingVertical: 8,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
