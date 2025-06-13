import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity,
  StyleSheet, FlatList, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  getFirestore, doc, getDoc, collection, addDoc, onSnapshot,
  query, where, orderBy
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../../config/firebaseConfig';

import icon_Arrow from '../../../img/icon_arrow.png';
import icon_Share from '../../../img/icon_share.png';
import PlaceholderAvatar from '../../placeholder_images/Profiel1.jpg';

export default function PostDetailScreen({ route }: any) {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const { post } = route.params;
  const db = getFirestore(app);
  const auth = getAuth();

  const [userAvatar, setUserAvatar] = useState<any>(null);
  const [userName, setUserName] = useState<string>(post.user || '');
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // ✅ 大图预览相关
  const [modalVisible, setModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (post?.uid) {
      const fetchUserInfo = async () => {
        const userRef = doc(db, 'users', post.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUserAvatar(userData.avatar);
          setUserName(userData.username);
        }
      };
      fetchUserInfo();
    }

    const unsubscribe = onSnapshot(
      query(collection(db, 'postComments'), where('postId', '==', post.id), orderBy('timestamp', 'asc')),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComments(data);
      }
    );
    return () => unsubscribe();
  }, [post]);

  const handleAddComment = async () => {
    if (!auth.currentUser || !comment.trim()) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    await addDoc(collection(db, 'postComments'), {
      postId: post.id,
      uid: auth.currentUser.uid,
      username: userData.username || 'Anonymous',
      avatar: userData.avatar || '',
      comment: comment.trim(),
      imageUrl: '',
      parentId: replyTo || null,
      timestamp: new Date(),
    });
    setComment('');
    setReplyTo(null);
  };

  const renderReplies = (parentId: string) => {
    return comments
      .filter(c => c.parentId === parentId)
      .map((reply) => (
        <View key={reply.id} style={styles.replyItem}>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { uid: reply.uid })}>
            <Image source={reply.avatar ? { uri: reply.avatar } : PlaceholderAvatar} style={styles.replyAvatar} />
          </TouchableOpacity>
          <View style={styles.commentContent}>
            <Text style={styles.commentUser}>{reply.username}</Text>
            <Text style={styles.commentText}>{reply.comment}</Text>
          </View>
        </View>
      ));
  };

  const renderItem = ({ item }: any) => {
    if (item.parentId) return null;

    return (
      <View style={styles.commentItem}>
        <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { uid: item.uid })}>
          <Image source={item.avatar ? { uri: item.avatar } : PlaceholderAvatar} style={styles.commentAvatar} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View style={styles.commentContent}>
            <Text style={styles.commentUser}>{item.username}</Text>
            <Text style={styles.commentText}>{item.comment}</Text>
          </View>

          {renderReplies(item.id)}

          <TouchableOpacity onPress={() => setReplyTo(item.id)}>
            <Text style={styles.replyBtn}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTittle = () => (
    <View style={styles.tittleLayout}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.pop()}>
        <Image style={styles.backImg} source={icon_Arrow} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { uid: post.uid })} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image source={userAvatar ? { uri: userAvatar } : PlaceholderAvatar} style={styles.AvactarImg} />
        <Text style={styles.UserNametxt}>{userName}</Text>
      </TouchableOpacity>
      <Text style={styles.followTxt}>Follow</Text>
      <Image style={styles.Share} source={icon_Share} />
    </View>
  );

  return (
    <View style={styles.root}>
      {/* ✅ 大图预览 Modal */}
      {previewImage && (
        <Modal
          visible={modalVisible}
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalBackground} onPress={() => setModalVisible(false)}>
            <Image
              source={{ uri: previewImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>
      )}

      {renderTittle()}

      <FlatList
        ListHeaderComponent={
          <>
            <TouchableOpacity onPress={() => {
              setPreviewImage(post.image.uri || post.image);
              setModalVisible(true);
            }}>
              <Image
                source={post.image}
                style={{
                  width: '100%',
                  aspectRatio: 1,
                  resizeMode: 'cover',
                  borderRadius: 10,
                  marginBottom: 10,
                }}
              />
            </TouchableOpacity>
            <Text style={styles.Articletitle}>{post.title}</Text>
            <Text style={styles.contentText}>{post.content}</Text>
            <Text style={styles.commentTitle}>Comments</Text>
          </>
        }
        data={comments}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={{ padding: 20 }}>No comments yet</Text>}
        contentContainerStyle={{ padding: 16 }}
      />

      {replyTo && (
        <Text style={{ paddingHorizontal: 20, paddingBottom: 4, color: '#999' }}>replying...</Text>
      )}

      <View style={styles.commentInputContainer}>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Write a comment..."
          style={styles.commentInput}
        />
        <TouchableOpacity onPress={handleAddComment} style={styles.commentButton}>
          <Text style={{ color: 'white' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  tittleLayout: { height: 56, flexDirection: 'row', alignItems: 'center', marginTop: 60 },
  backButton: { paddingHorizontal: 16, justifyContent: 'center' },
  backImg: { width: 20, height: 20 },
  AvactarImg: { width: 36, height: 36, borderRadius: 18, marginLeft: 10 },
  UserNametxt: { fontSize: 15, color: '#333', marginLeft: 8 },
  followTxt: {
    paddingHorizontal: 16, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: '#383536', textAlign: 'center',
    fontSize: 12, color: 'black', lineHeight: 32, marginLeft: 'auto',
  },
  Share: { width: 30, height: 30, marginHorizontal: 10 },
  Articletitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  contentText: { fontSize: 16, color: '#555', marginVertical: 10 },
  commentTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  commentItem: { flexDirection: 'row', marginBottom: 14 },
  commentAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  commentContent: { flex: 1 },
  commentUser: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  commentText: { fontSize: 14, color: '#444', marginVertical: 2 },
  replyBtn: { color: '#007AFF', fontSize: 13, marginTop: 4 },
  replyItem: { flexDirection: 'row', marginTop: 10, paddingLeft: 50 },
  replyAvatar: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  commentInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  commentInput: {
    flex: 1, borderWidth: 1, borderColor: '#ccc',
    borderRadius: 20, paddingHorizontal: 12, height: 40,
  },
  commentButton: {
    backgroundColor: '#333', paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 20, marginLeft: 10,
  },
  // 🔥 大图预览样式
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});
