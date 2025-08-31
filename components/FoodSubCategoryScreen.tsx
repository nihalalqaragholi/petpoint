import { View, Text, TouchableOpacity } from "react-native";

const STRINGS = {
  en: {
    select: "Select Food Subcategory",
    back: "←",
    dry: "Dry Food",
    wet: "Wet Food",
    sub: {
      dry: [
        { key: "kilograms", label: "Kilograms" },
        { key: "bag", label: "Bag" },
      ],
      wet: [
        { key: "cans", label: "Cans" },
        { key: "snacks", label: "Snacks" },
        { key: "pouches", label: "Pouches" },
      ],
    },
  },
  ar: {
    select: "اختر نوع طعام الحيوانات",
    back: "→",
    dry: "طعام جاف",
    wet: "طعام رطب",
    sub: {
      dry: [
        { key: "kilograms", label: "كيلوغرامات" },
        { key: "bag", label: "كيس" },
      ],
      wet: [
        { key: "cans", label: "علب" },
        { key: "snacks", label: "سناكات" },
        { key: "pouches", label: "أكياس صغيرة" },
      ],
    },
  },
};

export default function FoodSubCategoryScreen({
  lang = "en",
  onBack,
  onSelect,
  parent,
}) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  // Show main dry/wet, or nested
  if (!parent) {
    return (
      <View className="flex-1 bg-[#DFECCB] pt-10 px-5">
        <TouchableOpacity className="p-2 bg-white/80 rounded-full w-10 mb-3" onPress={onBack}>
          <Text className="text-2xl font-extrabold text-black">{t.back}</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold mb-8 mt-2 text-black text-center">{t.select}</Text>
        <View className="mt-4 gap-y-7">
          <TouchableOpacity className="bg-white/90 rounded-3xl items-center justify-center shadow-lg mb-4 border-2 border-[#F8991C] py-8" onPress={() => onSelect("dry")}>
            <Text className="text-3xl mb-2">🥣</Text>
            <Text className="text-lg font-bold text-[#212121]">{t.dry}</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white/90 rounded-3xl items-center justify-center shadow-lg mb-4 border-2 border-[#F8991C] py-8" onPress={() => onSelect("wet")}>
            <Text className="text-3xl mb-2">🧃</Text>
            <Text className="text-lg font-bold text-[#212121]">{t.wet}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else if (parent === "dry" || parent === "wet") {
    const subs = t.sub[parent];
    return (
      <View className="flex-1 bg-[#DFECCB] pt-10 px-5">
        <TouchableOpacity className="p-2 bg-white/80 rounded-full w-10 mb-3" onPress={() => onSelect(null)}>
          <Text className="text-2xl font-extrabold text-black">{t.back}</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold mb-8 mt-2 text-black text-center">{t[parent]}</Text>
        <View className="mt-4 gap-y-7">
          {subs.map(({ key, label }) => (
            <TouchableOpacity key={key} className="bg-white/90 rounded-2xl border-2 border-[#C0DC17] items-center py-8 mb-3" onPress={() => onSelect(parent + "." + key)}>
              <Text className="text-lg font-bold text-[#212121]">{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }
  return null;
}