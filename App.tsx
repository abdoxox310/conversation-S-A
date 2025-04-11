import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "./components/ui/toaster";
import { useEffect, useState } from "react";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const updateStatus = useMutation(api.users.updateStatus);

  useEffect(() => {
    const interval = setInterval(() => {
      updateStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [updateStatus]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white'}`}>
      <header className={`sticky top-0 z-10 ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm p-4 flex justify-between items-center border-b`}>
        <h2 className="text-xl font-semibold">دردشة الأصدقاء</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-8" dir="rtl">
        <div className="w-full max-w-4xl mx-auto">
          <Content isDarkMode={isDarkMode} />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

function Content({ isDarkMode }: { isDarkMode: boolean }) {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const messages = useQuery(api.messages.list) ?? [];
  const onlineUsers = useQuery(api.users.getOnlineUsers) ?? [];
  const sendMessage = useMutation(api.messages.send);
  const [newMessage, setNewMessage] = useState("");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessage({ content: newMessage });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col gap-8">
      <Unauthenticated>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">مرحباً بك في دردشة الأصدقاء</h1>
          <p className="text-xl text-slate-600">سجل دخول للبدء</p>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className={`flex gap-4 h-[600px] ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-lg p-4`}>
          <div className={`w-1/4 ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4`}>
            <h3 className="text-lg font-semibold mb-4">المتصلون الآن</h3>
            <div className="space-y-2">
              {onlineUsers.map((user) => (
                <div key={user.userId} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{user.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className={`flex-1 overflow-y-auto ${isDarkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg p-4 mb-4`}>
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 ${
                    message.senderId === loggedInUser?._id
                      ? 'mr-auto bg-blue-500 text-white'
                      : 'ml-auto bg-gray-200 text-gray-900'
                  } rounded-lg p-3 max-w-[70%]`}
                >
                  <div className="font-semibold text-sm">{message.senderName}</div>
                  <div>{message.content}</div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                className={`flex-1 rounded-lg px-4 py-2 ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                }`}
              />
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                إرسال
              </button>
            </form>
          </div>
        </div>
      </Authenticated>
    </div>
  );
}
