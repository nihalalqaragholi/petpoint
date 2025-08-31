import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, TextInput } from 'react-native';
import { X, UploadCloud } from 'lucide-react-native';
import { supabase } from "../lib/supabase";
import MyPetProfile from "./MyPetProfile";
import { pickAndUploadImage } from './usePickAndUploadImage';

const fields = [
  { key: 'customer_phone', en: 'Mobile Number', ar: 'رقم الهاتف' },
  { key: 'image', type: 'image', en: 'Photo', ar: 'صورة' },
  { key: 'name', en: 'Name', ar: 'الاسم' },
  { key: 'type', en: 'Type', ar: 'النوع', options: ['Cat','Dog','Bird','Fish','Turtle','Hamster','Rabbit'] },
  { key: 'gender', en: 'Gender', ar: 'الجنس', options: ['Male','Female'] },
  { key: 'age', en: 'Age', ar: 'العمر' },
  { key: 'color', en: 'Color', ar: 'اللون' },
  { key: 'breed', en: 'Breed', ar: 'السلالة' },
  { key: 'weight', en: 'Weight (Kg)', ar: 'الوزن (كغ)' },
  { key: 'health', en: 'Health Status', ar: 'الصحة' },
  { key: 'personality', en: 'Personality', ar: 'الطبع', options:['Playful','Shy','Friendly','Calm','Protective','Curious'] },
];

const initialPet = {
  customer_phone: '',
  name: '', type: '', gender:'', age: '', color: '', breed: '', weight: '', health: '', personality: '', image: null
};

