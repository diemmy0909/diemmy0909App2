"""
==================================================
GEMINI VISION CHAT SERVER - Image Search Support
==================================================
Chatbot thông minh với khả năng:
- Chat với AI
- Nhận diện sản phẩm từ hình ảnh
- Tìm kiếm sản phẩm tương tự trong menu
==================================================
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from google import genai
from PIL import Image
import requests
import io
import json

app = Flask(__name__)
CORS(app)

API_KEY = "AIzaSyCAUqfZKQGnnAQSspcMYA7m6llW4hISUSE"
MODEL_NAME = "gemini-2.5-flash"

JAVA_API_URL = "http://10.199.163.99:8080/api/public/products"
# 10.200.183.99
client = genai.Client(api_key=API_KEY)


def get_restaurant_data():
    """Lấy dữ liệu tối giản để AI không bị quá tải thông tin"""
    try:
        response = requests.get(f"{JAVA_API_URL}?pageNumber=0&pageSize=20", timeout=3)
        if response.status_code == 200:
            data = response.json()
            items = data.get('content', []) if isinstance(data, dict) else data
            
            minimal_menu = []
            for item in items:
                minimal_menu.append({
                    "id": item.get('productId'),
                    "n": item.get('productName'),
                    "p": item.get('specialPrice', item.get('price')),
                    "i": item.get('image')
                })
            return json.dumps(minimal_menu, ensure_ascii=False)
    except:
        return "[]"


def search_products_by_keyword(keyword):
    """
    Tìm kiếm sản phẩm theo keyword từ Spring Boot API.
    """
    try:
        search_url = f"{JAVA_API_URL}/search"
        params = {"keyword": keyword, "page": 0, "size": 5}
        response = requests.get(search_url, params=params, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('content', [])
        return []
    except Exception as e:
        print(f"Search error: {e}")
        return []


def identify_product_from_image(img):
    """
    Dùng Gemini Vision để nhận diện sản phẩm từ hình ảnh.
    Trả về tên sản phẩm (keyword).
    """
    try:
        identify_prompt = """Nhìn vào hình ảnh này và cho tôi biết đây là sản phẩm gì.
CHỈ TRẢ LỜI TÊN SẢN PHẨM BẰNG TIẾNG VIỆT, NGẮN GỌN (1-3 từ).
Ví dụ: "Trà sữa", "Cà phê", "Kem chocolate", "Sinh tố xoài", "Bánh mì", "Nước cam"
Nếu hình ảnh KHÔNG PHẢI là món ăn hay đồ uống, trả lời: "KHONG_LIEN_QUAN"
Nếu là món ăn nhưng không nhận ra tên cụ thể, trả lời: "đồ uống"
"""
        response = client.models.generate_content(
            model=MODEL_NAME, 
            contents=[identify_prompt, img]
        )
        keyword = response.text.strip().replace('"', '').replace("'", "")
        
        # Giới hạn keyword quá dài
        if len(keyword) > 30:
            keyword = keyword[:30]
            
        return keyword
    except Exception as e:
        print(f"Identify error: {e}")
        return "đồ uống"


def format_products_to_cards(products):
    """
    Format danh sách sản phẩm thành chuỗi PRODUCT_CARD.
    """
    cards_text = ""
    for p in products:
        card = {
            "id": p.get('productId'),
            "name": p.get('productName'),
            "price": p.get('specialPrice', p.get('price')),
            "image": p.get('image'),
            "description": p.get('description', '')
        }
        cards_text += f"[PRODUCT_CARD: {json.dumps(card, ensure_ascii=False)}]\n"
    return cards_text


@app.route("/chat", methods=["POST"])
def chat_gemini():
    user_message = request.form.get("message", "").strip()
    image_file = request.files.get("image")
    
    # 🔍 DEBUG: Log để kiểm tra
    print(f"📩 Received message: '{user_message}'")
    print(f"📷 Image received: {image_file is not None}")
    if image_file:
        print(f"📷 Image filename: {image_file.filename}")
        print(f"📷 Image content type: {image_file.content_type}")

    if not user_message and not image_file:
        return jsonify({"status": "error", "message": "Rỗng"}), 400

    try:
        menu_json = get_restaurant_data()
        
        # =============================================
        # 🆕 XỬ LÝ TÌM KIẾM SẢN PHẨM BẰNG HÌNH ẢNH
        # =============================================
        if image_file:
            img = Image.open(image_file)
            img.thumbnail((800, 800))
            
            # Bước 1: Nhận diện sản phẩm từ ảnh
            keyword = identify_product_from_image(img)
            print(f"📸 Detected keyword: {keyword}")

            # [NEW] Xử lý khi ảnh không liên quan
            if keyword == "KHONG_LIEN_QUAN":
                return jsonify({
                    "status": "success",
                    "reply": "Xin lỗi, mình không thấy có sản phẩm nào như vậy trong hình ảnh này. Bạn thử gửi ảnh món ăn hoặc đồ uống xem sao nhé! 🍔🥤",
                    "detected_keyword": keyword
                })
            
            
            # Bước 2: Tìm kiếm sản phẩm tương tự trong database
            similar_products = search_products_by_keyword(keyword)
            print(f"🔍 Found {len(similar_products)} similar products")
            
            # Bước 3: Tạo response
            if similar_products:
                reply = f"Mình nhận ra đây có vẻ là **{keyword}**! 🔍\n\n"
                reply += f"Đây là {len(similar_products)} sản phẩm tương tự trong menu của chúng mình:\n\n"
                reply += format_products_to_cards(similar_products)
                reply += "\nBạn muốn thêm món nào vào giỏ hàng? 🛒"
            else:
                # Nếu không tìm thấy, dùng AI gợi ý từ menu
                reply = f"Mình thấy đây giống **{keyword}**! 🔍\n\n"
                reply += "Tiếc là không có sản phẩm giống y hệt trong menu. "
                reply += "Nhưng mình có thể gợi ý một số món khác cho bạn!\n\n"
                
                # Gọi AI để gợi ý
                fallback_prompt = f"""
