import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

// 👇 复制 Stack 类型
type RegisterStackParamList = {
  Step1_Name: undefined;
  Step2_Birthday: { name: string };
  Step3_Username: { name: string; birthday: Date };
  Step4_Email: { name: string; birthday: Date; username: string };
  Step5_VerifyEmail: { name: string; birthday: Date; username: string; email: string };
  Step6_Password: undefined;
};

// 👇 类型绑定
type Step2NavigationProp = StackNavigationProp<RegisterStackParamList, 'Step2_Birthday'>;
type Step2RouteProp = RouteProp<RegisterStackParamList, 'Step2_Birthday'>;

const Step2_BirthdayScreen = () => {
  const navigation = useNavigation<Step2NavigationProp>();
  const route = useRoute<Step2RouteProp>();
  const { name } = route.params;

  const [birthday, setBirthday] = useState(new Date(2000, 0, 1));
  const [showPicker, setShowPicker] = useState(false);

  const handleNext = () => {
    navigation.navigate('Step3_Username', { name, birthday });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>When's your birthday?</Text>

      <TouchableOpacity style={styles.input} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateText}>{birthday.toDateString()}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={birthday}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === 'ios');
            if (selectedDate) setBirthday(selectedDate);
          }}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Step2_BirthdayScreen;

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
    paddingVertical: 12,
    marginBottom: 40,
  },
  dateText: {
    fontSize: 18,
    color: '#333',
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
