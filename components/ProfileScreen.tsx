import { View, Text, TextInput, Image } from "react-native";
import { useState } from "react";
import AnimatedPressable from "./AnimatedPressable";

const STRINGS = {
  en: {
    profile: "My Profile",
    name: "Name",
    phone: "Phone",
    address: "Address",
    change: "Edit",
    save: "Save",
    logout: "Log Out",
    lang: "العربية",
    admin: "Admin Panel",
  },
  ar: {
    profile: "ملفي الشخصي",
    name: "الاسم",
    phone: "رقم الهاتف",
    address: "العنوان",
    change: "تعديل",
    save: "حفظ",
    logout: "تسجيل الخروج",
    lang: "EN",
    admin: "لوحة الإدارة",
  }
};

const demoUser = {
  name: "Ahmed Ali",
  phone: "07712345678",
  address: {
    en: "Baghdad / Atifiya - Near Gas Station",
    ar: "بغداد - العطيفية، قرب محطة الوقود"
  }
};

export default function ProfileScreen({ lang, setLang, onBack, onSignOut, onEnterAdmin }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState({ ...demoUser });
  const [form, setForm] = useState({ name: user.name, address: user.address[lang] });

  const save = () => {
    setUser(f => ({ ...f, name: form.name, address: { ...f.address, [lang]: form.address } }));
    setEdit(false);
  };

  return (
    <View className="flex-1 bg-[#DFECCB] px-6 pt-14">
      {/* About Card: Logo, Address, Phone, Logout */}
      <View className="bg-white/95 rounded-2xl px-5 py-5 shadow flex-col items-center mb-7">
        <View style={{
          borderRadius:40,
          shadowColor:'#d4e6bb',
          shadowOpacity:0.88,
          shadowRadius:18,
          shadowOffset:{width:0, height:7},
          elevation:12,
          backgroundColor:'transparent',
          width:75,
          height:75,
          alignItems:'center',
          justifyContent:'center',
        }}>
          <Image source={{ uri: 'https://firebasestorage.googleapis.com:443/v0/b/steercode.firebasestorage.app/o/users%2FiygOBjok3mfXWlnlubS014iaV973%2Fattachments%2F231EB523-C288-435C-89AC-F906B7A7659A.png?alt=media&token=ef2b61b3-5482-4475-a6c4-2226030e7474' }} style={{ width: 66, height: 66, borderRadius: 38 }} />
        </View>
        <Text className="text-black font-bold text-base mb-1 text-center">{user.address[lang]}</Text>
        <Text className="text-neutral-700 text-sm mb-1 text-center">{user.phone}</Text>
        {typeof onEnterAdmin === 'function' && (
          <AnimatedPressable style={{alignItems:'center',marginTop:10, borderRadius:16, backgroundColor:'#C0DC17', paddingHorizontal:22, paddingVertical:9}} onPress={onEnterAdmin}>
            <Text className="text-black font-bold text-base">{t.admin}</Text>
          </AnimatedPressable>
        )}
        <AnimatedPressable style={{alignItems:'center',marginTop:12, borderRadius:16, backgroundColor:'#FF7300', paddingHorizontal:22, paddingVertical:9}} onPress={onSignOut}>
          <Text className="text-white font-bold text-base">{t.logout}</Text>
        </AnimatedPressable>
      </View>
      {/* Back only - language toggle removed */}
      <View className={`flex-row justify-between items-center mb-1 ${dir==='rtl'?'flex-row-reverse':''}` }>
        <AnimatedPressable style={{}} onPress={onBack}>
          <Text className="text-2xl font-extrabold text-black">{dir==="rtl"?"→":"←"}</Text>
        </AnimatedPressable>
      </View>
      <Text className={`text-2xl font-extrabold text-black mb-4 text-center ${dir==='rtl'?'text-right':'text-left'}`}>{t.profile}</Text>
      {/* Info fields */}
      <View className="bg-white/90 rounded-2xl px-5 pt-4 pb-7 shadow mb-6">
        {/* Name */}
        <Text className={`text-black font-semibold text-base mb-1 ${dir==='rtl'?'text-right':'text-left'}`}>{t.name}</Text>
        {edit ? (
          <TextInput
            value={form.name}
            onChangeText={(v)=>setForm(f=>({...f,name:v}))}
            className="bg-gray-100 rounded-xl px-3 py-2 text-base mb-2 text-black"
            style={{textAlign:dir}}
          />
        ) : (
          <Text className={`text-black text-base mb-2 ${dir==='rtl'?'text-right':'text-left'}`}>{user.name}</Text>
        )}
        {/* Phone (not editable) */}
        <Text className={`text-black font-semibold text-base mb-1 ${dir==='rtl'?'text-right':'text-left'}`}>{t.phone}</Text>
        <Text className={`text-black text-base mb-2 ${dir==='rtl'?'text-right':'text-left'}`}>{user.phone}</Text>
        {/* Address */}
        <Text className={`text-black font-semibold text-base mb-1 ${dir==='rtl'?'text-right':'text-left'}`}>{t.address}</Text>
        {edit ? (
          <TextInput
            value={form.address}
            onChangeText={(v)=>setForm(f=>({...f,address:v}))}
            className="bg-gray-100 rounded-xl px-3 py-2 text-base mb-2 text-black"
            style={{textAlign:dir}}
          />
        ) : (
          <Text className={`text-black text-base mb-2 ${dir==='rtl'?'text-right':'text-left'}`}>{user.address[lang]}</Text>
        )}
        {/* Edit/Save */}
        <View className="flex-row justify-end mt-1">
          {edit ? (
            <AnimatedPressable onPress={save} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#C0DC17', borderRadius: 12 }}>
              <Text className="font-bold text-black text-base">{t.save}</Text>
            </AnimatedPressable>
          ) : (
            <AnimatedPressable onPress={()=>{setEdit(true);setForm({name:user.name,address:user.address[lang]});}} style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FF7300', borderRadius: 12 }}>
              <Text className="font-bold text-white text-base">{t.change}</Text>
            </AnimatedPressable>
          )}
        </View>
      </View>
    </View>
  );
}