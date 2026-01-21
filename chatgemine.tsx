import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, Image, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Animated, Dimensions, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatWithGemini, getProductImageUrl, POST_PLACE_ORDER } from '../../APIService';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../components/cart/CartContext';

const { width, height } = Dimensions.get('window');

// --- MÀU SẮC THEME KEM XOÀI (MANGO CREAM) ---
const COLORS = {
  primary: '#FF4D8D',          // Hồng chủ đạo
  primaryLight: '#FFA6C9',     // Hồng nhạt
  bg: '#FFF0F6',               // Nền hồng pastel
  white: '#FFFFFF',
  text: '#3A0D22',             // Nâu tím đậm
  subText: '#8F3A5B',
  bubbleUser: ['#FF4D8D', '#FFA6C9'], // Gradient hồng
  bubbleAI: '#FFFFFF',
  border: '#FFE4EC',
  success: '#00C853'
};


// --- COMPONENT TIN NHẮN VỚI HIỆU ỨNG TRƯỢT ---
const AnimatedMessage = ({ children, isUser }: { children: React.ReactNode, isUser: boolean }) => {
  const slideAnim = useRef(new Animated.Value(isUser ? 30 : -30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: opacityAnim,
      transform: [{ translateX: slideAnim }],
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      width: '100%'
    }}>
      {children}
    </Animated.View>
  );
};

