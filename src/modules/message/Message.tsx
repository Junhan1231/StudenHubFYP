import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Icon_Like from '../../img/icon_star.png';
import Icon_Follow from '../../img/icon_new_follow.png';
import Icon_Comments from '../../img/icon_comments.png';

export default function MessagePage() {
  const auth = getAuth();
  const db = getFirestore();
  const navigation = useNavigation<any>();
  const currentUser = auth.currentUser;

  const [latestMessages, setLatestMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const conversations: { [uid: string]: any } = {};

      for (const docSnap of snapshot.docs) {
        const msg = docSnap.data();
        const { senderId, receiverId, content, timestamp } = msg;

        if (senderId !== currentUser.uid && receiverId !== currentUser.uid) continue;

        const otherUid = senderId === currentUser.uid ? receiverId : senderId;

        if (!conversations[otherUid]) {
          const userDoc = await getDoc(doc(db, 'users', otherUid));
          const userInfo = userDoc.exists() ? userDoc.data() : {};

          conversations[otherUid] = {
            id: docSnap.id,
            text: content,
            timestamp: timestamp?.toDate().toLocaleString(),
            otherUid,
            avatar: userInfo.avatar,
            username: userInfo.username || 'Anonymous',
          };
        }
      }

      setLatestMessages(Object.values(conversations));
    });

    return () => unsubscribe();
  }, []);

  const renderHeaderIcons = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.headerItem}
        onPress={() => navigation.navigate('LikeNotification')}
      >
        <Image source={Icon_Like} style={styles.itemImg} />
        <Text style={styles.ItemTxt}>Like</Text>
      </TouchableOpacity>
  
      <TouchableOpacity
        style={styles.headerItem}
        onPress={() => navigation.navigate('FollowNotification')}
      >
        <Image source={Icon_Follow} style={styles.itemImg} />
        <Text style={styles.ItemTxt}>Follower</Text>
      </TouchableOpacity>
  
      <View style={styles.headerItem}>
        <Image source={Icon_Comments} style={styles.itemImg} />
        <Text style={styles.ItemTxt}>Comments</Text>
      </View>
    </View>
  );
  

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.messageItem}
      onPress={() => navigation.navigate('Chat', { recipientUid: item.otherUid })}
    >
      <Image
        source={item.avatar ? { uri: item.avatar } : require('../../img/icon_heart.png')}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.username}>{item.username}</Text>
        <Text style={styles.messageText} numberOfLines={1}>{item.text}</Text>
      </View>
      <Text style={styles.timestamp}>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <View style={styles.tittleLayout}>
        <Text style={styles.tittleTxt}>Message</Text>
      </View>
      <FlatList
        data={latestMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 10 }}
        ListHeaderComponent={renderHeaderIcons}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>暂无消息</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  tittleLayout: {
    width: '100%', height: 48, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', marginTop: 50,
  },
  tittleTxt: { fontSize: 18, color: '#333' },
  headerContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    paddingVertical: 20,
  },
  headerItem: { flex: 1, alignItems: 'center' },
  itemImg: {
    width: 60, height: 60, resizeMode: 'contain',
  },
  ItemTxt: {
    fontSize: 15, color: '#333', marginTop: 8,
  },
  messageItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    marginRight: 12, backgroundColor: '#ccc',
  },
  username: {
    fontSize: 16, color: '#333', fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14, color: '#666', marginTop: 2,
  },
  timestamp: {
    fontSize: 12, color: '#999', marginLeft: 8,
  },
});
