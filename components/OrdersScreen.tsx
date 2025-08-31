import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";

const STRINGS = {
  en: {
    header: "My Orders",
    item: "item",
    items: "items",
    reorder: "Reorder",
    view: "View",
    status: {
      pending: "Pending",
      delivered: "Delivered",
      preparing: "Preparing"
    },
    empty: "No orders yet.",
    lang: "العربية",
    back: "←",
    again: "Order placed again!"
  },
  ar: {
    header: "طلباتي",
    item: "منتج",
    items: "منتجات",
    reorder: "اعادة الطلب",
    view: "عرض التفاصيل",
    status: {
      pending: "قيد الانتظار",
      delivered: "تم التوصيل",
      preparing: "جاري التجهيز"
    },
    empty: "لا توجد طلبات بعد.",
    lang: "EN",
    back: "→",
    again: "تم اعادة الطلب!"
  }
};

const demoOrders = [
  { id: 101, items: [
      { name: { en: "Dry Cat Food", ar: "طعام قطط جاف" }, qty: 2, img: "https://images.pexels.com/photos/4523036/pexels-photo-4523036.jpeg?h=300&w=300" },
      { name: { en: "Cat Shampoo", ar: "شامبو القطط" }, qty: 1, img: "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?h=300&w=300" },
    ],
    status: "delivered", total: 24500 },
  { id: 103, items: [
      { name: { en: "Cat Scratching Post", ar: "عمود خدش القطط" }, qty: 1, img: "https://images.pexels.com/photos/1254140/pexels-photo-1254140.jpeg?h=300&w=300" },
    ],
    status: "pending", total: 6000 },
];

export default function OrdersScreen({ lang, setLang, onBack }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [orders, setOrders] = useState([...demoOrders]);
  const [reordered, setReordered] = useState(false);

  const reorder = () => {
    setReordered(true);
    setTimeout(()=>setReordered(false), 1500);
  };

  return (
    <View className="flex-1 bg-[#DFECCB] px-5 pt-10">
      {/* Header + lang */}
      <View className={`flex-row justify-between items-center mb-1 ${dir==='rtl'?'flex-row-reverse':''}` }>
        <TouchableOpacity className="p-2 bg-white/80 rounded-full" onPress={onBack}>
          <Text className="text-2xl font-extrabold text-black">{t.back}</Text>
        </TouchableOpacity>
        <TouchableOpacity className="px-4 py-2 bg-white/90 rounded-full" onPress={()=>setLang(lang==="en"?"ar":"en") }>
          <Text className="font-bold text-black text-base">{t.lang}</Text>
        </TouchableOpacity>
      </View>
      <Text className={`text-2xl font-extrabold text-black mb-2 text-center ${dir==='rtl'?'text-right':'text-left'}`}>{t.header}</Text>
      {orders.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-8">
          <Text className={`text-black/50 text-xl mb-4 ${dir==='rtl'?'text-right':'text-left'}`}>{t.empty}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
          {orders.map(order => (
            <View key={order.id} className={`bg-white/95 mb-4 rounded-2xl px-3 py-3 shadow ${dir==='rtl'?'items-end':'items-start'}` }>
              <Text className="text-black/70 font-semibold mb-2 text-xs">#{order.id}</Text>
              <View className="flex-row mb-1 gap-x-2 flex-wrap">
                {order.items.map((i,idx) => (
                  <View key={idx} className="flex-row items-center mr-2 mb-1">
                    <Image source={{ uri: i.img }} style={{width:28,height:28,borderRadius:6}} className="mr-1" />
                    <Text className="text-xs mx-0.5 font-bold text-black">{i.name[lang]}</Text>
                    <Text className="text-xs text-gray-500">×{i.qty}</Text>
                  </View>
                ))}
              </View>
              <View className="flex-row justify-between items-center mt-2 mb-1">
                <Text className="text-black font-bold text-base">{t.total || "Total"}:</Text>
                <Text className="font-extrabold text-black text-base">{order.total.toLocaleString()} IQD</Text>
              </View>
              <View className="flex-row justify-between items-center mt-1">
                <Text className="text-xs font-semibold text-[#F8991C]">{t.status[order.status]||order.status}</Text>
                <View className="flex-row">
                  <TouchableOpacity className="mr-2" onPress={reorder}>
                    <Text className="text-[#C0DC17] font-bold">{t.reorder}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {reordered && (
        <View className="absolute top-24 left-0 right-0 items-center">
          <Text className="bg-[#C0DC17] text-black font-bold rounded-full px-6 py-2 shadow text-lg border border-[#F8991C]">{t.again}</Text>
        </View>
      )}
    </View>
  );
}