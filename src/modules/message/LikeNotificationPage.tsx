import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { app } from '../../config/firebaseConfig';

export default function LikeNotificationPage() {
  const auth = getAuth();
  const db = getFirestore(app);
  const currentUser = auth.currentUser;
  const [likers, setLikers] = useState<any[]>([]);

  useEffect(() => {
    const fetchLikers = async () => {
      if (!currentUser) return;

      const q = query(
        collection(db, 'notifications'),
        where('type', '==', 'like'),
        where('receiverId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const likerList: any[] = [];

      for (const docSnap of querySnapshot.docs) {
        const { senderId } = docSnap.data();
        const notificationId = docSnap.id;

        const userRef = doc(db, 'users', senderId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          likerList.push({
            notificationId,
            uid: senderId,
            username: data.username || 'Anonymous',
            avatar: data.avatar || null,
          });
        }
      }

      setLikers(likerList);
    };

    fetchLikers();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.item}>
      <Image
        source={item.avatar ? { uri: item.avatar } : require('../../img/icon_heart.png')}
        style={styles.avatar}
      />
      <Text style={styles.username}>{item.username} Like your article</Text>
    </View>
  );

  return (  
    <View style={styles.container}>
      <Text style={styles.header}>Like received</Text>
      <FlatList
        data={likers}
        keyExtractor={(item) => item.notificationId}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>There is No Likes for the moment</Text>}
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
