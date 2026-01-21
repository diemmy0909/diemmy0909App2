import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  FlatList
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_NOTIFICATIONS, PUT_MARK_READ_NOTIFICATION } from "../../APIService";

export default function Notifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllocations = async () => {
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (!email) return;

      const response = await GET_NOTIFICATIONS(email);
      if (response && response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.log("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllocations();
  };

  const handleMarkRead = async (id: number) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await PUT_MARK_READ_NOTIFICATION(id);
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.row, !item.read && styles.unreadRow]}
      onPress={() => handleMarkRead(item.id)}
    >
      <View style={[styles.iconBox, { backgroundColor: item.title.includes("hủy") ? '#FFEBEE' : '#E3F2FD' }]}>
        <Ionicons
          name={item.title.includes("hủy") ? "close-circle" : "cube"}
          size={24}
          color={item.title.includes("hủy") ? "#F44336" : "#2196F3"}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>
          {item.title}
          {!item.read && <View style={styles.dot} />}
        </Text>
        <Text style={styles.text}>{item.message}</Text>
        <Text style={styles.time}>{new Date(item.createdAt).toLocaleString('vi-VN')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color="#3A0D22" />
        </TouchableOpacity>
        <Text style={styles.title}>Thông báo</Text>
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF4D8D" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40, color: "#888" }}>
              Bạn chưa có thông báo nào.
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF0F6",
    padding: 20,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
    marginTop: 20
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#3A0D22",
  },

  /* ITEM */
  row: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    marginTop: 14,
    alignItems: "center",
    shadowColor: "#FF4D8D",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  unreadRow: {
    backgroundColor: "#FFFFFF",
    borderLeftWidth: 4,
    borderLeftColor: "#FF4D8D"
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },

  name: {
    fontWeight: "700",
    color: "#3A0D22",
    fontSize: 15,
    marginBottom: 4
  },
  text: {
    color: "#6B2A44",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18
  },
  time: {
    color: "#A85A7E",
    fontSize: 11,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4D8D",
    marginLeft: 6,
    display: "flex"
  }
});
