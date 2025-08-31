import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";

const STRINGS = {
  en: ["Home", "My Pets", "Cart", "Orders", "Profile"],
  ar: ["التطبيق", "حيواناتي", "السلة", "الطلبات", "الملف"],
};
// const barTabs = [
//   { key: "mypets", icon: "🐾" },
//   { key: "cart", icon: "🛒" },
//   { key: "orders", icon: "📦" },
//   { key: "profile", icon: "👤" },
// ];
const barTabs = [
  // { key: "mypets", icon: "🐾" }, // Disabled temporarily
  { key: "cart", icon: "🛒" },
  { key: "orders", icon: "📦" },
  { key: "profile", icon: "👤" },
];
export default function BottomBarSection({ lang = "en", active = "home", onTab, onToggleLang }: { lang?: 'en'|'ar'; active?: string; onTab: (k:string)=>void; onToggleLang?: ()=>void; }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  const t = STRINGS[lang];
  const windowWidth = Dimensions.get("window").width;
  const labelFont = windowWidth < 340 ? 9 : windowWidth < 380 ? 10 : 11;
  const labelMaxWidth = Math.max(70, Math.min(90, windowWidth / 4 - 10));
  return (
    <View className={`bg-white/95 px-1 py-2 flex-row items-end justify-between rounded-t-2xl border-t border-gray-200 shadow-lg mt-4 ${dir==='rtl'?'flex-row-reverse':''}`}
      style={{ minHeight: 53, width: '100%', alignSelf: 'center', position: 'absolute', bottom: 0 }}>
      {barTabs.map((item, idx) => (
        <TouchableOpacity
          onPress={() => onTab(item.key)}
          key={item.key}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', minWidth: 53, opacity: active === item.key ? 1 : 0.82 }}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 22, marginBottom: 2 }}>{item.icon}</Text>
          <Text
            className={`font-semibold ${lang === 'ar' ? 'font-arabic' : ''} text-[#232] mt-[5px]`}
            style={{ fontSize: labelFont, textAlign: 'center', maxWidth: labelMaxWidth }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {/* Shifted labels: previously used idx+1 to include My Pets; now map manually */}
            {item.key === 'cart' ? t[2] : item.key === 'orders' ? t[3] : item.key === 'profile' ? t[4] : item.key}
          </Text>
        </TouchableOpacity>
      ))}
      {/* Dedicated language icon */}
      <TouchableOpacity
        onPress={() => onToggleLang && onToggleLang()}
        style={{ width: 56, alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}
        activeOpacity={0.85}
        accessibilityLabel="Language switch"
      >
        <Text style={{ fontSize: 20 }}>🌐</Text>
        <Text className={`font-semibold ${lang === 'ar' ? 'font-arabic' : ''} text-[#232] mt-[3px]`} style={{ fontSize: 10 }}
          adjustsFontSizeToFit minimumFontScale={0.7} numberOfLines={1}>
          {lang === 'ar' ? 'EN' : 'AR'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}