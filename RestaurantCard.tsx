// // components/home/RestaurantCard.tsx
// import React from "react";
// import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
// import { Feather } from "@expo/vector-icons";
// import { useRouter } from "expo-router";

// export default function RestaurantCard({ item }) {
//   const router = useRouter();
//   return (
//     <TouchableOpacity style={styles.card} onPress={() => router.push({ pathname: "/restaurant/[id]", params: { id: item.id } })}>
//       <Image source={item.image} style={styles.image} />
//       <View style={{ padding: 12 }}>
//         <Text style={styles.title}>{item.name}</Text>
//         <Text style={styles.desc}>{item.desc}</Text>
//         <View style={styles.row}>
//           <View style={styles.row}>
//             <Feather name="star" size={14} color="#FFB800" />
//             <Text style={styles.meta}>{item.rating}</Text>
//           </View>
//           <Text style={styles.meta}>Free</Text>
//           <Text style={styles.meta}>{item.time}</Text>
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   card: { backgroundColor: "#fff", borderRadius: 14, overflow: "hidden", marginTop: 12 },
//   image: { width: "100%", height: 160 },
//   title: { fontSize: 16, fontWeight: "700" },
//   desc: { color: "#7d8a9a", marginTop: 6 },
//   row: { flexDirection: "row", gap: 12, marginTop: 8, alignItems: "center" },
//   meta: { marginLeft: 6, color: "#444" },
// });
