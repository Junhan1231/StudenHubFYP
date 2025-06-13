import React, { useEffect, useState } from "react";
import {
  Image, TouchableOpacity, StyleSheet, Text, View
} from 'react-native';
import { getFirestore, collection, addDoc, deleteDoc, doc, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import icon_heart from '../../img/icon_heart.png';
import icon_heart_empty from '../../img/icon_heart_empty.png';

interface HeartProps {
  postId: string;
  postOwnerId: string;
}

export default function Heart({ postId, postOwnerId }: HeartProps) {
  const db = getFirestore();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // 实时监听当前 post 的点赞数
    const q = query(collection(db, 'likes'), where('postId', '==', postId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allLikes = snapshot.docs.map(doc => doc.data());
      setLikeCount(allLikes.length);
      setLiked(allLikes.some(like => like.userId === currentUser.uid));
    });

    return () => unsubscribe();
  }, [postId]);

  const toggleLike = async () => {
    if (!currentUser) return;

    const likeRef = collection(db, 'likes');
    const q = query(likeRef, where('postId', '==', postId), where('userId', '==', currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (!liked) {
      // 添加点赞
      await addDoc(likeRef, {
        postId,
        userId: currentUser.uid,
        timestamp: new Date()
      });

      // 添加通知
      if (currentUser.uid !== postOwnerId) {
        await addDoc(collection(db, 'notifications'), {
          type: 'like',
          senderId: currentUser.uid,
          receiverId: postOwnerId,
          postId,
          timestamp: new Date(),
        });
      }
    } else {
      // 取消点赞
      querySnapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'likes', docSnap.id));
      });
    }
  };

  return (
    <TouchableOpacity onPress={toggleLike} style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image source={liked ? icon_heart : icon_heart_empty} style={styles.container} />
      <Text style={styles.likeText}>{likeCount}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
    marginBottom: -2,
  },
  likeText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});
