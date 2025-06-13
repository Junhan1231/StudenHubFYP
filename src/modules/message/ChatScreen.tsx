import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigation, useRoute } from '@react-navigation/native';
import { app } from '../../config/firebaseConfig';

export default function ChatScreen() {
  const route = useRoute<any>();
  const { recipientUid } = route.params;

  const auth = getAuth();
  const db = getFirestore(app);
  const currentUser = auth.currentUser;
  const navigation = useNavigation<any>();

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [recipientData, setRecipientData] = useState<any>(null);

  // 状态
  const [isMutualFollow, setIsMutualFollow] = useState(false);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [hasReceivedReply, setHasReceivedReply] = useState(false);

  useEffect(() => {
    const fetchRecipientInfo = async () => {
      const userDoc = await getDoc(doc(db, 'users', recipientUid));
      if (userDoc.exists()) {
        setRecipientData(userDoc.data());
      }
    };
    fetchRecipientInfo();
  }, [recipientUid]);

  // 加载所有消息
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [currentUser.uid, recipientUid]),
      where('receiverId', 'in', [currentUser.uid, recipientUid]),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: any[] = [];
      snapshot.forEach(doc => fetched.push(doc.data()));
      setMessages(fetched);
    });

    return () => unsubscribe();
  }, [recipientUid]);

  // 检查是否互相关注
  useEffect(() => {
    const checkMutualFollow = async () => {
      if (!currentUser) return;

      const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const targetUserDoc = await getDoc(doc(db, 'users', recipientUid));

      if (currentUserDoc.exists() && targetUserDoc.exists()) {
        const currentFollowing = currentUserDoc.data().following || [];
        const targetFollowing = targetUserDoc.data().following || [];

        if (currentFollowing.includes(recipientUid) && targetFollowing.includes(currentUser.uid)) {
          setIsMutualFollow(true);
        }
      }
    };
    checkMutualFollow();
  }, [recipientUid]);

  // 检查有没有发过第一条消息（很重要！避免退出重进后丢失状态）
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', currentUser.uid),
      where('receiverId', '==', recipientUid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setHasSentFirstMessage(true);
      } else {
        setHasSentFirstMessage(false);
      }
    });

    return () => unsubscribe();
  }, [recipientUid]);

  // 检查对方有没有回复你
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'messages'),
      where('senderId', '==', recipientUid),
      where('receiverId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setHasReceivedReply(true);
      }
    });

    return () => unsubscribe();
  }, [recipientUid]);

  // 发送消息
  const sendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    if (!isMutualFollow && hasSentFirstMessage && !hasReceivedReply) {
      Alert.alert('Notice', 'You can only send one message until they reply or you follow each other.');
      return;
    }

    try {
      await addDoc(collection(db, 'messages'), {
        senderId: currentUser.uid,
        receiverId: recipientUid,
        content: message.trim(),
        timestamp: serverTimestamp(),
      });

      setMessage('');

      if (!isMutualFollow && !hasSentFirstMessage) {
        setHasSentFirstMessage(true);
      }
    } catch (error) {
      console.error('Send message failed:', error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <Text
      style={[
        styles.message,
        item.senderId === currentUser?.uid ? styles.myMessage : styles.theirMessage,
      ]}
    >
      {item.content}
    </Text>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>{'<'}</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          {recipientData?.avatar && (
            <Image source={{ uri: recipientData.avatar }} style={styles.avatar} />
          )}
          <Text style={styles.username}>{recipientData?.username || 'Chat'}</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        style={styles.messageList}
      />

      <View style={styles.inputRow}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          style={styles.input}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginTop: 60,
  },
  backBtn: {
    fontSize: 14,
    color: '#007AFF',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageList: { flex: 1, padding: 10 },
  message: {
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
    maxWidth: '80%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEE',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
  },
});
