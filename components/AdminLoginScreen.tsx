import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";

export default function AdminLoginScreen({ lang = 'en', onSuccess, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const res = await onSuccess(email, password);
    if(res?.error) setError(res.error);
    setLoading(false);
  };
  return (
    <View className="flex-1 items-center justify-center bg-[#DFECCB] px-6">
      <View className="bg-white/95 w-full rounded-3xl shadow-lg p-8 border border-[#e8eec6] max-w-[380px]">
        <Text className="text-2xl font-extrabold text-[#283a22] mb-2 text-center">{lang==='ar'?'تسجيل دخول الادمن':'Admin Login'}</Text>
        <TextInput
          placeholder={lang==='ar'? 'البريد الإلكتروني' : 'Admin Email'}
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          className="bg-[#F4FAEE] border border-[#C0DC17] rounded-xl px-3 py-2 mb-3 text-black"
        />
        <TextInput
          placeholder={lang==='ar'? 'كلمة المرور' : 'Password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="bg-[#F4FAEE] border border-[#C0DC17] rounded-xl px-3 py-2 mb-3 text-black"
        />
        {!!error && <Text className="text-red-500 mb-2 text-center text-sm">{error}</Text>}
        <TouchableOpacity
          className="bg-[#C0DC17] py-2.5 rounded-xl mb-2 mt-1"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#36543C" /> : <Text className="text-black font-bold text-base text-center">{lang==='ar'?'دخول':'Login'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity className="bg-gray-200 py-2 rounded-xl" onPress={onBack} disabled={loading}>
          <Text className="text-black font-bold text-center">{lang==='ar'?'إلغاء':'Cancel'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
