import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView, Dimensions,
  TouchableOpacity, Image
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getFirestore, collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../config/firebaseConfig';

import Heart from '../components/Heart';
import * as Location from 'expo-location'; // ✅ 加了定位库

import icon_Switch from '../../img/Threeline.png';
import icon_Search from '../../img/Search.png';
import icon_Arrow from '../../img/icon_arrow.png';

type Post = {
  id: string;
  title: string;
  user: string;
  image: any;
  avatar?: any;
  category?: string;
  content?: string;
  uid?: string;
  likes?: string[];
  latitude?: number;  // ✅ 位置字段（确保有）
  longitude?: number;
};

type StackParamList = {
  Home: { newPost?: Post };
  PostDetail: { post: Post };
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const route = useRoute<RouteProp<StackParamList, 'Home'>>();
  const db = getFirestore(app);
  const auth = getAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'Follow' | 'NearBy' | 'Main'>('Main');
  const [selectedCategory, setSelectedCategory] = useState<string>('Recommend');
  const [modalExpanded, setModalExpanded] = useState(false);
  const [followingUIDs, setFollowingUIDs] = useState<string[]>([]);
  const [nearbyLocation, setNearbyLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationFetched, setLocationFetched] = useState(false);

  const fixedChannels = ['Recommend', 'College', 'Housing', 'Visa'];
  const allCategories = ['Recommend', 'College', 'Housing', 'Visa', 'Study', 'Working', 'Lifestyle', 'Finance', 'Travel', 'Mindset', 'Health'];
  const [myChannels, setMyChannels] = useState<string[]>([...fixedChannels]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'posts'), snapshot => {
      const fetchedPosts: Post[] = [];

      snapshot.forEach(docSnap => {
        const postData = docSnap.data();
        fetchedPosts.push({
          id: docSnap.id,
          title: postData.title || '',
          content: postData.content || '',
          user: postData.username || 'User',
          image: { uri: postData.image },
          avatar: postData.avatar ? { uri: postData.avatar } : null,
          category: postData.category || 'Other',
          uid: postData.uid || '',
          likes: postData.likes || [],
          latitude: postData.latitude, 
          longitude: postData.longitude,
        });
      });

      setPosts(fetchedPosts.reverse());
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      getDoc(userRef).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFollowingUIDs(data.following || []);
        }
      });
    }
  }, []);

  const handleTabPress = async (tab: 'Follow' | 'Main' | 'NearBy') => {
    if (tab === 'NearBy' && !locationFetched) {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access location was denied');
          return;
        }
        let location = await Location.getCurrentPositionAsync({});
        setNearbyLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        setLocationFetched(true);
      } catch (error) {
        console.error('Location error:', error);
      }
    }
    setActiveTab(tab);
  };

  const filteredPosts = posts.filter((item) => {
    if (activeTab === 'Follow') return followingUIDs.includes(item.uid || '');
    if (activeTab === 'Main') {
      if (selectedCategory === 'Recommend') {
        return Array.isArray(item.likes);
      } else {
        return item.category === selectedCategory;
      }
    }
    if (activeTab === 'NearBy') {
      if (nearbyLocation && item.latitude && item.longitude) {
        const distance = getDistanceFromLatLonInKm(
          nearbyLocation.latitude,
          nearbyLocation.longitude,
          item.latitude,
          item.longitude
        );
        return distance <= 10; // 只显示10km以内的
      }
      return false;
    }
    return true;
  });

  const toggleCategory = (category: string) => {
    if (fixedChannels.includes(category)) return;
    setMyChannels((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const renderCategoryTabs = () => {
    const styles = StyleSheet.create({
      container: {
        width: '100%',
        height: modalExpanded ? undefined : 36,
        backgroundColor: 'white',
      },
      scrollView: {
        flexDirection: 'row',
        height: 36,
      },
      tabitem: {
        marginLeft: 20,
        width: 70,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
      },
      tabItemTxt: {
        fontSize: 12,
        color: '#999',
      },
      tabItemTxtSelected: {
        color: '#333',
      },
      openButton: {
        width: 40,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
      },
      openImg: {
        width: 18,
        height: 18,
        transform: [{ rotate: modalExpanded ? '90deg' : '-90deg' }],
      },
      Cover: {
        position: 'absolute',
        top: 36,
        left: 0,
        right: 0,
        zIndex: 999,
        backgroundColor: 'white',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderColor: '#eee',
      },
      modalWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
      },
      categoryBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 14,
        borderWidth: 1,
        margin: 6,
      },
    });

    return (
      <View style={styles.container}>
        <View style={{ flexDirection: 'row' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
            {myChannels.map((cat, index) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat || index}
                  style={styles.tabitem}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.tabItemTxt, isSelected && styles.tabItemTxtSelected]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={styles.openButton} onPress={() => setModalExpanded(!modalExpanded)}>
            <Image style={styles.openImg} source={icon_Arrow} />
          </TouchableOpacity>
        </View>
        {modalExpanded && (
          <View style={styles.Cover}>
            <View style={styles.modalWrap}>
              {allCategories.map((cat) => {
                const isSelected = myChannels.includes(cat);
                const isFixed = fixedChannels.includes(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryBtn, { borderColor: isSelected ? '#999' : '#eee', backgroundColor: isFixed ? '#ddd' : '#f9f9f9' },
                    ]}
                    onPress={() => toggleCategory(cat)}
                    disabled={isFixed}
                  >
                    <Text style={{ color: isFixed ? '#666' : '#333', fontSize: 12 }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerLayout}>
      <TouchableOpacity style={styles.switchButton}>
        <Image style={styles.icon} source={icon_Switch} />
      </TouchableOpacity>

      {['Follow', 'Main', 'NearBy'].map(tab => (
        <TouchableOpacity key={tab} style={styles.tabButton} onPress={() => handleTabPress(tab as any)}>
          <Text style={activeTab === tab ? styles.tabTxtSelected : styles.tabTxt}>{tab}</Text>
          {activeTab === tab && <View style={styles.line} />}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.searchButton}>
        <Image style={styles.icon} source={icon_Search} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('PostDetail', { post: item })}>
      <Image source={item.image} style={styles.itemImage} />
      <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.userContainer}>
        {item.avatar && <Image source={item.avatar} style={styles.userAvatar} />}
        <Text style={styles.userName}>{item.user}</Text>
        <Heart postId={item.id} postOwnerId={item.uid!} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {renderHeader()}
      {renderCategoryTabs()}
      <FlatList
        style={styles.flatlist}
        contentContainerStyle={styles.container}
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
      />
    </View>
  );
}

// 🔥 计算两个经纬度之间的距离
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f0f0f0' },
  headerLayout: {
    width: '100%', height: 100, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'white', paddingHorizontal: 10, justifyContent: 'space-between',
  },
  icon: { width: 26, height: 26 },
  switchButton: { paddingRight: 12, marginRight: 30, marginTop: 50 },
  searchButton: { paddingLeft: 12, marginLeft: 30, marginTop: 50 },
  tabButton: {
    marginTop: 50, flex: 1, flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  tabTxt: { fontSize: 17, color: '#999' },
  tabTxtSelected: { fontSize: 18, color: '#383536', fontWeight: 'bold' },
  line: { width: 40, height: 2, backgroundColor: '#303080', borderRadius: 1, marginTop: 4 },
  flatlist: { flex: 1 },
  container: {},
  item: {
    width: (SCREEN_WIDTH - 24) / 2, backgroundColor: 'white', marginTop: 6,
    marginLeft: 6, marginRight: 6, marginBottom: 6, borderRadius: 8, overflow: 'hidden',
  },
  itemImage: { width: '100%', height: 230, resizeMode: 'cover' },
  itemTitle: { fontSize: 13, color: '#333', marginHorizontal: 8, marginTop: 4, fontWeight: 'bold' },
  userContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 8, marginHorizontal: 8 },
  userAvatar: { width: 20, height: 20, borderRadius: 10, marginRight: 6 },
  userName: { fontSize: 13, color: '#999', flex: 1 },
});
