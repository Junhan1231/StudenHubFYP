import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type RegisterStackParamList = {
  Step1_Name: undefined;
  Step2_Birthday: { name: string };
  Step3_Username: { name: string; birthday: Date };
  Step4_Email: { name: string; birthday: Date; username: string };
  Step5_VerifyEmail: { name: string; birthday: Date; username: string; email: string };
  Step6_Password: undefined;
};

type NavigationProp = StackNavigationProp<RegisterStackParamList, 'Step3_Username'>;
type RoutePropType = RouteProp<RegisterStackParamList, 'Step3_Username'>;

const Step3_UsernameScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { name, birthday } = route.params;

  const [username, setUsername] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a username</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. student2025"
        value={username}
        onChangeText={setUsername}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => username.trim() && navigation.navigate('Step4_Email', { name, birthday, username })}
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Step3_UsernameScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { borderBottomWidth: 1, fontSize: 18, paddingVertical: 8, marginBottom: 40 },
  button: { backgroundColor: '#000', paddingVertical: 14, alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18 },
});
