import { useLanguage } from '../../../i18n/LanguageContext';
import React, { useState, useRef, useEffect } from 'react';

export default function ChatbotSection() {
  const { t } = useLanguage();

  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('farmer.chatbot.welcomeMessage') }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'farmer', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: t('farmer.chatbot.unavailable'), isError: true }]);
        console.error('Chatbot API Error:', data.message);
      }
    } catch (error) {
      console.error('Chatbot fetch error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: t('farmer.chatbot.unavailable'), isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  return (
    <div className="nagro-section-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>{t('farmer.chatbot.title')}</h2>
      
      <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: '400px' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>{t('farmer.chatbot.assistantName')}</h3>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>{t('farmer.chatbot.subtitle')}</p>
        </div>
        
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{ 
                alignSelf: msg.role === 'farmer' ? 'flex-end' : 'flex-start', 
                backgroundColor: msg.role === 'farmer' ? '#22c55e' : (msg.isError ? '#fee2e2' : '#f3f4f6'), 
                color: msg.role === 'farmer' ? 'white' : (msg.isError ? '#dc2626' : '#1f2937'),
                padding: '12px 16px', 
                borderRadius: '12px', 
                maxWidth: '80%' 
              }}
            >
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
            </div>
          ))}
          {isLoading && (
            <div style={{ alignSelf: 'flex-start', backgroundColor: '#f3f4f6', padding: '12px 16px', borderRadius: '12px', maxWidth: '80%' }}>
              <p style={{ color: '#6b7280', margin: 0, fontStyle: 'italic' }}>{t('farmer.chatbot.typing')}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder={t('farmer.chatbot.placeholder')} 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{ flex: 1, padding: '10px 16px', borderRadius: '24px', border: '1px solid #d1d5db', outline: 'none' }} 
          />
          <button 
            onClick={handleSendMessage}
            disabled={isLoading}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '24px', 
              backgroundColor: isLoading ? '#9ca3af' : '#22c55e', 
              color: 'white', 
              border: 'none', 
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              fontWeight: 600 
            }}
          >
            {isLoading ? t('farmer.chatbot.sending') : t('farmer.chatbot.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
