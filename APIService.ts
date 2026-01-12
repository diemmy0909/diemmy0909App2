import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosResponse, Method } from "axios";

/* ================= CONFIG ================= */
const API_URL = "http://192.168.100.115:8080/api";

/* ================= TOKEN ================= */
async function getToken() {
  return await AsyncStorage.getItem("jwt-token");
}

/* ================= CORE API ================= */
export async function callApi(
  endpoint: string,
  method: Method,
  data: any = null
): Promise<AxiosResponse<any>> {
  const token = await getToken();

  return axios({
    method,
    url: `${API_URL}/${endpoint}`,
    data,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}

/* ================= COMMON ================= */
export const GET_ALL = (
  endpoint: string,
  pageNumber = 1,
  pageSize = 100
) => {
  const hasQuery = endpoint.includes("?");
  const url = hasQuery
    ? `${endpoint}&pageNumber=${pageNumber}&pageSize=${pageSize}`
    : `${endpoint}?pageNumber=${pageNumber}&pageSize=${pageSize}`;

  return callApi(url, "GET");
};


export const GET_ID = (
  endpoint: string,
  id: string | number
) => callApi(`${endpoint}/${id}`, "GET");

/* ================= USER ================= */
export const GET_USER_BY_EMAIL = (email: string) =>
  callApi(`public/users/email/${email}`, "GET");

/* ================= LOGIN ================= */
export async function POST_LOGIN(
  email: string,
  password: string
) {
  try {
    // 1️⃣ Login → lấy token
    const res = await axios.post(`${API_URL}/login`, {
      email,
      password,
    });

    const token = res.data["jwt-token"];
    if (!token) return null;

    // 2️⃣ Lưu token
    await AsyncStorage.setItem("jwt-token", token);

    // 3️⃣ Lấy user
    const userRes = await GET_USER_BY_EMAIL(email);
    const user = userRes.data;
    if (!user) return null;

    // 4️⃣ (optional) ghi nhớ tài khoản
    await AsyncStorage.setItem("saved-email", email);
    await AsyncStorage.setItem("saved-password", password);

    return user;
  } catch (err) {
    console.error("POST_LOGIN error:", err);
    return null;
  }
}

/* ================= CART ================= */
export const getUserCart = (email: string) =>
  callApi(`public/users/${email}/carts`, "GET");

/* ================= CART ================= */
// ✅ Thêm sản phẩm mới vào cart (CHỈ DÙNG KHI CHƯA TỒN TẠI)
export const addToCart = (
  cartId: number,
  productId: number,
  quantity: number
) =>
  callApi(
    `public/carts/${cartId}/products/${productId}/quantity/${quantity}`,
    "POST"
  );

// ✅ [MỚI] Cập nhật số lượng sản phẩm trong cart
export function PUT_UPDATE_QUANTITY(
  cartId: string | number,
  productId: string | number,
  quantity: number
): Promise<AxiosResponse<any>> {
  return callApi(
    `public/carts/${cartId}/products/${productId}/quantity/${quantity}`,
    "PUT"
  );
}



// ✅ Update quantity
export const updateCartQuantity = (
  cartId: number,
  productId: number,
  quantity: number
) =>
  callApi(
    `public/carts/${cartId}/products/${productId}/quantity/${quantity}`,
    "PUT"
  );

// ✅ Delete product khỏi cart
export const deleteCartProduct = (
  cartId: number,
  productId: number
) =>
  callApi(
    `public/carts/${cartId}/product/${productId}`,
    "DELETE"
  );



