import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Heart } from 'lucide-react-native';
import { supabase } from '../lib/supabase';

const STRINGS = {
  en: {
    title: "Customer of the Week",
    notSet: "No customer chosen yet.",
    type: t=>({Cat:'Cat',Dog:'Dog',Bird:'Bird',Fish:'Fish',Turtle:'Turtle',Hamster:'Hamster',Rabbit:'Rabbit'})[t]||t,
  },
  ar: {
    title: "عميل الأسبوع",
    notSet: "لا يوجد عميل مختار",
    type: t=>({Cat:'قط',Dog:'كلب',Bird:'طائر',Fish:'سمكة',Turtle:'سلحفاة',Hamster:'هامستر',Rabbit:'أرنب'})[t]||t,
  }
};
export default function PetOfWeekHomeSection({ lang = 'en' }) {
  const t = STRINGS[lang]||STRINGS.en;
  const [potw, setPotw] = useState(null); // {pet:{},msg}
  useEffect(()=>{
    (async()=>{
      const { data } = await supabase
        .from('pet_of_the_week')
        .select('*,pet:pets(id,name,type,age,image_url,description)')
        .order('week_start',{ascending:false}).limit(1);
      if (!data||!data[0]) return;
      setPotw({
        name: data[0].pet?.name,
        type: data[0].pet?.type,
        age: data[0].pet?.age,
        image: data[0].pet?.image_url,
        desc: data[0][lang==='ar'?'message_ar':'message_en'] || data[0].pet?.description || '',
      });
    })();
  },[lang]);
  if (!potw)
    return (
      <View className="my-4 mx-2 p-4 rounded-2xl bg-blue-50/80 items-center">
        <View className="flex-row items-center mb-2">
          <Text style={{ fontSize: 24 }}>🏆</Text>
          <Text className="text-xl font-extrabold ml-2 text-[#337]">{t.title}</Text>
        </View>
        <Text className="text-base text-gray-400 mt-2">{t.notSet}</Text>
      </View>
    );
  return (
    <View className="my-4 mx-2 p-4 rounded-2xl bg-[#EAFEFB] flex-row items-center shadow-lg">
      <View className="mr-4">
        {potw.image ? (
          <Image source={{ uri: potw.image }} style={{ width: 90, height: 90, borderRadius: 60, borderWidth: 3, borderColor: '#C0DC17', backgroundColor:'#fff' }} />
        ) : (
          <View className="w-[90px] h-[90px] rounded-full bg-white items-center justify-center border-2 border-[#94d8e7]">
            <Heart color="#FF3557" size={38} />
          </View>
        )}
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center mb-1">
          <Text style={{ fontSize: 18 }}>🏆</Text>
          <Text className="ml-2 font-semibold text-[20px] text-[#226a58]" numberOfLines={1}>{potw.name}</Text>
        </View>
        <Text className="text-[#4E9C83] font-medium text-base mb-1" numberOfLines={1}>{t.type(potw.type)}{potw.age?` · ${potw.age}`:''}</Text>
        {!!potw.desc && (
          <Text className="text-base text-[#456]" numberOfLines={3}>{potw.desc}</Text>
        )}
      </View>
    </View>
  );
}