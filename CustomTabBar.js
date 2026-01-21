import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

const icons = {
  index: "grid",
  home: "grid", // [THÊM] Icon cho route home
  menu: "menu",
  add: "plus",
  bell: "bell",
  profile: "user",
};
const PINK = {
  primary: "#FF4D8D",
  light: "#FFE4EC",
  lighter: "#FFF0F6",
  inactive: "#C7A1B2",
  bg: "#FFFFFF",
};

export default function CustomTabBar({ state, descriptors, navigation }) {
  // [MOD] Lọc bỏ route "index" vì chỉ dùng để redirect
  const visibleRoutes = state.routes.filter(r => r.name !== "index" && r.name !== "_sitemap");

  return (
    <View style={styles.tabBar}>
      {visibleRoutes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title !== undefined ? options.title : route.name; // Fallback label

        // [MOD] Check focus dựa trên route key vì visibleRoutes khác index với state.routes
        const isFocused = state.index === state.routes.indexOf(route);

        const iconName = icons[route.name] || "circle"; // Fallback icon
        const isAdd = route.name === "add";

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.8}
            style={isAdd ? styles.addBtnWrap : styles.tabItem}
          >
            {isAdd ? (
              <View style={[styles.addBtn, isFocused && styles.addBtnActive]}>
                <Feather name="plus" size={24} color={PINK.primary} />
              </View>
            ) : (
              <View style={{ alignItems: "center" }}>
                <Feather
                  name={iconName}
                  size={22}
                  color={isFocused ? PINK.primary : PINK.inactive}
                />
                <Text style={[styles.label, isFocused && styles.labelActive]}>
                  {label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: PINK.bg,
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    justifyContent: "space-around",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,

    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: 50,
  },

  label: {
    fontSize: 10,
    marginTop: 4,
    color: PINK.inactive,
    fontWeight: "500",
  },

  labelActive: {
    color: PINK.primary,
    fontWeight: "800",
  },

  /* ---------- ADD BUTTON ---------- */
  addBtnWrap: {
    position: "relative",
    top: -28,
    justifyContent: "center",
    alignItems: "center",
  },

  addBtn: {
    width: 58,
    height: 58,
    borderRadius: 30,
    backgroundColor: PINK.lighter,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: PINK.primary,

    shadowColor: PINK.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },

  addBtnActive: {
    backgroundColor: PINK.light,
  },
});
