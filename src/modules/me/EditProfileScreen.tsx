import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Image, TouchableOpacity,
  ScrollView, Alert
} from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { app } from '../../config/firebaseConfig';
import seetingIcon from '../../img/settings.png';

export default function EditProfileScreen({ navigation }: any) {
  const auth = getAuth();
  const db = getFirestore(app);
  const user = auth.currentUser;
  const uid = user?.uid;

  const [avatar, setAvatar] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [username, setUsername] = useState('');
  const [redbookId, setRedbookId] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [region, setRegion] = useState('');
  const [job, setJob] = useState('');
  const [school, setSchool] = useState('');

  useEffect(() => {
    if (!uid) return;

    const fetchUser = async () => {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setUsername(data.username || '');
        setRedbookId(data.redbookId || '');
        setBackgroundImage(data.backgroundImage || '');
        setBio(data.bio || '');
        setAvatar(data.avatar || '');
        setGender(data.gender || '');
        setBirthday(data.birthday || '');
        setRegion(data.region || '');
        setJob(data.job || '');
        setSchool(data.school || '');
      }
    };

    fetchUser();
  }, []);

  const pickImage = async (type: 'avatar' | 'background') => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      type === 'avatar' ? setAvatar(uri) : setBackgroundImage(uri);
    }
  };

  const saveProfile = async () => {
    if (!uid) return;

    await updateDoc(doc(db, 'users', uid), {
      username,
      redbookId,
      backgroundImage,
      avatar,
      bio,
      gender,
      birthday,
      region,
      job,
      school,
    });

    Alert.alert('保存成功', '个人资料已更新');
    navigation.goBack();
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profiles</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Image source={seetingIcon} style={styles.settingIcon} />
        </TouchableOpacity>
      </View>


      <TouchableOpacity onPress={() => pickImage('avatar')} style={styles.centered}>
        <Image source={avatar ? { uri: avatar } : require('../../img/icon_heart.png')} style={styles.avatar} />
      </TouchableOpacity>


      <View style={styles.form}>
        {renderItem('Name', username, setUsername)}
        {renderItem('StudentHubID', redbookId, setRedbookId)}
        <TouchableOpacity onPress={() => pickImage('background')}>
          <View style={styles.row}>
            <Text style={styles.label}>Background Image</Text>
            {backgroundImage ? (
              <Image source={{ uri: backgroundImage }} style={styles.bgPreview} />
            ) : (
              <Text style={styles.placeholder}>Select image</Text>
            )}
          </View>
        </TouchableOpacity>
        {renderItem('Bio', bio, setBio)}
        {renderItem('Gender', gender, setGender)}
        {renderItem('Birthday', birthday, setBirthday)}
        {renderItem('Country', region, setRegion)}
        {renderItem('Opportunity', job, setJob)}
        {renderItem('College', school, setSchool)}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const renderItem = (label: string, value: string, onChange: (v: string) => void) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={`Enter ${label}`}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
    borderBottomWidth: 1, borderColor: '#eee',
    marginTop:40,
  },
  backBtn: { fontSize: 24, color: '#333' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  settingIcon: { width: 22, height: 22, tintColor: '#666' },

  centered: { alignItems: 'center', marginTop: 10 },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },

  form: { paddingHorizontal: 16, marginTop: 20 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#eee',
  },
  label: { fontSize: 15, color: '#666' },
  input: { flex: 1, textAlign: 'right', fontSize: 15, color: '#333' },
  placeholder: { fontSize: 14, color: '#aaa' },
  bgPreview: { width: 40, height: 40, borderRadius: 6 },

  saveBtn: {
    margin: 20, backgroundColor: '#383536',
    borderRadius: 25, alignItems: 'center', padding: 12,
  },
  saveText: { color: 'white', fontSize: 16 },
});
