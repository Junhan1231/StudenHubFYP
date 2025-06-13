import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, getDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const tagOptions = ['Recommend', 'Visa', 'College', 'Housing', 'Travel'];
const locationOptions = ['TUD Grangegoman', 'Clarkes Bakery', 'Manor Takeaway'];

export default function PostScreen({ navigation }: any) {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [username, setUsername] = useState<string>('User');

  const [selectedTag, setSelectedTag] = useState<string>('Recommend');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getFirestore();
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAvatar(data.avatar || '');
            setUsername(data.username || 'User');
          }
        }
      } catch (error) {
        console.log('❌ 获取用户信息失败:', error);
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
    };
  }, [navigation]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要访问权限', '请允许访问媒体库');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedImages([...selectedImages, result.assets[0].uri]);
    }
  };

  const handlePost = async () => {
    if (!title || selectedImages.length === 0) {
      Alert.alert('错误', '请添加标题和图片');
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('未登录', '请先登录');
        return;
      }

      const db = getFirestore();
      const newPost = {
        title,
        content,
        image: selectedImages[0],
        uid: user.uid,
        username,
        avatar,
        tag: selectedTag,
        location: selectedLocation,
        category: selectedTag, // 用作 Home 页面筛选分类
        timestamp: Timestamp.now(),
      };

      await addDoc(collection(db, 'posts'), newPost);

      Alert.alert('✅ 发布成功', '你的帖子已保存到数据库');
      navigation.navigate('MainTab', { screen: 'Home' });

    } catch (error) {
      console.error('❌ 保存帖子失败:', error);
      Alert.alert('发布失败', '请稍后再试');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>〈 Back</Text>
      </TouchableOpacity>

      <View style={styles.imageContainer}>
        {selectedImages.map((img, index) => (
          <Image key={index} source={{ uri: img }} style={styles.image} />
        ))}
        <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
          <Text style={styles.imageText}>+</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Add Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.textArea}
        placeholder="Add Text"
        value={content}
        onChangeText={setContent}
        multiline
      />

      {/* 标签选择 */}
      <Text style={styles.sectionTitle}>选择标签</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagContainer}>
        {tagOptions.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, tag === selectedTag && styles.tagSelected]}
            onPress={() => setSelectedTag(tag)}
          >
            <Text style={tag === selectedTag ? styles.tagTextSelected : styles.tagText}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 地点选择 */}
      <Text style={styles.sectionTitle}>添加地点</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScroll}>
        {locationOptions.map((loc) => (
          <TouchableOpacity
            key={loc}
            style={[styles.location, selectedLocation === loc && styles.tagSelected]}
            onPress={() => setSelectedLocation(loc)}
          >
            <Text style={selectedLocation === loc ? styles.tagTextSelected : styles.tagText}>{loc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.postButton} onPress={handlePost}>
        <Text style={styles.postButtonText}>发布帖子</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: '20%', backgroundColor: '#fff', padding: 20 },
  backButton: { marginBottom: 10 },
  backText: { fontSize: 16, color: '#555' },
  imageContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  imagePicker: {
    width: 80, height: 80, backgroundColor: '#f0f0f0',
    justifyContent: 'center', alignItems: 'center', borderRadius: 10
  },
  imageText: { fontSize: 30, color: '#888' },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  input: {
    height: 50, borderBottomWidth: 1,
    borderBottomColor: '#ddd', marginBottom: 20, fontSize: 16
  },
  textArea: {
    height: 100, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 20
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  tagContainer: { flexDirection: 'row', marginBottom: 20 },
  tag: {
    paddingVertical: 6, paddingHorizontal: 14,
    backgroundColor: '#f5f5f5', borderRadius: 15, marginRight: 10
  },
  tagSelected: { backgroundColor: '#383536' },
  tagText: { color: '#333' },
  tagTextSelected: { color: '#fff' },
  locationScroll: { flexDirection: 'row', marginBottom: 20 },
  location: {
    paddingVertical: 6, paddingHorizontal: 14,
    backgroundColor: '#f5f5f5', borderRadius: 15, marginRight: 10
  },
  postButton: {
    backgroundColor: '#383536', padding: 15,
    borderRadius: 30, alignItems: 'center'
  },
  postButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});