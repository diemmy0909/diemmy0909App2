import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GET_USER_CART, getProductImageUrl, callApi } from "../../../APIService"; 

// --- TYPES ---
export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  image: any;
  quantity: number;
  size?: string;
  description?: string;
  restaurantId?: string | number;
}

interface CartState {
  items: CartItem[];
  cartId: number | null; 
}

type CartAction =
  | { type: "ADD_TO_CART"; payload: CartItem }
  | { type: "SET_CART_FROM_SERVER"; payload: { items: CartItem[], cartId: number | null } }
  | { type: "REMOVE_FROM_CART"; payload: string | number }
  | { type: "UPDATE_QUANTITY"; payload: { id: string | number; quantity: number } }
  | { type: "CLEAR_CART" };

interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  cartItems: CartItem[];
  addToCart: (product: any, quantity?: number) => Promise<void>; 
  removeFromCart: (id: string | number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  fetchCart: (email: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

// --- REDUCER ---
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART_FROM_SERVER":
      return { 
          ...state, 
          items: action.payload.items,
          cartId: action.payload.cartId 
      };

    case "ADD_TO_CART": {
      const item = action.payload;
      const exist = state.items.find((i) => String(i.id) === String(item.id));
      if (exist) {
        return {
          ...state,
          items: state.items.map((i) =>
            String(i.id) === String(item.id)
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, item] };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        items: state.items.filter((i) => String(i.id) !== String(action.payload)),
      };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items.map((i) =>
          String(i.id) === String(action.payload.id)
            ? { ...i, quantity: Math.max(1, action.payload.quantity) }
            : i
        ),
      };

    case "CLEAR_CART":
      return { ...state, items: [] };

    default:
      return state;
  }
}

// --- PROVIDER ---
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], cartId: null });

  // 1. Hàm Add To Cart (Tự động gọi API nếu đã có CartID)
  const addToCart = async (product: any, quantity: number = 1) => {
    const productId = product.productId || product.id;
    if (!productId) return;

    // A. Cập nhật Local State ngay lập tức (cho mượt)
    const finalImage = (typeof product.image === 'string' && !product.image.startsWith('http') && !product.image.startsWith('data:')) 
       ? getProductImageUrl(product.image) 
       : product.image;

    const item: CartItem = {
      id: productId,
      name: product.productName || product.name || "Sản phẩm",
      price: product.specialPrice || product.price || 0,
      image: finalImage,
      quantity: quantity,
      size: "M",
    };
    dispatch({ type: "ADD_TO_CART", payload: item });

    // B. Gọi API lưu xuống Server (Quan trọng)
    if (state.cartId) {
        try {
            console.log(`📡 Đang lưu Server: Cart ${state.cartId}, Product ${productId}, Qty ${quantity}`);
            // Gọi API POST để thêm sản phẩm
            await callApi(`public/carts/${state.cartId}/products/${productId}/quantity/${quantity}`, "POST");
        } catch (error) {
            console.error("❌ Lỗi lưu giỏ hàng Server:", error);
        }
    } else {
        console.warn("⚠️ Chưa có CartID, chỉ lưu tạm trên máy.");
    }
  };

  // Các hàm này chỉ update State (API gọi ở Component Cart.tsx)
  const removeFromCart = (id: string | number) => dispatch({ type: "REMOVE_FROM_CART", payload: id });
  const updateQuantity = (id: string | number, quantity: number) => dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  
  const clearCart = () => dispatch({ type: "CLEAR_CART" });
  
  const getTotal = () => state.items.reduce((total, item) => total + item.price * item.quantity, 0);

  // Hàm tải giỏ hàng từ Server
  const fetchCart = async (email: string) => {
    try {
      const response = await GET_USER_CART(email);
      let targetCart = response.data;
      
      // Xử lý nếu trả về mảng (lấy giỏ hàng đầu tiên)
      if (Array.isArray(response.data)) {
          targetCart = response.data.length > 0 ? response.data[0] : null;
      }

      if (!targetCart) {
          dispatch({ type: "SET_CART_FROM_SERVER", payload: { items: [], cartId: null } });
          return;
      }
      
      const serverItems = targetCart.cartItems || targetCart.products || [];
      const mappedItems: CartItem[] = serverItems.map((item: any) => {
        const productObj = item.product || item;
        return {
            id: productObj.productId || productObj.id,
            name: productObj.productName || productObj.name,
            price: productObj.specialPrice || productObj.price,
            image: getProductImageUrl(productObj.image),
            quantity: item.quantity,
            size: "M",
        };
      });

      // Lưu cả items và cartId vào state
      dispatch({ 
          type: "SET_CART_FROM_SERVER", 
          payload: { 
              items: mappedItems, 
              cartId: targetCart.cartId 
          } 
      });

    } catch (error) {
      console.error("Lỗi fetchCart:", error);
    }
  };

  // Tự động tải giỏ hàng khi mở app
  useEffect(() => {
    const init = async () => {
        const email = await AsyncStorage.getItem("saved-email");
        if(email) fetchCart(email);
    };
    init();
  }, []);

  return (
    <CartContext.Provider 
      value={{ 
        state, 
        dispatch, 
        cartItems: state.items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        getTotal, 
        fetchCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};