const MyPetForm = ({ lang, onClose, onSaved, petToEdit }) => {
  const [pet, setPet] = useState(petToEdit ? { ...initialPet, ...petToEdit, image: petToEdit.photo_url || petToEdit.image } : { ...initialPet });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [savedPet, setSavedPet] = useState(null);

  useEffect(() => {
    if (petToEdit) {
      setPet({ ...initialPet, ...petToEdit, image: petToEdit.photo_url || petToEdit.image });
    }
  }, [petToEdit]);

  // Pick image from gallery & upload to Supabase
  const pickImage = async () => {
    setUploading(true);
    try {
      const url = await pickAndUploadImage();
      if (url) {
        setPet(p => ({ ...p, image: url }));
      }
    } catch (err) {
      let msg = 'Image error: ';
      if (err instanceof Error) msg += err.message;
      else if (typeof err === 'object') msg += JSON.stringify(err);
      else msg += String(err);
      alert(msg);
    }
    setUploading(false);
  };

  const handleSave = async () => {
    console.log('[PetSave] Start', petToEdit?.id ? 'update' : 'insert');
    setSaving(true);
    if (!supabase) {
      alert('Supabase client not loaded');
      setSaving(false);
      return;
    }
    // Basic validation
    if (!(pet.customer_phone && pet.customer_phone.trim().length > 0)) {
      alert(lang==='ar' ? 'فضلًا أدخل رقم الهاتف' : 'Please enter a mobile number.');
      setSaving(false);
      return;
    }
    if (!(pet.name && pet.type)) {
      alert(lang==='ar' ? 'فضلًا املأ الاسم والنوع.' : 'Please enter pet name and type.');
      setSaving(false);
      return;
    }
    const toSave = {
      customer_phone: pet.customer_phone,
      name: pet.name,
      type: pet.type,
      breed: pet.breed || null,
      age_years: pet.age ? parseInt(pet.age) : null,
      gender: pet.gender || null,
      weight_kg: pet.weight ? parseFloat(pet.weight) : null,
      color: pet.color || null,
      photo_url: pet.image || null,
      medical_notes: pet.health || null,
      personality_traits: pet.personality ? [String(pet.personality)] : null
    };
    let supaResult;
    try {
      if (petToEdit && petToEdit.id) {
        supaResult = await supabase.from('pets').update(toSave).eq('id', petToEdit.id).select('*').single();
      } else {
        supaResult = await supabase.from('pets').insert([toSave]).select('*').single();
      }
      if (!supaResult || ((!supaResult.data) && (!supaResult.error))) {
        console.log('[PetSave] Unexpected empty response');
        alert(lang==='ar' ? 'خطأ غير متوقع أثناء الحفظ' : 'Unexpected error while saving');
      } else if (supaResult.error) {
        console.log('[PetSave] Supabase error', supaResult.error);
        const msg = supaResult.error.message || JSON.stringify(supaResult.error);
        const isAuth = (supaResult.error as any)?.code === '42501' || /permission|rls|auth|denied|not authorized/i.test(msg);
        alert((lang==='ar' ? 'فشل الحفظ: ' : 'Save failed: ') + msg + (isAuth ? (lang==='ar' ? '\n(تأكد من تسجيل الدخول وصلاحيات الجدول pets)' : '\n(Ensure you are logged in and pets table policies allow insert)') : ''));
      } else if (supaResult.data) {
        console.log('[PetSave] Success id', supaResult.data.id);
        alert(lang==='ar' ? 'تم الحفظ بنجاح' : 'Saved successfully!');
      }
    } catch(e) {
      let msg = 'Insert exception: ';
      if (e instanceof Error) msg += e.message;
      else if (typeof e === 'object') msg += JSON.stringify(e);
      else msg += String(e);
      console.log('[PetSave] Exception', msg);
      alert(msg);
      setSaving(false);
      return;
    }
    setSaving(false);
    if (supaResult && supaResult.data) {
      setSavedPet(supaResult.data);
      setShowProfile(true);
      if (onSaved) onSaved(supaResult.data);
      return;
    }
    // Any last fallback error (should not get here)
    alert((lang==='ar'? 'فشل الحفظ: ' : 'Save failed: ') + 'Unknown reason (no error, no data)');
  };

  if (showProfile && savedPet) {
    return <MyPetProfile pet={savedPet} lang={lang} onEdit={()=>setShowProfile(false)} onDelete={()=>{}} onClose={onClose} />;
  }
  return (
    <View className="flex-1 bg-[#DFECCB] ">
      <View className="flex-row justify-between items-center px-6 pt-6 pb-2">
        <Text className="text-2xl font-bold text-black">
          {lang === 'ar' ? 'بيانات حيواني الأليف' : 'My Pet Info'}
        </Text>
        <TouchableOpacity onPress={onClose} className="p-1">
          <X size={26} color="#666" />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{padding:18,paddingBottom:35}}>
        {/* Mobile field first */}
        <View className="mb-4">
          <Text className="mb-1 font-semibold text-[#36543C]">{fields[0][lang]}</Text>
          <TextInput
            value={pet.customer_phone}
            onChangeText={v => setPet(p => ({ ...p, customer_phone: v }))}
            className="bg-white rounded-2xl p-3 text-base"
            placeholder={lang==='ar'?"مثال: +9647XXXXXXXXX":"e.g. +9647XXXXXXXXX"}
            keyboardType="phone-pad"
          />
        </View>
        {/* Image */}
        <View className="mb-6 items-center">
          {pet.image ? (
            <TouchableOpacity onPress={pickImage} className="mb-1">
              <Image source={{ uri: pet.image }} style={{ width:88, height:88, borderRadius:50, marginBottom:4, opacity:uploading?0.6:1 }} />
              {uploading ? <Text className="text-xs text-[#888] mt-[-16px]">Uploading…</Text> : null}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={pickImage} className="bg-white p-4 rounded-full mb-2 border border-[#CEDCAB]">
              <UploadCloud size={34} color="#BFC6A6" />
              {uploading ? <Text className="text-xs text-[#888] mt-1">Uploading…</Text> : null}
            </TouchableOpacity>
          )}
          <Text className="text-[#888] -mt-1 mb-2 text-xs">{fields[1][lang]}</Text>
        </View>
        {/* Other fields */}
        {fields.slice(2).map(f => (
          <View className="mb-4" key={f.key}>
            <Text className="mb-1 font-semibold text-[#36543C]">{f[lang]}</Text>
            {f.options ? (
              <View className="flex-row flex-wrap justify-between">
                {f.options.map((opt, idx) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setPet(p => ({ ...p, [f.key]: opt }))}
                    className={`px-3 py-1 bg-white rounded-xl border mb-2 mt-1 w-[48%] ${pet[f.key]===opt ? 'border-[#FF7300]' : 'border-[#CEDCAB]'}` }
                    style={{marginRight: (idx % 2 === 0) ? 6 : 0}}
                  >
                    <Text className={pet[f.key]===opt ? 'text-[#FF7300] font-semibold' : 'text-[#888]'}>
                      {
                        lang === 'ar'
                          ? (opt === 'Male'
                              ? 'ذكر'
                              : opt === 'Female'
                                  ? 'أنثى'
                                  : ({
                                      Cat:'قط',Dog:'كلب',Bird:'طائر',Fish:'سمكة',Turtle:'سلحفاة',Hamster:'هامستر',Rabbit:'أرنب',
                                      Playful:'لعوب',Shy:'خجول',Friendly:'ودود',Calm:'هادئ',Protective:'حامٍ',Curious:'فضولي',
                                    }[opt] || opt)
                            )
                          : opt
                      }
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                value={pet[f.key]}
                onChangeText={v=>setPet(p=>({...p, [f.key]:v}))}
                className="bg-white rounded-2xl p-3 text-base"
                placeholder={f[lang]}
                {...(f.key === 'notes' ? {multiline: true, minHeight: 48} : {})}
              />
            )}
          </View>
        ))}
        <TouchableOpacity className="bg-[#FF7300] rounded-xl py-3 mt-1 mb-8" onPress={handleSave} disabled={saving}>
          <Text className="text-center text-lg font-bold text-white">{saving ? (lang==='ar' ? 'جارٍ الحفظ...' : 'Saving...') : (lang==='ar'?'حفظ البيانات':'Save Pet Info')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default MyPetForm;