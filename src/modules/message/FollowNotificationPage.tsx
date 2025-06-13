import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
} from 'firebase/firestore';
import { app } from '../../config/firebaseConfig';

export default function FollowerNotificationPage() {
  const auth = getAuth();
  const db = getFirestore(app);
  const currentUser = auth.currentUser;
  const [followers, setFollowers] = useState<any[]>([]);

  useEffect(() => {
    const fetchFollowers = async () => {
      if (!currentUser) return;

      const userListSnapshot = await getDocs(collection(db, 'users'));
      const myUid = currentUser.uid;
      const newFollowers: any[] = [];

      for (const userDoc of userListSnapshot.docs) {
        const data = userDoc.data();
        const isFollowingMe = data.following?.includes(myUid);
        if (isFollowingMe) {
          newFollowers.push({
            uid: userDoc.id,
            username: data.username || 'Anonymous',
            avatar: data.avatar || null,
          });
        }
      }

      setFollowers(newFollowers);
    };

    fetchFollowers();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Image
        source={item.avatar ? { uri: item.avatar } : require('../../img/icon_new_follow.png')}
        style={styles.avatar}
      />
      <Text style={styles.username}>{item.username} Just followed</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}> New Follower</Text>
      <FlatList
        data={followers}
        keyExtractor={(item) => item.uid}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>There is no new Follower yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: 50 },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    backgroundColor: '#ccc',
  },
  username: {
    fontSize: 16,
    color: '#333',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});
