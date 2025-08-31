import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';

export default function MyPetProfile({ pet, lang, onEdit, onDelete, onClose }) {
  if (!pet) return null;
  const label = (en, ar) => lang === 'ar' ? ar : en;
  return (
    <ScrollView className="flex-1 bg-[#DFECCB]">
      <View className="items-center pt-8">
        {pet.image_url ? (
          <Image source={{ uri: pet.image_url }} style={{ width: 110, height: 110, borderRadius: 55, marginBottom: 9 }} />
        ) : null}
        <Text className="text-2xl font-bold text-black mb-1">{pet.name}</Text>
        <Text className="text-[#6A8463] text-base mb-4">{pet.type}</Text>
      </View>
      <View className="mx-6 bg-white/90 rounded-2xl px-5 py-6 shadow mb-5">
        {[['gender','الجنس'],['age','العمر'],['color','اللون'],['breed','السلالة'],['weight','الوزن'],['last_vacc','آخر لقاح'],['health','الصحة'],['personality','الطبع'],['notes','ملاحظات']].map(([k,a])=>
          pet[k] ? (
            <View key={k} className="mb-2">
              <Text className="font-semibold text-[#36543C] mb-1">{label(k.charAt(0).toUpperCase()+k.slice(1), a)}</Text>
              <Text className="text-black text-base">{pet[k]}</Text>
            </View>
          ) : null
        )}
      </View>
      <View className="flex-row justify-between mx-8 mb-8 mt-1">
        <TouchableOpacity className="bg-[#FF7300] px-7 py-3 rounded-xl" onPress={onEdit}><Text className="text-white font-bold text-base">{label('Edit', 'تعديل')}</Text></TouchableOpacity>
        <TouchableOpacity className="bg-red-500 px-7 py-3 rounded-xl" onPress={onDelete}><Text className="text-white font-bold text-base">{label('Delete', 'حذف')}</Text></TouchableOpacity>
      </View>
      {onClose && <TouchableOpacity className="mx-8 mt-1 mb-7 p-2 rounded-xl bg-[#EFF5E2]" onPress={onClose}><Text className="text-[#36543C] font-bold text-lg text-center">{label('Back', 'رجوع')}</Text></TouchableOpacity>}
    </ScrollView>
  );
}
