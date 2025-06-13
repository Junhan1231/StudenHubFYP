import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { StackNavigationProp } from '@react-navigation/stack';

import UserPageBackground from '../../img/MePageUserBackground.png';
import PlaceholderAvatar from '../placeholder_images/Profiel1.jpg';

export default function UserProfileScreen() {
  const { params } = useRoute<any>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const viewedUid = params?.uid;

  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUser = getAuth().currentUser;

  const db = getFirestore();

  useEffect(() => {
    if (!viewedUid) return;

    const fetchUserData = async () => {
      const userRef = doc(db, 'users', viewedUid);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    };

    const fetchPosts = async () => {
      const q = query(collection(db, 'posts'), where('uid', '==', viewedUid));
      const snap = await getDocs(q);
      const posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUserPosts(posts);
    };

    const checkFollowing = async () => {
      if (!currentUser) return;
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const currentSnap = await getDoc(currentUserRef);
      if (currentSnap.exists()) {
        const data = currentSnap.data();
        setIsFollowing(data.following?.includes(viewedUid));
      }
    };

    fetchUserData();
    fetchPosts();
    checkFollowing();
  }, [viewedUid]);

  const toggleFollow = async () => {
    if (!currentUser || !viewedUid) return;
    const currentRef = doc(db, 'users', currentUser.uid);

    try {
      await updateDoc(currentRef, {
        following: isFollowing ? arrayRemove(viewedUid) : arrayUnion(viewedUid)
      });
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.log('Failed to update follow', err);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity style={styles.postCard} onPress={() => navigation.navigate('PostDetail', { post: item })}>
      <Image source={{ uri: item.image }} style={styles.postImage} />
      <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (!userData) {
    return <Text style={{ marginTop: 100, textAlign: 'center' }}>Loading...</Text>;
  }

  return (
    <View style={styles.root}>
      <Image style={styles.bgImg} source={UserPageBackground} />
      <View style={styles.profileHeader}>
        <Image source={userData.avatar ? { uri: userData.avatar } : PlaceholderAvatar} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{userData.username || 'User'}</Text>
          <Text style={styles.uid}>ID: {viewedUid.slice(0, 6)}...</Text>
        </View>
        <TouchableOpacity style={styles.followBtn} onPress={toggleFollow}>
          <Text style={styles.followTxt}>{isFollowing ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chatBtn} onPress={() => navigation.navigate('Chat', { recipientUid: viewedUid })}>
          <Text style={styles.chatTxt}>Chat</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <FlatList
          data={userPosts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.postList}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>该用户还没有发布任何帖子</Text>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#1C1C1E' },
  bgImg: { position: 'absolute', top: 0, width: '100%', height: 260 },
  profileHeader: {
    marginTop: 120,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: '#ccc',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  uid: {
    fontSize: 13,
    color: '#ccc',
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 6,
  },
  followTxt: {
    color: '#383536',
    fontSize: 14,
    fontWeight: 'bold',
  },
  chatBtn: {
    backgroundColor: '#383536',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 6,
  },
  chatTxt: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  postList: {
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  postCard: {
    width: '48%',
    margin: '1%',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  postTitle: {
    padding: 8,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
});
