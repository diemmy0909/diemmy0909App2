import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type AuthContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (token: string, email: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Kiểm tra đăng nhập ngay khi mở App
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // [QUAN TRỌNG] Phải dùng đúng key "jwt-token" giống APIService
      const token = await AsyncStorage.getItem("jwt-token");
      if (token) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.log("Lỗi kiểm tra token:", e);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false); 
    }
  };

  const login = async (token: string, email: string) => {
    try {
      // [QUAN TRỌNG] Lưu đúng key "jwt-token"
      await AsyncStorage.setItem("jwt-token", token);
      await AsyncStorage.setItem("saved-email", email); 
      
      setIsLoggedIn(true);
      // [FIX] Cập nhật loading false để _layout redirect ngay
      setIsLoading(false); 
    } catch (e) {
      console.log("Lỗi khi login:", e);
    }
  };

  const logout = async () => {
    try {
      // [QUAN TRỌNG] Xóa đúng key để đăng xuất sạch sẽ
      await AsyncStorage.removeItem("jwt-token");
      await AsyncStorage.removeItem("saved-email");
      await AsyncStorage.removeItem("saved-password"); // Xóa cả pass nếu có lưu
      
      setIsLoggedIn(false); // Cập nhật state -> _layout.tsx sẽ tự chuyển trang
    } catch (e) {
      console.log("Lỗi khi logout:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);