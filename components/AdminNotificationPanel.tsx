import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";

const mockUsers = [
  { id: 1, name: "Ali Salman", phone: "+9647701112222" },
  { id: 2, name: "Sarah Hamid", phone: "+9647803334444" },
  { id: 3, name: "Bashar Hussain", phone: "+9647505557777" },
];

// Add bilingual strings near top:
const STRINGS = {
  en: {
    notifications: "Notifications",
    notifTitle: "Notification Title",
    notifMsg: "Message",
    placeholderTitle: "e.g. New offer for pets!",
    placeholderMsg: "Enter the message to send...",
    allUsers: "All Users",
    selectUsers: "Select Users",
    send: "Send Notification",
    sentAll: "Notification sent to all users!",
    sentN: n => `Notification sent to ${n} user(s)!`,
    required: "Please enter both title and message.",
    noUsers: "No users selected.",
  },
  ar: {
    notifications: "الإشعارات",
    notifTitle: "عنوان الإشعار",
    notifMsg: "الرسالة",
    placeholderTitle: "مثال: عرض جديد للحيوانات!",
    placeholderMsg: "أدخل الرسالة للإرسال...",
    allUsers: "كل المستخدمين",
    selectUsers: "اختر مستخدمين",
    send: "إرسال الإشعار",
    sentAll: "تم إرسال الإشعار لكل المستخدمين!",
    sentN: n => `تم إرسال الإشعار إلى ${n} مستخدم${n===1?'':'ين'}!`,
    required: "يرجى تعبئة العنوان والرسالة.",
    noUsers: "لم يتم تحديد مستخدمين.",
  }
};

export default function AdminNotificationPanel({ onClose, lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendToAll, setSendToAll] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [banner, setBanner] = useState(null); // {type, text}
  const handleUserToggle = (userId) => {
    setSelectedUsers(s =>
      s.includes(userId) ? s.filter(id => id !== userId) : [...s, userId]
    );
  };
  const onSend = () => {
    if (!title.trim() || !message.trim()) {
      setBanner({ type: 'error', text: t.required });
      setTimeout(() => setBanner(null), 1600);
      return;
    }
    setBanner({ type: 'success', text: sendToAll ?
      t.sentAll :
      t.sentN(selectedUsers.length) });
    setTitle(""); setMessage(""); setSelectedUsers([]); setSendToAll(true);
    setTimeout(() => setBanner(null), 1700);
  };
  return (
    <View className="flex-1 bg-[#F4FAEE] px-4 pt-7" style={{direction:dir}}>
      <View className="flex-row justify-between items-center mb-3">
        <TouchableOpacity onPress={onClose} className="p-2 bg-white/90 rounded-full">
          <Text className="text-2xl font-bold text-black">×</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-2xl font-extrabold text-black text-center mr-7">{t.notifications}</Text>
      </View>
      {banner && (
        <View className={`px-3 py-2 rounded-xl mb-3 ${banner.type === 'success' ? 'bg-green-200' : 'bg-red-200'}`}>
          <Text className={`text-center font-bold ${banner.type === 'success' ? 'text-green-900' : 'text-red-700'}`}>{banner.text}</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="mt-2 font-bold text-base mb-2">{t.notifTitle}</Text>
        <TextInput
          className="bg-white px-3 py-2 rounded-xl border border-gray-300 text-black mb-3 text-base"
          value={title}
          onChangeText={setTitle}
          placeholder={t.placeholderTitle}
          textAlign={dir==='rtl'?'right':'left'}
        />
        <Text className="font-bold text-base mb-2">{t.notifMsg}</Text>
        <TextInput
          className="bg-white px-3 py-2 rounded-xl border border-gray-300 text-black mb-3 text-base"
          value={message}
          onChangeText={setMessage}
          multiline
          minHeight={70}
          placeholder={t.placeholderMsg}
          textAlign={dir==='rtl'?'right':'left'}
        />
        <View className={`flex-row items-center mb-4 mt-1 ${dir==='rtl'?'flex-row-reverse':''}`}>
          <TouchableOpacity onPress={() => setSendToAll(true)} className={`px-4 py-1 rounded-full mr-3 ${sendToAll ? 'bg-[#C0DC17]' : 'bg-white border border-gray-400'}`} >
            <Text className={sendToAll ? "font-bold text-black" : "text-black"}>{t.allUsers}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSendToAll(false)} className={`px-4 py-1 rounded-full ${!sendToAll ? 'bg-[#C0DC17]' : 'bg-white border border-gray-400'}`} >
            <Text className={!sendToAll ? "font-bold text-black" : "text-black"}>{t.selectUsers}</Text>
          </TouchableOpacity>
        </View>
        {!sendToAll && (
          <View className="bg-[#F7FEEB] rounded-2xl px-3 py-2 mb-3">
            {mockUsers.map(u => (
              <TouchableOpacity key={u.id} className="flex-row items-center py-1.5" onPress={() => handleUserToggle(u.id)}>
                <View className={`w-5 h-5 mr-3 rounded border-2 ${selectedUsers.includes(u.id) ? 'bg-[#C0DC17] border-[#85A36C]' : 'bg-white border-gray-400'}`} >
                  {selectedUsers.includes(u.id) && <Text className="text-center text-black">✓</Text>}
                </View>
                <Text className="font-semibold text-base text-black mr-1">{u.name}</Text>
                <Text className="text-xs text-gray-600">{u.phone}</Text>
              </TouchableOpacity>
            ))}
            {selectedUsers.length === 0 && (
              <Text className="text-xs italic text-gray-400 mt-2">{t.noUsers}</Text>
            )}
          </View>
        )}
        <TouchableOpacity className="bg-[#36543C] py-3 rounded-xl mt-3" onPress={onSend}>
          <Text className="text-center text-white text-lg font-bold">{t.send}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}