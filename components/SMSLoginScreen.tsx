import { useState, useRef } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, TextInput } from "react-native";

const STRINGS = {
  en: {
    signin: "Sign In",
    phoneLbl: "Iraqi Phone Number",
    phonePh: "e.g. 07xxxxxxxxx",
    onlyIraq: "Only Iraqi numbers allowed",
    sendCode: "Send Code",
    codeLbl: "Enter Verification Code",
    codePh: "4-digit code",
    tryCode: "(Try code: 1234 for demo)",
    verify: "Verify",
    changeNum: "Change Number",
    errInvalid: "Enter a valid Iraqi number",
    errCode: "Incorrect code",
    back: "×",
    lang: "عربي",
  },
  ar: {
    signin: "تسجيل الدخول",
    phoneLbl: "رقم الهاتف العراقي",
    phonePh: "مثال: 07xxxxxxxxx",
    onlyIraq: "يُسمح بأرقام عراقية فقط",
    sendCode: "ارسل الرمز",
    codeLbl: "ادخل رمز التحقق",
    codePh: "رمز من 4 أرقام",
    tryCode: "(جرب الرمز: 1234)",
    verify: "تحقق",
    changeNum: "تغيير الرقم",
    errInvalid: "ادخل رقم عراقي صحيح",
    errCode: "رمز خطأ",
    back: "×",
    lang: "EN",
  }
};
function isIraqiNumber(num) {
  // Accepts +9647XXXXXXXX or 07XXXXXXXXX
  return /^((\+9647|07)[0-9]{8,9})$/.test(num);
}

export default function SMSLoginScreen({ lang, setLang, onLogin, onBack }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [step, setStep] = useState(0); // 0: enter phone, 1: code
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const mockCode = useRef("1234");

  // Proceed to code step
  const handleSendCode = () => {
    if (!isIraqiNumber(phone.replace(/\s|-/g, ""))) {
      setError(t.errInvalid);
      return;
    }
    setError("");
    setStep(1);
  };
  // Mock verify code
  const handleVerify = () => {
    if (code === mockCode.current) {
      onLogin(phone);
    } else {
      setError(t.errCode);
    }
  };

  return (
    <SafeAreaView className={`flex-1 bg-[#DFECCB] px-6 pt-4 ${dir === "rtl" ? "items-end" : ""}` }>
      {/* Back + language switch */}
      <View className="flex-row justify-between w-full mt-2 mb-3">
        <TouchableOpacity className="bg-white/75 rounded-full p-2" onPress={onBack}>
          <Text className="text-lg font-bold text-black">{t.back}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/75 rounded-full px-4 py-2" onPress={()=>setLang(lang === "en" ? "ar":"en") }>
          <Text className="font-bold text-black text-base">{t.lang}</Text>
        </TouchableOpacity>
      </View>
      <Text className={`text-3xl font-extrabold text-black text-center mb-7 mt-1 ${dir === "rtl" ? "self-end" : ""}`}>{t.signin}</Text>
      {step === 0 && (
        <View>
          <Text className={`text-lg font-semibold mb-2 text-black ${dir === "rtl" ? "text-right" : "text-left"}`}>{t.phoneLbl}</Text>
          <TextInput
            placeholder={t.phonePh}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            className={`bg-white/90 rounded-xl px-4 py-2 mb-2 text-black text-base ${dir === "rtl" ? "text-right" : "text-left"}`}
            maxLength={13}
            textAlign={dir === "rtl" ? "right" : "left"}
          />
          {error ? (
            <Text className="text-red-600 mb-2">{error}</Text>
          ) : (
            <Text className="text-gray-700 mb-2 text-xs">{t.onlyIraq}</Text>
          )}
          <TouchableOpacity
            className="bg-[#F8991C] rounded-2xl py-2 mt-2"
            activeOpacity={0.9}
            onPress={handleSendCode}
          >
            <Text className="text-white font-bold text-lg text-center">{t.sendCode}</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 1 && (
        <View>
          <Text className={`text-lg font-semibold mb-2 text-black ${dir === "rtl" ? "text-right" : "text-left"}`}>{t.codeLbl}</Text>
          <TextInput
            placeholder={t.codePh}
            value={code}
            onChangeText={v=>setCode(v.replace(/\D/g, "").substring(0,4))}
            keyboardType="number-pad"
            className={`bg-white/90 rounded-xl px-4 py-2 mb-2 text-black text-base text-center letter-spacing-[0.18em] ${dir === "rtl" ? "text-right" : "text-left"}`}
            maxLength={4}
            textAlign={dir === "rtl" ? "right" : "left"}
          />
          <Text className="text-gray-700 mb-3 text-xs">{t.tryCode}</Text>
          {error ? <Text className="text-red-600 mb-2">{error}</Text> : null}
          <TouchableOpacity className="bg-[#F8991C] rounded-2xl py-2 mb-2" activeOpacity={0.9} onPress={handleVerify}>
            <Text className="text-white font-bold text-lg text-center">{t.verify}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="py-2" onPress={()=>setStep(0)}>
            <Text className="text-[#F8991C] text-center font-bold">{t.changeNum}</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}