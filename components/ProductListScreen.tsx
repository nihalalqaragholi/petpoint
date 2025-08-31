import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import AnimatedPressable from "./AnimatedPressable";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const STRINGS = {
  en: {
    back: "←",
    empty: "No products available.",
    loading: "Loading products...",
    add: "Add to Cart",
    added: "In Cart",
    animal: {
      cats: "Cats",
      dogs: "Dogs",
      birds: "Birds",
      fishes: "Fishes",
    },
    category: {
      food: "Food",
      clean: "Clean & Clear",
      accessories: "Accessories",
    },
    prodTitle: (cat, anim) => `${cat} Products - ${anim}`,
  },
  ar: {
    back: "→",
    empty: "لا يوجد منتجات متاحة.",
    loading: "جاري تحميل المنتجات...",
    add: "أضف للسلة",
    added: "بالسلة",
    animal: {
      cats: "قطط",
      dogs: "كلاب",
      birds: "طيور",
      fishes: "أسماك",
    },
    category: {
      food: "طعام",
      clean: "نظافة وعناية",
      accessories: "اكسسوارات",
    },
    prodTitle: (cat, anim) => `منتجات ${cat} - ${anim}`,
  },
};

type DbProduct = {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  img_url: string | null;
  price: number;
  animal_type: string;
  category: string;
};

export default function ProductListScreen({ animal, category, lang, setLang, onBack, addToCart, updateCartQty, removeFromCart, cart }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const catName = t.category[category] ?? category;
  const animName = t.animal[animal] ?? animal;
  const inCartQty = (id) => (cart?.find((i)=>i.id===id)?.qty || 0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    console.log('[Products] Fetch', { animal, category });
    supabase
      .from('products')
      .select('id,name_en,name_ar,description_en,description_ar,img_url,price,animal_type,category')
      .eq('animal_type', animal)
      .eq('category', category)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          console.log('[Products] Error', error.message);
          setError(error.message);
          setProducts([]);
        } else {
          console.log('[Products] Loaded', data?.length || 0);
          setProducts((data as any) || []);
        }
      })
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, [animal, category]);
  return (
    <View className="flex-1 bg-[#DFECCB] px-5 pt-10">
      {/* Back Button */}
      <AnimatedPressable style={{position:'absolute',left:16,top:40,backgroundColor:'#FFF8',borderRadius:99,padding:8,zIndex:2}} onPress={onBack}>
        <Text className="text-2xl font-extrabold text-black">{t.back}</Text>
      </AnimatedPressable>
      {/* Title */}
      <Text className={`text-xl font-extrabold mb-3 text-center text-black mt-3 ${dir==="rtl"?"text-right":"text-left" }`}>
        {t.prodTitle(catName, animName)}
      </Text>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        {loading && (
          <View className="mt-10 items-center">
            <ActivityIndicator color="#36543C" />
            <Text className="mt-2 text-[#36543C] font-semibold">{t.loading}</Text>
          </View>
        )}
        {!loading && products.length === 0 && (
          <Text className={`text-center w-full text-black/40 mt-16 text-lg ${dir==="rtl"?"text-right":"text-left"}`}>{t.empty}</Text>
        )}
        <View className="flex-row flex-wrap gap-x-4 gap-y-6 justify-between mt-3 pb-4">
          {products.map((prod) => {
            const qty = inCartQty(prod.id);
            const name = lang === 'ar' ? prod.name_ar : prod.name_en;
            const desc = lang === 'ar' ? prod.description_ar : prod.description_en;
            const img = prod.img_url || 'https://via.placeholder.com/300x300.png?text=No+Image';
            return (
              <View key={prod.id} className="w-[46%] bg-white/95 rounded-3xl p-2 shadow-lg mb-1 items-center">
                <Image source={{ uri: img }} style={{ height: 90, width: "100%", borderRadius: 18 }} resizeMode="cover" className="mb-3" />
                <Text className="font-bold text-base text-black mb-1 text-center min-h-[36px]">
                  {name}
                </Text>
                <Text className="text-xs text-[#595959] text-center mb-0.5 min-h-[28px]">
                  {desc}
                </Text>
                <Text className="text-[#F8991C] font-bold mt-1 mb-1 text-base text-center">{Number(prod.price).toLocaleString()} IQD</Text>
                <View style={{flexDirection:dir==='rtl'?'row-reverse':'row',alignItems:'center',justifyContent:'center',width:'90%',marginTop:6,gap:6}}>
                  {qty === 0 ? (
                    <AnimatedPressable style={{ borderRadius: 12, paddingHorizontal: 16, paddingVertical: 7, backgroundColor: '#F8991C', flex:1 }} onPress={()=>addToCart({ id: prod.id, name: { en: prod.name_en, ar: prod.name_ar }, desc: { en: prod.description_en, ar: prod.description_ar }, img, price: Number(prod.price) })}>
                      <Text className="font-bold text-white text-lg text-center">{t.add}</Text>
                    </AnimatedPressable>
                  ) : (
                    <>
                      <AnimatedPressable style={{ borderRadius: 15, backgroundColor: '#F8991C', width:32, height:36, alignItems:'center', justifyContent:'center' }} onPress={()=>qty>1?updateCartQty(prod.id,-1):removeFromCart(prod.id)}>
                        <Text className="font-bold text-white text-xl">-</Text>
                      </AnimatedPressable>
                      <Text className="font-bold text-black text-base px-2 min-w-[26px] text-center">{qty}</Text>
                      <AnimatedPressable style={{ borderRadius: 15, backgroundColor: '#C0DC17', width:32, height:36, alignItems:'center', justifyContent:'center'}} onPress={()=>updateCartQty(prod.id,1)}>
                        <Text className="font-bold text-black text-xl">+</Text>
                      </AnimatedPressable>
                    </>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}