Menu hiện có: {menu_json}

Khách gửi hình ảnh sản phẩm giống "{keyword}" nhưng không có trong menu.
Hãy gợi ý 2-3 sản phẩm TƯƠNG TỰ hoặc LIÊN QUAN từ menu.
Trả lời ngắn gọn và hiển thị dưới dạng PRODUCT_CARD.
Format: [PRODUCT_CARD: {{"id": "id", "name": "tên", "price": giá, "image": "ảnh"}}]
"""
                fallback_response = client.models.generate_content(
                    model=MODEL_NAME, 
                    contents=[fallback_prompt, img]
                )
                reply += fallback_response.text
            
            return jsonify({
                "status": "success",
                "reply": reply,
                "detected_keyword": keyword
            })
        
        # =============================================
        # CHAT THÔNG THƯỜNG (không có ảnh)
        # =============================================
        system_instruction = f"""
Bạn là trợ lý bán hàng thông minh, thân thiện cho quán kem và đồ uống.

Menu thực tế hiện có: {menu_json}

QUY TẮC ỨNG XỬ:
1. LUÔN đối chiếu yêu cầu của khách với Menu. Nếu khách hỏi món KHÔNG CÓ, hãy lịch sự từ chối và gợi ý món tương tự có trong Menu.
2. Trình bày văn bản phong cách sang trọng, ngắn gọn, ấm áp, sử dụng emoji.
3. Khi khách thể hiện ý định mua hàng (ví dụ: "lấy tôi món này", "đặt hàng", "thanh toán", "tính tiền"), hãy cung cấp tổng số tiền và chèn thẻ thanh toán: [CHECKOUT_CARD].
4. Nếu khách hỏi về giá, hãy trả lời chính xác từ menu.
5. Nếu khách muốn xem menu, hãy gợi ý 3-5 món nổi bật dưới dạng PRODUCT_CARD.

QUY TẮC ĐỊNH DẠNG (BẮT BUỘC):
- Thẻ sản phẩm: [PRODUCT_CARD: {{"id": id, "name": "tên", "price": giá, "image": "ảnh"}}]
- Thẻ thanh toán: [CHECKOUT_CARD] (Chỉ dùng khi khách chốt đơn).
- Các thẻ PHẢI nằm ở dòng cuối cùng của câu trả lời.
- KHÔNG hiển thị mã JSON thô cho khách xem.
"""

        contents = [system_instruction, f"Khách: {user_message}"]
        response = client.models.generate_content(model=MODEL_NAME, contents=contents)

        return jsonify({
            "status": "success",
            "reply": response.text
        })

    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================
# 🆕 ENDPOINT TÌM KIẾM SẢN PHẨM BẰNG HÌNH ẢNH
# ============================================
@app.route("/search-by-image", methods=["POST"])
def search_by_image():
    """
    Endpoint riêng cho việc tìm kiếm sản phẩm bằng hình ảnh.
    Trả về danh sách sản phẩm tương tự dưới dạng JSON.
    """
    image_file = request.files.get("image")
    
    if not image_file:
        return jsonify({"status": "error", "message": "Cần có hình ảnh"}), 400

    try:
        img = Image.open(image_file)
        img.thumbnail((800, 800))
        
        # Nhận diện sản phẩm
        keyword = identify_product_from_image(img)
        print(f"📸 Search by image - Detected: {keyword}")

        if keyword == "KHONG_LIEN_QUAN":
             return jsonify({
                "status": "success",
                "keyword": keyword,
                "products": [],
                "reply": "Không tìm thấy sản phẩm nào phù hợp với hình ảnh này."
            })
        
        
        # Tìm kiếm sản phẩm
        products = search_products_by_keyword(keyword)
        
        # Format kết quả
        result_cards = []
        for p in products:
            result_cards.append({
                "id": p.get('productId'),
                "name": p.get('productName'),
                "price": p.get('specialPrice', p.get('price')),
                "image": p.get('image'),
                "description": p.get('description', '')
            })
        
        if products:
            reply = f"Mình nhận ra đây là **{keyword}**! Đây là {len(products)} sản phẩm tương tự:\n\n"
            reply += format_products_to_cards(products)
            reply += "\nBạn muốn thêm món nào? 🛒"
        else:
            reply = f"Không tìm thấy sản phẩm nào giống '{keyword}' trong menu."
        
        return jsonify({
            "status": "success",
            "keyword": keyword,
            "products": result_cards,
            "reply": reply
        })

    except Exception as e:
        print(f"Search error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "model": MODEL_NAME,
        "java_api": JAVA_API_URL
    })


if __name__ == "__main__":
    print("=" * 50)
    print("🚀 GEMINI VISION CHAT SERVER - Image Search")
    print("=" * 50)
    print(f"📡 Java API: {JAVA_API_URL}")
    print(f"🤖 Model: {MODEL_NAME}")
    print("=" * 50)
    print("Endpoints:")
    print("  POST /chat            - Chat với AI (hỗ trợ tìm kiếm bằng ảnh)")
    print("  POST /search-by-image - Tìm sản phẩm bằng ảnh (trả về JSON)")
    print("  GET  /health          - Health check")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)