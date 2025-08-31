import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, TextInput } from "react-native";
import { supabase } from '../lib/supabase';

const STRINGS = {
  en: {
    title: "Customer of the Week",
    topCust: "Top Customer",
    pickPet: "Select Pet",
    msg: "Message (EN)",
    msgAr: "Message (AR)",
    save: "Save",
    saved: "Customer of the Week updated!",
    choose: "Choose",
    none: "No pets found.",
    week: "Week",
    select: "Select..."
  },
  ar: {
    title: "عميل الأسبوع",
    topCust: "أفضل عميل",
    pickPet: "اختر الحيوان",
    msg: "رسالة (إنجليزي)",
    msgAr: "رسالة (عربي)",
    save: "حفظ",
    saved: "تم تحديث عميل الأسبوع!",
    choose: "اختر",
    none: "لا توجد حيوانات.",
    week: "الأسبوع",
    select: "اختر..."
  }
};
function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // ISO week
  const weekStart = new Date(now.setDate(diff));
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 6);
  return [weekStart.toISOString().slice(0,10), weekEnd.toISOString().slice(0,10)];
}
export default function AdminPetOfWeekPanel({ onClose, lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en;
  const dir = lang==='ar'?'rtl':'ltr';
  // State
  const [loading, setLoading] = useState(true);
  const [topCustomer, setTopCustomer] = useState(null);
  const [customerPets, setCustomerPets] = useState([]);
  const [pickedPet, setPickedPet] = useState(null);
  const [poMsg, setPoMsg] = useState({en:"", ar:""});
  const [success, setSuccess] = useState(null);
  const [week, setWeek] = useState(getWeekRange());
  // On mount, detect top customer, fetch pets
  useEffect(()=>{
    (async()=>{
      // Get orders in week
      const [{ data: orders } ] = await Promise.all([
        supabase.from('orders').select('user_id,created_at').gte('created_at', week[0]).lte('created_at', week[1])
      ]);
      if(!orders||!orders.length) { setLoading(false); return; }
      const freq = {};
      orders.forEach(o=>{ freq[o.user_id]=(freq[o.user_id]||0)+1 });
      const best = Object.entries(freq).sort((a,b)=>b[1]-a[1])[0];
      if(!best) { setLoading(false); return; }
      const [user_id] = best;
      // Get customer info and pets
      const [{ data: customer }] = await Promise.all([
        supabase.from('users_meta').select('full_name,phone').eq('user_id',user_id)
      ]);
      setTopCustomer({ ...customer?.[0], user_id });
      const { data:pets } = await supabase.from('pets').select('id,name,image_url').eq('user_id',user_id);
      setCustomerPets(pets||[]);
      setLoading(false);
    })();
  },[week[0]]);
  // Handle save
  const savePet = async()=>{
    if (!pickedPet) return;
    const up = { pet_id:pickedPet.id, week_start:week[0], week_end:week[1], message_en:poMsg.en, message_ar:poMsg.ar };
    await supabase.from('pet_of_the_week').upsert([up],{onConflict:['week_start','week_end']});
    setSuccess(t.saved);
    setTimeout(()=>setSuccess(null),1200);
  };
  return (
    <SafeAreaView className="flex-1 w-full h-full bg-[#F4FAEE]" style={{direction:dir}}>
      <View className="flex-row justify-between items-center mb-1 px-2 mt-1">
        <TouchableOpacity onPress={onClose} className="p-1 bg-white/90 rounded-full"><Text className="text-2xl font-bold text-black">×</Text></TouchableOpacity>
        <Text className="flex-1 text-2xl font-extrabold text-black text-center mr-5" numberOfLines={1}>{t.title}</Text>
      </View>
      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:28}}>
        <View className="bg-white rounded-xl shadow px-2 py-3 mb-3 w-[98%] self-center">
          <Text className="font-bold text-base mb-1 text-[#36543C]">{t.week}: {week[0]} ~ {week[1]}</Text>
          {loading ? <Text className="text-base font-semibold text-gray-600 mb-2 mt-6 text-center">Loading...</Text> :
            (topCustomer ? <View>
              <Text className="text-base font-semibold text-gray-700 mb-1">{t.topCust}: {topCustomer.full_name || topCustomer.phone}</Text>
              <Text className="text-xs text-gray-500 mb-1">{topCustomer.phone || topCustomer.user_id}</Text>
              <Text className="text-base mb-2 text-[#36543C] mt-2">{t.pickPet}</Text>
              {customerPets.length===0 ? <Text className="text-center text-gray-400 mb-2">{t.none}</Text> :
                customerPets.map(pet => (
                  <TouchableOpacity key={pet.id} onPress={()=>setPickedPet(pet)} className={`flex-row items-center p-2 mb-1 rounded ${pickedPet?.id===pet.id?'bg-[#C0DC17]/40 border border-[#C0DC17]':'bg-[#F6F7F2]'}`}>
                    {pet.image_url && <Image source={{ uri: pet.image_url }} style={{ width:44, height:44, borderRadius:28, marginRight:8 }}/>} 
                    <Text className="font-bold text-black">{pet.name}</Text>
                  </TouchableOpacity>
                ))}
              {/* Remove selection button */}
              {pickedPet && (
                <TouchableOpacity onPress={()=>setPickedPet(null)} className="mt-1 mb-1"><Text className="text-xs text-red-700">{t.choose}: {pickedPet.name} ❌</Text></TouchableOpacity>
              )}
              <Text className="font-bold text-xs mt-3 mb-1 text-[#36543C]">{t.msg}</Text>
              <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-2 border border-[#C0DC17] text-black" value={poMsg.en} onChangeText={v=>setPoMsg(m=>({...m,en:v}))} placeholder={t.msg} textAlign={dir==='rtl'?'right':'left'} />
              <Text className="font-bold text-xs mb-1 text-[#36543C]">{t.msgAr}</Text>
              <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-2 border border-[#C0DC17] text-black" value={poMsg.ar} onChangeText={v=>setPoMsg(m=>({...m,ar:v}))} placeholder={t.msgAr} textAlign={dir==='rtl'?'right':'left'} />
              <TouchableOpacity className="bg-[#C0DC17] px-4 py-2 rounded mt-2 mb-2 self-center" onPress={savePet}>
                <Text className="font-bold text-[#36543C] text-base">{t.save}</Text>
              </TouchableOpacity>
              {success && <Text className="text-center text-xs text-green-700 my-1">{success}</Text>}
            </View> : <Text className="text-center text-gray-700">No customer or pets this week.</Text> )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}