import { View, Text, Image, ScrollView, TextInput, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import AnimatedPressable from "./AnimatedPressable";
import { supabase } from "../lib/supabase";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Picker } from "@react-native-picker/picker";

const STRINGS = {
  en: {
    header: "My Cart",
    item: "item",
    items: "items",
    empty: "Your cart is empty!",
    qty: "Qty",
    remove: "Remove",
    total: "Total",
    placeOrder: "Place Order",
    lang: "العربية",
    back: "←",
    confirm: "Order placed! Thank you.",
  },
  ar: {
    header: "سلتي",
    item: "منتج",
    items: "منتجات",
    empty: "سلتك فارغة!",
    qty: "الكمية",
    remove: "حذف",
    total: "المجموع",
    placeOrder: "تأكيد الطلب",
    lang: "EN",
    back: "→",
    confirm: "تم ارسال الطلب! شكراً لك.",
  },
};

export default function CartScreen({ lang, setLang, onBack, cart = [], updateCartQty, removeFromCart }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [placed, setPlaced] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const { data: cities = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('*').eq('active', true).order('sort', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });
  const selectedCity = cities.find(c => c.name === city || c.ar === city) || null;
  const deliveryFee = Number(selectedCity?.fee || 0);

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const total = subtotal + deliveryFee;

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (cart.length === 0) throw new Error('Cart empty');
      if (!phone) throw new Error(lang==='ar' ? 'أدخل رقم الهاتف' : 'Enter phone number');
      const items = cart.map(it => ({ id: it.id, name: it.name, qty: it.qty, price: it.price, img: it.img }));
      const { data, error } = await supabase.from('orders').insert({
        customer_name: name || null,
        phone,
        city: city || (selectedCity ? selectedCity.name : null),
        address: address || null,
        total,
        delivery_fee: deliveryFee,
        items
      }).select('id').single();
      if (error) throw error;
      const orderId = data?.id;
      // Decrement stock best-effort
      await Promise.allSettled(cart.map(it => supabase.rpc('decrement_stock', { p_id: it.id, p_qty: it.qty })));
      return orderId;
    },
    onSuccess: () => {
      setPlaced(true);
      setTimeout(() => setPlaced(false), 2200);
    }
  });
  const placeOrder = () => placeOrderMutation.mutate();

  return (
    <View className="flex-1 bg-[#DFECCB] px-5 pt-10">
      {/* Header + lang */}
      <View className={`flex-row justify-between items-center mb-1 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
        <AnimatedPressable style={{}} onPress={onBack}>
          <Text className="text-2xl font-extrabold text-black">{t.back}</Text>
        </AnimatedPressable>
        <AnimatedPressable style={{}} onPress={() => setLang(lang === "en" ? "ar" : "en")}>
          <Text className="font-bold text-black text-base">{t.lang}</Text>
        </AnimatedPressable>
      </View>
      <Text className={`text-2xl font-extrabold text-black mb-2 text-center ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{t.header}</Text>
      {cart.length === 0 ? (
        <View className="flex-1 items-center justify-center mt-7">
          <Text className={`text-black/50 text-xl mb-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>{placed ? t.confirm : t.empty}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
          {/* Minimal checkout form */}
          <View className="bg-white/90 rounded-2xl px-3 py-3 mb-3">
            <Text className="font-bold text-black mb-2">{lang==='ar'? 'بيانات التوصيل' : 'Delivery Details'}</Text>
            <TextInput placeholder={lang==='ar'? 'الاسم (اختياري)':'Name (optional)'} value={name} onChangeText={setName} className="bg-gray-100 rounded-xl px-3 py-2 mb-2 text-black" />
            <TextInput placeholder={lang==='ar'? 'الهاتف':'Phone'} value={phone} onChangeText={setPhone} keyboardType="phone-pad" className="bg-gray-100 rounded-xl px-3 py-2 mb-2 text-black" />
            {cities.length > 0 ? (
              <View className="bg-gray-100 rounded-xl mb-2">
                <Picker
                  selectedValue={city || selectedCity?.name || ''}
                  onValueChange={(val) => setCity(val)}
                  style={{ color: 'black' }}
                >
                  <Picker.Item label={lang==='ar'? 'اختر المدينة' : 'Select city'} value="" />
                  {cities.map(c => (
                    <Picker.Item key={c.id} label={lang==='ar'? c.ar : c.name} value={c.name} />
                  ))}
                </Picker>
              </View>
            ) : (
              <TextInput placeholder={lang==='ar'? 'المدينة (اختياري)':'City (optional)'} value={city} onChangeText={setCity} className="bg-gray-100 rounded-xl px-3 py-2 mb-2 text-black" />
            )}
            <TextInput placeholder={lang==='ar'? 'العنوان (اختياري)':'Address (optional)'} value={address} onChangeText={setAddress} className="bg-gray-100 rounded-xl px-3 py-2 text-black" />
            {selectedCity && (
              <Text className="text-sm text-black mt-2">{lang==='ar'? `أجرة التوصيل: ${deliveryFee.toLocaleString()} د.ع (${selectedCity.time || ''})` : `Delivery fee: ${deliveryFee.toLocaleString()} IQD (${selectedCity.time || ''})`}</Text>
            )}
          </View>
          {cart.map((item) => (
            <View key={item.id} className={`flex-row items-center bg-white/95 rounded-2xl px-3 py-2 mb-3 shadow ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Image source={{ uri: item.img }} style={{ width: 54, height: 54, borderRadius: 14 }} className="mr-3" />
              <View className="flex-1">
                <Text className="font-bold text-base text-black mb-1">{item.name?.[lang] || item.name}</Text>
                <Text className="text-xs text-gray-500">{item.price?.toLocaleString?.() || item.price} IQD</Text>
              </View>
              <View className="flex-row items-center gap-x-2 mx-2">
                <AnimatedPressable style={{}} onPress={() => updateCartQty(item.id, -1)}>
                  <Text className="text-white text-lg">-</Text>
                </AnimatedPressable>
                <Text className="text-black font-bold text-base mx-1 min-w-[20px] text-center">{item.qty}</Text>
                <AnimatedPressable style={{}} onPress={() => updateCartQty(item.id, 1)}>
                  <Text className="text-black text-lg">+</Text>
                </AnimatedPressable>
              </View>
              <AnimatedPressable style={{ paddingHorizontal: 8 }} onPress={() => removeFromCart(item.id)}>
                <Text className="text-red-600 font-bold">{t.remove}</Text>
              </AnimatedPressable>
            </View>
          ))}
          <View className={`mt-3 mb-6 px-1`}>
            <View className={`flex-row items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Text className="font-bold text-base text-black">{lang==='ar'? 'المجموع الفرعي' : 'Subtotal'}</Text>
              <Text className="font-bold text-base text-black">{subtotal.toLocaleString()} IQD</Text>
            </View>
            <View className={`flex-row items-center justify-between mt-1 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Text className="font-semibold text-base text-black">{lang==='ar'? 'أجرة التوصيل' : 'Delivery fee'}</Text>
              <Text className="font-semibold text-base text-black">{deliveryFee.toLocaleString()} IQD</Text>
            </View>
            <View className={`flex-row items-center justify-between mt-2 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Text className="font-extrabold text-lg text-black">{t.total}</Text>
              <Text className="font-extrabold text-lg text-black">{total.toLocaleString()} IQD</Text>
            </View>
          </View>
          <AnimatedPressable style={{ marginHorizontal: 40, opacity: placeOrderMutation.isLoading?0.7:1 }} onPress={placeOrder}>
            {placeOrderMutation.isLoading ? (
              <View className="flex-row items-center justify-center py-1">
                <ActivityIndicator color="#fff" />
                <Text className="text-center text-white text-lg font-extrabold ml-2">{lang==='ar'? '...جارٍ التأكيد' : 'Placing...'}</Text>
              </View>
            ) : (
              <Text className="text-center text-white text-lg font-extrabold">{t.placeOrder}</Text>
            )}
          </AnimatedPressable>
        </ScrollView>
      )}
    </View>
  );
}