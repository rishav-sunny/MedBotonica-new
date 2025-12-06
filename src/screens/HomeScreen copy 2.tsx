import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type HomeScreenNav = NativeStackNavigationProp<RootStackParamList, "Home">;

const BASE_URL = "http://10.51.168.93:8000";

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const navigation = useNavigation<HomeScreenNav>();

  useEffect(() => {
    const loadUserToken = async () => {
      const stored = await AsyncStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("Using token:", parsed.data?.token);
        setToken(parsed.data?.token);
      }
    };
    loadUserToken();
  }, []);

  const pickImage = async () => {
    launchImageLibrary(
      { mediaType: "photo", quality: 1 },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode)
          return Alert.alert("Error", response.errorMessage || "Pick failed");
        if (response.assets && response.assets.length > 0)
          setImageUri(response.assets[0].uri || null);
        setCaption(null);
      }
    );
  };

  const uploadImage = async () => {
    if (!imageUri) return Alert.alert("Error", "Please select an image.");
    if (!token)
      return Alert.alert("Error", "Session expired. Please log in again.");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", {
        uri: imageUri,
        name: "upload.jpg",
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${BASE_URL}/user/predictions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) setCaption(data.caption);
      else
        Alert.alert(
          "Prediction Failed",
          data.detail || data.message || "Try again later."
        );
      console.log("Prediction response:", data);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Something went wrong during upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>🧠 Image Captioning</Text>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.btnPrimary} onPress={pickImage}>
            <Text style={styles.btnText}>📷 Pick Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: "#e74c3c" }]}
            onPress={handleLogout}
          >
            <Text style={styles.btnText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, { backgroundColor: "#27ae60", marginTop: 20, width: "90%" }]}
          onPress={uploadImage}
          disabled={loading}
        >
          <Text style={styles.btnText}>
            {loading ? "⏳ Predicting..." : "✨ Predict Caption"}
          </Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#2ec770" style={{ marginTop: 20 }} />}

        {caption && (
          <View style={styles.captionBox}>
            <Text style={styles.captionText}>🗒️ {caption}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2ec770",
    marginBottom: 25,
  },
  image: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  placeholderBox: {
    width: 250,
    height: 250,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  placeholderText: {
    color: "#888",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "90%",
  },
  btnPrimary: {
    backgroundColor: "#2ec770",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "45%",
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  captionBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 15,
    marginTop: 25,
    width: "90%",
    alignItems: "center",
  },
  captionText: {
    fontSize: 17,
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
});