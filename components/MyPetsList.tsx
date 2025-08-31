import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import MyPetProfile from './MyPetProfile';
import MyPetForm from './MyPetForm';

export default function MyPetsList({ lang, onClose }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [adding, setAdding] = useState(false);

  // Fetch pets from Supabase
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('pets').select('*').order('created_at', { ascending: false });
      setPets(data || []);
      setLoading(false);
    };
    fetchPets();
  }, [refresh]);

  // Delete pet
  const handleDelete = async (pet) => {
    if (!pet) return;
    if (!confirm(lang==='ar'?'هل أنت متأكد من الحذف؟':'Are you sure to delete?')) return;
    await supabase.from('pets').delete().eq('id', pet.id);
    setSelectedPet(null);
    setEditingPet(null);
    setRefresh(r => !r);
  };

  if (adding) {
    return <MyPetForm lang={lang} onClose={()=>setAdding(false)} onSaved={()=>{setAdding(false);setRefresh(r=>!r);}} />;
  }
  if (editingPet) {
    return <MyPetForm lang={lang} onClose={()=>setEditingPet(null)} petToEdit={editingPet} onSaved={()=>{setEditingPet(null);setRefresh(r=>!r);}} />;
  }
  if (selectedPet) {
    return <MyPetProfile pet={selectedPet} lang={lang} onEdit={()=>setEditingPet(selectedPet)} onDelete={()=>handleDelete(selectedPet)} onClose={()=>setSelectedPet(null)} />;
  }

  return (
    <View className="flex-1 bg-[#DFECCB] px-1 pt-5 pb-14">
      <Text className="text-2xl font-extrabold text-black text-center mb-1">{lang==='ar'?'حيواناتي':'My Pets'}</Text>
      <TouchableOpacity onPress={()=>setAdding(true)} className="bg-[#C0DC17] mx-6 rounded-xl py-3 mb-4 mt-1">
        <Text className="text-center text-lg font-bold text-black">+ {lang==='ar'?'إضافة حيوان':'Add Pet'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} className="absolute right-4 top-4 bg-white/80 w-10 h-10 rounded-full items-center justify-center z-20">
        <Text className="text-2xl text-black">×</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{paddingBottom:28}}>
        {loading ? <ActivityIndicator size="large" color="#A3BA43" style={{marginTop:46}}/> : (
          pets.length === 0 ? (
            <Text className="text-center text-lg mt-14 text-[#AAAAAA]">{lang==='ar'?'لا يوجد ملفات حيوانات محفوظة':'No pets found'}</Text>
          ) : (
            pets.map(pet => (
              <TouchableOpacity key={pet.id} className="flex-row items-center bg-white/90 rounded-2xl px-4 py-4 mb-3 shadow" onPress={()=>setSelectedPet(pet)}>
                {pet.image_url ? <Image source={{ uri: pet.image_url }} style={{ width:58, height:58, borderRadius:30, marginRight:11 }} /> : null}
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-black mb-0.5">{pet.name}</Text>
                  <Text className="text-base text-[#6A8463]">{pet.type}</Text>
                </View>
                <Text className="text-[#C0DC17] text-xl">›</Text>
              </TouchableOpacity>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}