// --- COMPONENT SKELETON AI (Style Cam) ---
const AISkeleton = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.msgRow}>
      <View style={styles.avatar}>
        <Ionicons name="sparkles" size={22} color="#FFF" />
      </View>
      <View style={[styles.bubble, styles.aiBubble, { padding: 15 }]}>
        <Animated.View style={{ opacity: pulseAnim, flexDirection: 'row' }}>
          <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
          <View style={[styles.dot, { marginHorizontal: 4, backgroundColor: COLORS.primary }]} />
          <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
        </Animated.View>
      </View>
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const { state, cartItems, addToCart, getTotal, clearCart } = useCart();

  const [messages, setMessages] = useState<any[]>([
    {
      id: '1',
      text: 'Chào bạn! 🍊🍦\nMình là Trợ lý Kem Xoài. Hôm nay trời nóng, làm ly kem mát lạnh không nhỉ?',
      sender: 'ai',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const flyAnim = useRef(new Animated.Value(0)).current;
  const [isFlying, setIsFlying] = useState(false);
  const [flyingImage, setFlyingImage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });
    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const handleAddToCart = async (product: any) => {
    const imgUri = getProductImageUrl(product.image);
    setFlyingImage(imgUri);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setIsFlying(true);
    flyAnim.setValue(0);
    Animated.timing(flyAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(() => {
      setIsFlying(false);
      setFlyingImage(null);
    });

    await addToCart(product, 1);
  };

  const handleQuickCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống.");
      return;
    }
    setLoading(true);
    try {
      const email = await AsyncStorage.getItem("saved-email");
      if (email && state.cartId) {
        const res = await POST_PLACE_ORDER(email, state.cartId, "CASH");
        if (res.status === 201 || res.status === 200) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: `🎉 Đặt thành công! Mã đơn: #${res.data.orderId}. Chuẩn bị giao ngay! 🛵`,
            sender: 'ai'
          }]);
          clearCart();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có chút trục trặc, bạn thử lại sau nhé.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user', image: selectedImage };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSelectedImage(null);
    setLoading(true);

    try {
      const aiReplyText = await chatWithGemini(userMsg.text, userMsg.image);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiReplyText || "Hic, mình chưa nghe rõ lắm...", sender: 'ai' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', text: "Mạng hơi lag, mình chưa trả lời được.", sender: 'ai' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUser = item.sender === 'user';
    const isCheckout = item.text?.includes("[CHECKOUT_CARD]");
    const cardRegex = /\[PRODUCT_CARD:\s*({[\s\S]*?})\]/g;

    const matches: RegExpMatchArray[] = Array.from(item.text?.matchAll(cardRegex) || []);
    const cleanText = (item.text || "").replace(cardRegex, "").replace("[CHECKOUT_CARD]", "").trim();

    const productList = matches.map((m: RegExpMatchArray) => {
      try { return JSON.parse(m[1]); } catch { return null; }
    }).filter(p => p !== null);

    return (
      <AnimatedMessage isUser={isUser}>
        <View style={[styles.msgRow, isUser ? styles.right : styles.left]}>
          {!isUser && (
            <View style={styles.avatar}>
              <Ionicons name="chatbubbles" size={20} color="#FFF" />
            </View>
          )}

          <View style={{ maxWidth: '85%' }}>
            {/* TEXT BUBBLE */}
            {(cleanText || item.image) && (
              <LinearGradient
                colors={isUser ? (COLORS.bubbleUser as any) : [COLORS.white, COLORS.white]}
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.aiBubble
                ]}
              >
                {item.image && <Image source={{ uri: item.image }} style={styles.msgImage} resizeMode="cover" />}
                {cleanText ? (<Text style={[styles.msgText, isUser ? styles.userText : styles.aiText]}>{cleanText}</Text>) : null}
              </LinearGradient>
            )}

            {/* CHECKOUT CARD - Style Cam */}
            {isCheckout && (
              <View style={styles.checkoutBox}>
                <View style={[styles.checkoutHeader]}>
                  <MaterialCommunityIcons name="receipt" size={22} color={COLORS.primary} />
                  <Text style={styles.checkoutTitle}>Hóa đơn tạm tính</Text>
                </View>
                <View style={styles.divider} />
                <Text style={styles.checkoutPrice}>{getTotal().toLocaleString()}đ</Text>

                <TouchableOpacity onPress={handleQuickCheckout} disabled={loading} style={{ marginTop: 12 }}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.orangeButton}>
                    {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.orangeBtnText}>CHỐT ĐƠN NGAY 🧡</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* PRODUCT CAROUSEL */}
            {productList.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productCarousel} contentContainerStyle={styles.carouselContent}>
                {productList.map((p: any, idx: number) => (
                  <View key={`${item.id}-${idx}`} style={styles.horizontalCard}>
                    <ProductCard
                      onAddPress={() => handleAddToCart(p)}
                      item={{
                        id: p.id, name: p.name, price: p.price,
                        image: getProductImageUrl(p.image),
                        description: p.description || ""
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </AnimatedMessage>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER CAM */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(home)/home' as any);
          }
        }} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>MIXTA iCream</Text>
          <Text style={styles.headerSub}>Tôi có thể giúp gì cho bạn?</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/components/cart/cart')} style={styles.headerBtn}>
          <Ionicons name="bag-handle" size={24} color="#FFF" />
          {cartItems.length > 0 && (
            <View style={styles.badge}><Text style={styles.badgeText}>{cartItems.length}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ListFooterComponent={loading ? <AISkeleton /> : null}
        showsVerticalScrollIndicator={false}
      />

      {/* FLYING ANIMATION */}
      {isFlying && flyingImage && (
        <Animated.View style={[styles.flyingIcon, {
          transform: [
            { translateY: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 0.85] }) },
            { translateX: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.4] }) },
            { scale: flyAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.2] }) },
            { rotate: flyAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }
          ],
          opacity: flyAnim.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] })
        }]}>
          <Image source={{ uri: flyingImage }} style={styles.flyingImg} />
        </Animated.View>
      )}

      {/* INPUT BAR */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {selectedImage && (
          <View style={styles.preview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImg}>
              <Ionicons name="close-circle" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Bạn muốn ăn gì nào?..."
              placeholderTextColor="#C4B5B0"
            />

            <TouchableOpacity onPress={handleSend} disabled={loading} style={styles.sendBtn}>
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Ionicons name="heart" size={20} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================== STYLE MANGO CREAM ==================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 45, // status bar
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerBtn: {
    width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, justifyContent: 'center', alignItems: 'center'
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.white, letterSpacing: 1 },
  headerSub: {
    fontSize: 11,
    color: '#FFD1E3', // hồng pastel
    fontWeight: '600',
    marginTop: -2
  },
  badge: {
    position: 'absolute', top: -2, right: -2, backgroundColor: COLORS.white,
    width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center'
  },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: COLORS.primary },

  /* MESSAGE LIST */
  msgRow: { flexDirection: 'row', marginBottom: 18, alignItems: 'flex-end' },
  left: { justifyContent: 'flex-start' },
  right: { justifyContent: 'flex-end' },

  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: COLORS.primary, marginRight: 8,
    alignItems: 'center', justifyContent: 'center', elevation: 2
  },

  bubble: { padding: 14, borderRadius: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },

  userBubble: { borderBottomRightRadius: 2 },
  aiBubble: { borderBottomLeftRadius: 2, borderWidth: 1, borderColor: COLORS.border },

  msgText: { fontSize: 15, lineHeight: 22 },
  userText: { color: COLORS.white, fontWeight: '500' },
  aiText: { color: COLORS.text, fontWeight: '400' },
  msgImage: { width: 200, height: 200, borderRadius: 12, marginBottom: 8 },

  /* INPUT */
  inputContainer: {
    padding: 15, backgroundColor: 'transparent',
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 30, padding: 6,
    elevation: 5, shadowColor: COLORS.primary, shadowOpacity: 0.15, shadowRadius: 10
  },
  iconBtn: { padding: 10 },
  input: { flex: 1, height: 44, fontSize: 15, color: COLORS.text, paddingHorizontal: 10 },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center'
  },
  preview: { marginLeft: 20, marginBottom: 10, flexDirection: 'row' },
  previewImage: { width: 60, height: 60, borderRadius: 10 },
  removeImg: { position: 'absolute', top: -10, right: -10, backgroundColor: COLORS.white, borderRadius: 12 },

  /* EXTRAS */
  productCarousel: { marginTop: 12 },
  carouselContent: { paddingRight: 0 },
  horizontalCard: { width: 210, marginRight: 12 },

  checkoutBox: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginTop: 10, borderWidth: 1, borderColor: COLORS.primaryLight },
  checkoutHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  checkoutTitle: { fontSize: 16, fontWeight: '800', color: COLORS.primary, marginLeft: 8 },
  divider: {
    height: 1,
    backgroundColor: COLORS.border, // #FFE4EC
    marginVertical: 8
  },
  checkoutPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text, // #3A0D22
    textAlign: 'center'
  },

  orangeButton: { borderRadius: 15, paddingVertical: 12, alignItems: 'center', marginTop: 5 },
  orangeBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },

  flyingIcon: { position: 'absolute', bottom: 200, alignSelf: 'center', zIndex: 9999 },
  flyingImg: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: COLORS.primary },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
