import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RegisterStackParamList = {
  Step6_Password: undefined;
};

type NavigationProp = StackNavigationProp<RegisterStackParamList, 'Step6_Password'>;

const Step5_VerifyEmailScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check your inbox 📬</Text>
      <Text style={styles.subtitle}>We sent you a verification link. Please verify to continue.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Step6_Password')}>
        <Text style={styles.buttonText}>I've Verified</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Step5_VerifyEmailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40 },
  button: { backgroundColor: '#000', paddingVertical: 14, alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18 },
});
