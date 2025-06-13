import React, { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  TextInput, FlatList
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  collection, doc, getDoc, setDoc, query,
  where, getDocs
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../config/firebaseConfig";
import { useFocusEffect } from '@react-navigation/native'; 
import { useCallback } from 'react';


import Icon_Menu from "../../img/icon_menu.png";
import UserPageBackground from "../../img/MePageUserBackground.png";
import UserPageQRcodeScan from "../../img/settings.png";
import UserPageicon_Share from "../../img/icon_share.png";
import UserAvatarPlaceholder from "../placeholder_images/Profiel1.jpg";

export default function MePage() {
  const navigation = useNavigation<any>();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState("Username");
  const [bio, setBio] = useState("Click here to introduce yourself.");
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [likes, setLikes] = useState(0);
  const [activeTab, setActiveTab] = useState("Post");
  const [myPosts, setMyPosts] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const uid = user.uid;
  
          const userRef = doc(db, "users", uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUsername(data.username || "Username");
            setAvatar(data.avatar || null);
            setBio(data.bio || "Click here to introduce yourself.");
            setFollowers(data.followers?.length || 0);
            setFollowing(data.following?.length || 0);
          }
  
          const q = query(collection(db, "posts"), where("uid", "==", uid));
          const querySnapshot = await getDocs(q);
          const posts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMyPosts(posts);
          setLikes(posts.length);
        }
      });
  
      return () => unsubscribe();
    }, [])
  );
  

  const saveProfile = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await setDoc(doc(db, "users", uid), {
      username,
      avatar,
      bio,
      email: auth.currentUser?.email,
    }, { merge: true });
    console.log("save success");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.root}>
      <Image style={styles.bgImg} source={UserPageBackground} />
      <View style={styles.header}>
        <TouchableOpacity>
          <Image source={Icon_Menu} style={styles.icon} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Image source={UserPageQRcodeScan} style={styles.setting_icon} />
        <Image source={UserPageicon_Share} style={styles.icon} />
      </View>

      <View style={styles.userInfoContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            style={styles.avatar}
            source={avatar ? { uri: avatar } : UserAvatarPlaceholder}
          />
        </TouchableOpacity>

        <View style={styles.userDetails}>
          <Text style={styles.username}>{username}</Text>
          <TextInput
            style={styles.bio}
            value={bio}
            onChangeText={setBio}
            placeholder="Fill in your personal profile"
          />
        </View>
      </View>

      <View style={styles.profileActions}>
        <View style={styles.statsContainer}>
          <TouchableOpacity style={styles.statsItem}>
            <Text style={styles.statsNumber}>{following}</Text>
            <Text style={styles.statsLabel}>Follow</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsItem}>
            <Text style={styles.statsNumber}>{followers}</Text>
            <Text style={styles.statsLabel}>Fan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statsItem}>
            <Text style={styles.statsNumber}>{likes}</Text>
            <Text style={styles.statsLabel}>Like</Text>
          </TouchableOpacity>
        </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}>
            <Text style={styles.editText}>Edit profile</Text>
          </TouchableOpacity>

      </View>

      <View style={styles.scrollContainer}>
        <View style={styles.tabsContainer}>
          {["Post", "Saved", "Liked"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text
                style={[styles.tabText, activeTab === tab && styles.activeTabText]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "Post" && (
          myPosts.length === 0 ? (
            <Text style={styles.placeholderText}>You haven't posted anything yet.</Text>
          ) : (
            <FlatList
              data={myPosts}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={styles.flatlistContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.postCardGrid}
                  onPress={() => navigation.navigate("PostDetail", { post: item })}
                >
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.userContainer}>
                    {item.avatar && <Image source={{ uri: item.avatar }} style={styles.userAvatar} />}
                    <Text style={styles.userName}>{item.username || "anonymous user"}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#1C1C1E" },
  bgImg: { position: "absolute", top: 0, width: "100%", height: 380 },
  header: {
    flexDirection: "row", alignItems: "center", paddingTop: 50, paddingHorizontal: 16,
  },
  icon: { width: 24, height: 24, marginHorizontal: 8, tintColor: "white" },
  setting_icon:{ width: 20, height: 20, marginHorizontal: 8, tintColor: "white" },
  userInfoContainer: {
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginTop: 50,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: "white"
  },
  userDetails: { marginLeft: 16, flex: 1 },
  username: { fontSize: 20, color: "white", fontWeight: "bold" },
  bio: {
    color: "#A1A1A1", fontSize: 14, marginTop: 4, borderBottomWidth: 1,
    borderBottomColor: "#555", paddingBottom: 2,
  },
  profileActions: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginHorizontal: 16, marginTop: 10,
  },
  statsContainer: { flexDirection: "row" },
  statsItem: { alignItems: "center", marginRight: 20 },
  statsNumber: { fontSize: 16, color: "white", fontWeight: "bold" },
  statsLabel: { fontSize: 14, color: "#A1A1A1" },
  editButton: {
    borderWidth: 1, borderColor: "white", borderRadius: 20,
    paddingVertical: 6, paddingHorizontal: 20,
  },
  editText: { color: "white" },
  scrollContainer: {
    flex: 1, backgroundColor: "white", borderTopLeftRadius: 20,
    borderTopRightRadius: 20, marginTop: 30,
  },
  tabsContainer: {
    flexDirection: "row", justifyContent: "space-around", paddingVertical: 12,
  },
  tab: { paddingVertical: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#1C1C1E" },
  tabText: { fontSize: 16, color: "#A1A1A1" },
  activeTabText: { color: "#1C1C1E", fontWeight: "bold" },
  flatlistContainer: {
    padding: 8,
  },
  postCardGrid: {
    width: '48%',
    margin: '1%',
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  itemTitle: {
    fontSize: 13,
    color: '#333',
    marginHorizontal: 8,
    marginTop: 4,
    fontWeight: 'bold',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 8,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  userName: {
    fontSize: 13,
    color: '#999',
    flex: 1,
  },
  placeholderText: {
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  }
});
