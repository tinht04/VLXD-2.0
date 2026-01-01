import { GoogleGenAI } from "@google/genai";
import { Invoice } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const GeminiService = {
  analyzeBusiness: async (invoices: Invoice[]) => {
    try {
      if (!ai) {
        return "⚠️ Chưa cấu hình Gemini API Key. Vui lòng thêm VITE_GEMINI_API_KEY vào file .env";
      }

      // Summarize data to avoid token limits with large datasets
      const summary = invoices
        .map((inv) => ({
          date: inv.date.split("T")[0],
          total: inv.totalAmount,
          items: inv.items
            .map((i) => `${i.productName} (${i.quantity})`)
            .join(", "),
        }))
        .slice(0, 50); // Analyze last 50 transactions for brevity

      const prompt = `
        Tôi là chủ cửa hàng vật liệu xây dựng. Đây là dữ liệu bán hàng gần đây của tôi (JSON):
        ${JSON.stringify(summary)}

        Hãy đóng vai một chuyên gia tư vấn kinh doanh. 
        1. Phân tích xu hướng doanh thu ngắn gọn.
        2. Mặt hàng nào đang bán chạy?
        3. Đưa ra 1 lời khuyên cụ thể để tăng doanh thu.
        
        Trả lời bằng tiếng Việt, ngắn gọn, súc tích, định dạng Markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Không thể phân tích dữ liệu lúc này. Vui lòng kiểm tra kết nối mạng hoặc API Key.";
    }
  },
};
