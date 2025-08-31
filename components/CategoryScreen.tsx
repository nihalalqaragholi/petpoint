import { View, Text, TouchableOpacity } from "react-native";

const STRINGS = {
  en: {
    selectCat: (animal) => `Select Category - ${animal}`,
    back: "←",
    lang: "العربية",
    categories: {
      food: "Food",
      clean: "Clean & Clear",
      accessories: "Accessories",
    },
    animal: {
      cats: "Cats",
      dogs: "Dogs",
      birds: "Birds",
      fishes: "Fishes",
    },
  },
  ar: {
    selectCat: (animal) => `اختر القسم - ${animal}`,
    back: "→",
    lang: "EN",
    categories: {
      food: "طعام",
      clean: "نظافة وعناية",
      accessories: "اكسسوارات",
    },
    animal: {
      cats: "قطط",
      dogs: "كلاب",
      birds: "طيور",
      fishes: "أسماك",
    },
  }
};
const categories = [
  { key: "food", emoji: "🍲" },
  { key: "clean", emoji: "🧼" },
  { key: "accessories", emoji: "🛒" },
];

export default function CategoryScreen({ animal, lang, onChangeLang, setLang, onSelectCategory, onBack }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const changeLang = typeof onChangeLang === 'function' ? onChangeLang : (typeof setLang === 'function' ? setLang : undefined);
  return (
    <View className="flex-1 bg-[#DFECCB]">
      {/* Language toggle at upper right */}
      <View className="absolute top-8 right-5 z-20">
        <TouchableOpacity onPress={() => changeLang && changeLang(lang === 'en' ? 'ar' : 'en')}>
          <Text className="text-base font-bold text-brand">{t.lang}</Text>
        </TouchableOpacity>
      </View>
      {/* Back + lang toggle */}
      <View className={`flex-row justify-between items-center mb-2 w-full ${dir==='rtl'?'flex-row-reverse':''}` }>
        <TouchableOpacity className="p-2 bg-white/80 rounded-full" onPress={onBack}>
          <Text className="text-2xl font-extrabold text-black">{t.back}</Text>
        </TouchableOpacity>
        {false && (
          <TouchableOpacity className="px-4 py-2 bg-white/90 rounded-full" onPress={()=>{}}>
            <Text className="font-bold text-black text-base">{t.lang}</Text>
          </TouchableOpacity>
        )}
      </View>
      {/* Title */}
      <Text className={`text-2xl font-extrabold mb-8 mt-2 text-black text-center ${dir==='rtl'?'text-right':'text-left'}`}> 
        {t.selectCat(t.animal[animal])}
      </Text>
      {/* Categories grid */}
      <View className="w-full flex-row flex-wrap justify-between mt-2 gap-y-6">
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            className="w-[48%] aspect-square bg-white/90 rounded-3xl items-center justify-center shadow-lg mb-2 border-2 border-[#F8991C]"
            onPress={() => onSelectCategory(cat.key)}
            activeOpacity={0.85}
          >
            <Text className="text-5xl mb-2">{cat.emoji}</Text>
            <Text className="text-lg font-bold text-[#212121] text-center">
              {t.categories[cat.key]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}