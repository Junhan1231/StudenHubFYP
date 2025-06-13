import 'react-native-get-random-values';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Modal, Image
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { getFirestore, collection, addDoc, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { app } from '../../config/firebaseConfig';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';




export default function MapScreen() {

  const navigation = useNavigation<StackNavigationProp<any>>();

  const db = getFirestore(app);
  const auth = getAuth();
  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [markerData, setMarkerData] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [comment, setComment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{ [key: string]: any }>({});


  const snapPoints = useMemo(() => ['25%', '60%'], []);
  

  const fetchUserProfile = async (uid: string) => {
    if (userProfiles[uid]) return;
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfiles((prev) => ({
        ...prev,
        [uid]: docSnap.data(),
      }));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Location permission ');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'mapComments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMarkerData(data);
      data.forEach((d: any) => fetchUserProfile(d.uid));

    });
    return () => unsubscribe();
  }, []);

  const handlePlaceSelect = (data: any, details: any = null) => {
    if (details?.geometry?.location) {
      const { lat, lng } = details.geometry.location;
      const address = details.formatted_address || data.description;
      setSelectedPlace({ name: address, lat, lng });

      mapRef.current?.animateToRegion({
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      bottomSheetRef.current?.expand();
    }
  };

  const submitComment = async () => {
    if (!auth.currentUser || !selectedPlace) return;
    const { lat, lng } = selectedPlace;

    await addDoc(collection(db, 'mapComments'), {
      uid: auth.currentUser.uid,
      username: auth.currentUser.email,
      comment,
      imageUrl: image || null,
      latitude: lat,
      longitude: lng,
      timestamp: new Date(),
    });

    setComment('');
    setImage(null);
    setModalVisible(false);
  };

  const getCommentsForPlace = () => {
    if (!selectedPlace) return [];
    return markerData.filter(m =>
      Math.abs(m.latitude - selectedPlace.lat) < 0.0005 &&
      Math.abs(m.longitude - selectedPlace.lng) < 0.0005
    );
  };

  return (
    <View style={styles.container}>
      {location && (
        <>
          <GooglePlacesAutocomplete
            placeholder="🔍 Please Search the  location"
            onPress={handlePlaceSelect}
            fetchDetails
            query={{ key: 'AIzaSyBOFX-s1U4ecCA0Locjh5Eia5bbnUigpm8', language: 'en' }}
            styles={{
              container: { position: 'absolute', top: 50, width: '90%', alignSelf: 'center', zIndex: 1 },
              textInput: { height: 40, borderRadius: 8, paddingHorizontal: 10, fontSize: 14 },
              listView: { backgroundColor: 'white' },
            }}
          />

          <MapView
            ref={mapRef}
            style={styles.map}
            showsUserLocation={true}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {selectedPlace && (
              <Marker
                coordinate={{
                  latitude: selectedPlace.lat,
                  longitude: selectedPlace.lng,
                }}
              />
            )}
          </MapView>

          {selectedPlace && (
            <BottomSheet
              ref={bottomSheetRef}
              index={0}
              snapPoints={snapPoints}
              enablePanDownToClose
              onClose={() => setSelectedPlace(null)}
            >
              <View style={styles.sheetContent}>
                <Text style={styles.cardTitle}>{selectedPlace.name}</Text>
                <BottomSheetFlatList
  data={getCommentsForPlace()}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { uid: item.uid })}>

        <Image
          source={{ uri: userProfiles[item.uid]?.avatar || 'https://default-avatar.png' }}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <Text style={styles.username}>{userProfiles[item.uid]?.username || item.username}</Text>
        <Text style={styles.comment}>{item.comment}</Text>
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.commentImage}
          />
        )}
      </View>
    </View>
  )}
/>

                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.button}>
                  <Text style={styles.buttonText}>Leave your comment</Text>
                </TouchableOpacity>
              </View>
            </BottomSheet>
          )}
        </>
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
              <Text style={styles.imageButtonText}>Select image</Text>
            </TouchableOpacity>
            {image && (
              <Image source={{ uri: image }} style={styles.previewImage} />
            )}
            <Text style={styles.modalTitle}>Add a comment</Text>
            <TextInput
              placeholder="Write down your experience or leave a message..."
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              multiline
            />
            <TouchableOpacity style={styles.button} onPress={submitComment}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  sheetContent: { padding: 16, flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  commentItem: { marginBottom: 16 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    marginRight: 8, backgroundColor: '#ccc'
  },
  username: { fontWeight: '600', fontSize: 14 },
  comment: { fontSize: 14, color: '#333', marginTop: 4 },
  commentImage: {
    width: '100%',
    height: 160,
    marginTop: 6,
    borderRadius: 8
  },
  button: {
    marginTop: 10, backgroundColor: '#333',
    padding: 10, borderRadius: 8, alignItems: 'center'
  },
  buttonText: { color: 'white', fontWeight: 'bold' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center'
  },
  modalContent: {
    width: '85%', backgroundColor: 'white',
    padding: 20, borderRadius: 12
  },
  modalTitle: {
    fontSize: 16, fontWeight: 'bold', marginBottom: 10
  },
  input: {
    height: 80, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 10, marginBottom: 10
  },
  closeButton: {
    position: 'absolute', top: 8, right: 8, zIndex: 10
  },
  closeText: {
    fontSize: 24, color: '#999'
  },
  imageButton: {
    backgroundColor: '#999', padding: 10,
    borderRadius: 8, alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: {
    color: 'white', fontWeight: 'bold',
  },
  previewImage: {
    width: '100%', height: 150,
    marginBottom: 10, borderRadius: 8,
  },

  commentContent: {
    flex: 1,
  },
  
});
