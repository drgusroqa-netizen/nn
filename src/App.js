import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { 
  Send, Image as ImageIcon, Plus, Menu, X, Loader2, User, Bot, 
  Video, Sparkles, Play, LogOut, MessageSquare, Wand2, Lightbulb, FileText 
} from 'lucide-react';

// --- إعدادات المشروع (استبدلها ببياناتك من Firebase Console) ---
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const CONST_API_KEY = "ضع_مفتاح_AI_STUDIO_هنا"; 

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const App = () => {
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState('chat');
  const scrollRef = useRef(null);

  useEffect(() => {
    signInAnonymously(auth).catch(console.error);
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setLoading(true);

    // إضافة رسالة المستخدم (محلياً للعرض السريع أو عبر Firebase)
    const newMsg = { role: 'user', content: userMsg, type: 'text' };
    setMessages(prev => [...prev, newMsg]);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONST_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: userMsg }] }] })
      });
      const data = await response.json();
      const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "عذراً، لم أستطع فهم ذلك.";
      
      setMessages(prev => [...prev, { role: 'bot', content: aiText, type: 'text' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-white selection:text-black" dir="rtl">
      
      {/* Sidebar - القائمة الجانبية */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-[#0a0a0a] border-l border-[#1a1a1a] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-4 flex flex-col h-full">
          <button onClick={() => setCurrentChatId(null)} className="flex items-center gap-2 p-3 mb-6 bg-white text-black rounded-xl font-bold text-sm hover:opacity-90 transition-all">
            <Plus size={18} />
            <span>دردشة جديدة</span>
          </button>
          
          <div className="flex-1 overflow-y-auto">
            <p className="text-[10px] text-gray-500 px-2 font-bold uppercase tracking-widest mb-4">المحادثات الأخيرة</p>
            <div className="space-y-1">
              {/* هنا تظهر قائمة المحادثات */}
              <div className="p-3 rounded-xl text-sm text-gray-400 hover:bg-[#111] cursor-pointer">محادثة تجريبية 1</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content - المحتوى الرئيسي */}
      <main className="flex-1 flex flex-col relative bg-black">
        <header className="flex items-center justify-between p-4 border-b border-[#111]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 hover:bg-[#111] rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-blue-400" />
            <h1 className="font-black text-xl tracking-tighter italic uppercase">NASER AI</h1>
          </div>
          <div className="flex gap-2">
            <Lightbulb size={18} className="text-gray-500" />
          </div>
        </header>

        {/* Chat Area - منطقة الدردشة */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-8 max-w-4xl mx-auto w-full">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
              <Bot size={64} className="mb-4" />
              <h2 className="text-2xl font-bold">كيف يمكنني مساعدتك اليوم؟</h2>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-white text-black' : 'bg-[#111] border-[#222]'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`flex flex-col space-y-2 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{msg.role === 'user' ? 'أنت' : 'NASER AI'}</span>
                <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-[#111] text-white' : 'bg-[#0a0a0a] border border-[#1a1a1a]'}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#111]"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-[#111] rounded w-1/4"></div>
                <div className="h-10 bg-[#0a0a0a] rounded w-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area - منطقة الإدخال */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-black">
          <div className="max-w-3xl mx-auto relative">
            <div className="flex gap-2 justify-center mb-4">
               <button onClick={() => setMode('chat')} className={`px-4 py-1 rounded-full text-[10px] font-bold border ${mode === 'chat' ? 'bg-white text-black' : 'border-[#222] text-gray-500'}`}>دردشة</button>
               <button onClick={() => setMode('image')} className={`px-4 py-1 rounded-full text-[10px] font-bold border ${mode === 'image' ? 'bg-white text-black' : 'border-[#222] text-gray-500'}`}>صور</button>
            </div>
            <div className="relative flex items-center">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اسأل Naser AI عن أي شيء..."
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl py-5 pr-6 pl-16 text-sm focus:outline-none focus:border-blue-500 transition-all shadow-2xl"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute left-3 p-3 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="rotate-180" />}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
