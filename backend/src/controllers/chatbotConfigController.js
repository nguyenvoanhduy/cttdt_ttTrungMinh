import ChatbotConfig from '../models/ChatbotConfig.js';

// Lấy cấu hình chatbot
export const getChatbotConfig = async (req, res) => {
  try {
    let config = await ChatbotConfig.findOne();
    
    // Nếu chưa có config, tạo config mặc định
    if (!config) {
      config = new ChatbotConfig({
        isActive: true,
        name: 'Trợ lý ảo Thánh Thất',
        welcomeMessage: 'Xin chào! Tôi có thể giúp gì cho bạn?',
        suggestedQuestions: [
          'Địa chỉ Thánh Thất ở đâu?',
          'Lịch sinh hoạt như thế nào?',
          'Cách đăng ký tham gia sự kiện?',
        ],
        knowledgeBase: [
          { keyword: 'địa chỉ', response: 'Thánh Thất Trung Minh tọa lạc tại...' },
          { keyword: 'giờ sinh hoạt', response: 'Sinh hoạt vào Chủ nhật hàng tuần...' },
          { keyword: 'đăng ký', response: 'Bạn có thể đăng ký qua website hoặc liên hệ...' },
        ],
      });
      await config.save();
    }

    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error('Error getting chatbot config:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy cấu hình chatbot',
    });
  }
};

// Cập nhật cấu hình chatbot
export const updateChatbotConfig = async (req, res) => {
  try {
    const { isActive, name, welcomeMessage, suggestedQuestions, knowledgeBase } = req.body;

    let config = await ChatbotConfig.findOne();

    if (!config) {
      // Tạo mới nếu chưa có
      config = new ChatbotConfig({
        isActive,
        name,
        welcomeMessage,
        suggestedQuestions,
        knowledgeBase,
      });
    } else {
      // Cập nhật
      config.isActive = isActive;
      config.name = name;
      config.welcomeMessage = welcomeMessage;
      config.suggestedQuestions = suggestedQuestions;
      config.knowledgeBase = knowledgeBase;
    }

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Đã lưu cấu hình chatbot',
      data: config,
    });
  } catch (error) {
    console.error('Error updating chatbot config:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu cấu hình chatbot',
    });
  }
};
