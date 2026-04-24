import { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User as UserIcon,
  Minimize2,
  Maximize2
} from 'lucide-react';

// Chatbot Component
export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm your NagroMS assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Predefined responses based on keywords
  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();

    // Order related queries
    if (lowerMessage.includes('order') || lowerMessage.includes('track')) {
      return "You can track your orders by going to the 'My Orders' section in your dashboard. There you'll see real-time tracking updates for all your orders! 📦";
    }

    // Payment queries
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return "We accept multiple payment methods:\n• Cash on Delivery (COD)\n• Bank Transfer\n• Mobile Payment (eZ Cash, FriMi)\n\nFor bank transfers, you'll need to upload the payment receipt. 💳";
    }

    // Delivery queries
    if (lowerMessage.includes('delivery') || lowerMessage.includes('shipping')) {
      return "Delivery fees are calculated based on distance from the farmer's location. Orders are typically delivered within 2-3 days. You can add special delivery instructions during checkout! 🚚";
    }

    // Product queries
    if (lowerMessage.includes('product') || lowerMessage.includes('available') || lowerMessage.includes('stock')) {
      return "You can browse all available products in the 'Browse Products' section. Use filters to find products by category and location. If you can't find what you need, use the 'Request Product' feature! 🌾";
    }

    // Farmer contact
    if (lowerMessage.includes('farmer') || lowerMessage.includes('contact')) {
      return "You can contact farmers directly through:\n• Their phone number shown on product cards\n• The 'Contact Farmer' button in your order details\n\nFarmers are usually available during business hours (8 AM - 6 PM). 📞";
    }

    // Request product
    if (lowerMessage.includes('request')) {
      return "To request a product:\n1. Go to 'Browse Products'\n2. Click 'Request Product' button\n3. Fill in the product details\n4. Submit!\n\nYou'll get notified when a farmer adds the requested product. 🔔";
    }

    // Profile/Account
    if (lowerMessage.includes('profile') || lowerMessage.includes('account') || lowerMessage.includes('address')) {
      return "You can manage your profile and delivery address in the 'Profile' section. Make sure to keep your delivery address updated for smooth deliveries! 👤";
    }

    // Returns/refunds
    if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('cancel')) {
      return "For order cancellations or returns:\n• Contact the farmer directly through the order details\n• Cancellations are possible before the order is packed\n• Returns are handled on a case-by-case basis\n\nPlease reach out to customer support at support@nagroms.lk for assistance. 🔄";
    }

    // Quality concerns
    if (lowerMessage.includes('quality') || lowerMessage.includes('fresh')) {
      return "All products on NagroMS come directly from verified farmers. Check the farmer's rating and reviews before ordering. If you receive products with quality issues, contact the farmer immediately! ⭐";
    }

    // Help/support
    if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
      return "I'm here to help! You can:\n• Ask me about orders, payments, delivery\n• Email: support@nagroms.lk\n• Call: +94 11 234 5678 (Mon-Sat, 8 AM - 6 PM)\n\nWhat would you like to know? 💚";
    }

    // Greeting
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return "Hello! 👋 How can I assist you today? Feel free to ask me about orders, products, payments, or anything else!";
    }

    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! Happy to help! 😊 Is there anything else you'd like to know?";
    }

    // Default response
    return "I'm here to help! You can ask me about:\n• Order tracking & status\n• Payment methods\n• Delivery information\n• Product availability\n• Contacting farmers\n• Account management\n\nWhat would you like to know? 🤔";
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick action buttons
  const quickActions = [
    { text: 'Track my order', icon: '📦' },
    { text: 'Payment methods', icon: '💳' },
    { text: 'Contact farmer', icon: '👨‍🌾' },
    { text: 'Request product', icon: '📝' }
  ];

  const handleQuickAction = (actionText) => {
    setInputMessage(actionText);
    handleSendMessage();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-8 h-8" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`fixed ${isMinimized ? 'bottom-6 right-6' : 'bottom-6 right-6'} z-50 transition-all duration-300`}>
      {/* Minimized State */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        >
          <MessageCircle className="w-8 h-8" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"></span>
        </button>
      ) : (
        /* Full Chatbot Window */
        <div className="w-96 h-[600px] bg-white rounded-2xl shadow-2xl border-2 border-green-100 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold">NagroMS Assistant</h3>
                <p className="text-xs text-green-100">Online • Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                aria-label="Minimize"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'bot'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {message.sender === 'bot' ? (
                    <Bot className="w-5 h-5" />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.sender === 'bot'
                      ? 'bg-white border border-gray-200 text-gray-800'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === 'bot' ? 'text-gray-400' : 'text-green-100'
                    }`}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <p className="text-xs text-gray-600 mb-2 font-medium">Quick Actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(action.text)}
                    className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium flex items-center gap-2"
                  >
                    <span>{action.icon}</span>
                    <span>{action.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-800"
              />
              <button
                onClick={handleSendMessage}
                disabled={inputMessage.trim() === ''}
                className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}