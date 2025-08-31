import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { supabase } from '../lib/supabase';

const STRINGS = {
  en: {
    coupons: "Coupons & Offers",
    add: "Add Coupon",
    edit: "Edit Coupon",
    code: "Code",
    discountType: "Discount Type",
    percent: "Percentage (%)",
    fixed: "Fixed Amount (IQD)",
    discount: "Discount",
    expire: "Expiry Date",
    limit: "Usage Limit",
    count: "Used",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    noCoupons: "No coupons yet.",
    enterCode: "Enter code",
    enterDiscount: "Enter discount value",
    enterExpire: "YYYY-MM-DD",
    enterLimit: "Max uses",
    expLabel: "Expires:",
    usage: (used, max) => `Used: ${used} / ${max}`,
    statusActive: "Active",
    statusExpired: "Expired",
    required: "Fill all fields!",
    saved: "Coupon saved!",
    deleted: "Coupon deleted!",
    loading: "Loading coupons...",
    typeLabel: "Type",
  },
  ar: {
    coupons: "الكوبونات والعروض",
    add: "إضافة كوبون",
    edit: "تعديل كوبون",
    code: "الكود",
    discountType: "نوع الخصم",
    percent: "نسبة مئوية (%)",
    fixed: "مبلغ ثابت (د.ع)",
    discount: "الخصم",
    expire: "تاريخ الانتهاء",
    limit: "عدد الاستخدامات",
    count: "مرات الاستخدام",
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    noCoupons: "لا توجد كوبونات بعد.",
    enterCode: "أدخل الكود",
    enterDiscount: "أدخل قيمة الخصم",
    enterExpire: "صيغة: YYYY-MM-DD",
    enterLimit: "عدد مرات الاستخدام",
    expLabel: "ينتهي:",
    usage: (used, max) => `تم الاستخدام: ${used} من ${max}`,
    statusActive: "فعال",
    statusExpired: "منتهي",
    required: "يرجى ملء جميع الحقول!",
    saved: "تم الحفظ!",
    deleted: "تم الحذف!",
    loading: "جاري تحميل الكوبونات...",
    typeLabel: "النوع",
  }
};

function isExpired(dateStr) {
  return new Date(dateStr) < new Date();
}

export default function AdminCouponsPanel({ onClose, lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null); // {type,text}
  const [editing, setEditing] = useState(null); // null | {fields}
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'

  // Fetch coupons from Supabase
  useEffect(() => {
    setLoading(true);
    supabase.from('coupons').select('*').order('expire_at').then(({ data }) => {
      setCoupons(data || []);
      setLoading(false);
    });
  }, [mode]);

  // Save (insert/update)
  const handleSave = async () => {
    if (!editing.code || !editing.discount_value || !editing.expire_at || !editing.usage_limit || !editing.discount_type)
      {setBanner({type:'error',text:t.required}); setTimeout(()=>setBanner(null),1400); return;}
    let ok = false, dbresp;
    if (mode==='add') {
      dbresp = await supabase.from('coupons').insert([
        {
          code: editing.code.trim(),
          discount_type: editing.discount_type,
          discount_value: Number(editing.discount_value),
          expire_at: editing.expire_at,
          usage_limit: Number(editing.usage_limit)
        }
      ])
      ok = !dbresp.error;
    }
    if (mode==='edit') {
      dbresp = await supabase.from('coupons').update({
        code: editing.code.trim(),
        discount_type: editing.discount_type,
        discount_value: Number(editing.discount_value),
        expire_at: editing.expire_at,
        usage_limit: Number(editing.usage_limit)
      }).eq('id', editing.id)
      ok = !dbresp.error;
    }
    if (ok) {
      setBanner({type:'success',text:t.saved});
      setEditing(null); setMode('list');
    } else {
      setBanner({type:'error',text: dbresp.error?.message || 'Failed!'});
    }
    setTimeout(()=>setBanner(null),1600);
  };
  // Delete
  const handleDelete = async (id) => {
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (!error) setBanner({type:'success',text:t.deleted});
    else setBanner({type:'error',text:error.message});
    setTimeout(()=>setBanner(null),1200);
    setCoupons(list=>list.filter(c=>c.id!==id));
  };
  // UI
  return (
    <SafeAreaView className="flex-1 bg-[#F4FAEE] w-full h-full" style={{direction:dir}}>
      <View className="flex-row justify-between items-center mb-1 px-2">
        <TouchableOpacity onPress={onClose} className="p-1 bg-white/90 rounded-full">
          <Text className="text-2xl font-bold text-black">×</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-2xl font-extrabold text-black text-center mr-5" numberOfLines={1}>{t.coupons}</Text>
      </View>
      {banner && (
        <View className={`px-2 py-1 rounded-lg mb-1 ${banner.type === 'success' ? 'bg-green-200' : 'bg-red-200'}`}>
          <Text className={`text-center font-bold ${banner.type === 'success' ? 'text-green-900' : 'text-red-700'}`}>{banner.text}</Text>
        </View>
      )}
      {mode==='list' && <>
      <TouchableOpacity className="bg-[#C0DC17] py-2 px-4 mb-3 rounded-xl mx-2 shadow self-center w-[97%]" onPress={()=>{setEditing({code:'',discount_type:'percent',discount_value:'',expire_at:'',usage_limit:''});setMode('add')}}>
        <Text className="text-[#36543C] font-bold text-base">+ {t.add}</Text>
      </TouchableOpacity>
      {loading? <Text className="text-center mt-8 text-black/50">{t.loading}</Text>:
      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:24, flexGrow: 1}} showsVerticalScrollIndicator>
        {coupons.length===0 ? (
          <Text className="text-center my-10 text-black/50">{t.noCoupons}</Text>
        ) : coupons.map(c=>(
          <View key={c.id} className="flex-row items-center bg-white rounded-xl mb-2 px-2 py-3 shadow w-full">
            <View className="flex-1 min-w-0">
              <Text className="font-bold text-lg text-black mb-0.5" numberOfLines={1}>{c.code}</Text>
              <Text className="text-[#85A36C] text-xs" numberOfLines={1}>{t.discountType}: {c.discount_type === 'fixed' ? t.fixed : t.percent}</Text>
              <Text className="text-xs text-gray-800" numberOfLines={1}>{t.discount}: {c.discount_value}{c.discount_type==='percent'?'%':' د.ع'}</Text>
              <Text className="text-xs text-gray-800" numberOfLines={1}>{t.expLabel} {c.expire_at}</Text>
              <Text className="text-xs text-gray-800" numberOfLines={1}>{t.usage(c.usage_count||0,c.usage_limit)}</Text>
              <Text className={`text-xs font-bold mt-0.5 ${isExpired(c.expire_at)?'text-red-500':'text-green-700'}`} numberOfLines={1}>{isExpired(c.expire_at)?t.statusExpired:t.statusActive}</Text>
            </View>
            <TouchableOpacity className="mx-2" onPress={()=>{setEditing(c);setMode('edit')}}>
              <Text className="text-xl">✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>handleDelete(c.id)}>
              <Text className="text-xl">🗑️</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>}
      </>}
      {mode!=='list' && (
        <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:14}} showsVerticalScrollIndicator>
        <View className="bg-white rounded-xl shadow px-2 py-4 mt-2 w-[98%] self-center">
          <Text className="text-lg font-bold text-[#36543C] text-center mb-1">{mode==='add'?t.add:t.edit}</Text>
          <Text className="font-semibold mb-0.5 text-[#36543C]">{t.code}</Text>
          <TextInput
            className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-2 border border-[#C0DC17] text-black"
            value={editing.code}
            onChangeText={v=>setEditing(e=>({...e,code:v}))}
            placeholder={t.enterCode}
            textAlign={dir==='rtl'?'right':'left'}
            autoCapitalize="characters"
          />
          <Text className="font-semibold mb-0.5 text-[#36543C]">{t.discountType}</Text>
          <View className={`flex-row mb-2 gap-x-2 ${dir==='rtl'?'flex-row-reverse':''}`}>
            <TouchableOpacity
              className={`px-2 py-1 rounded border ${editing.discount_type==='percent'?'bg-[#C0DC17] border-[#789E1B]':'bg-white border-gray-300'}`}
              onPress={()=>setEditing(e=>({...e,discount_type:'percent'}))}>
              <Text className="font-semibold text-black text-xs">{t.percent}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`px-2 py-1 rounded border ${editing.discount_type==='fixed'?'bg-[#C0DC17] border-[#789E1B]':'bg-white border-gray-300'}`}
              onPress={()=>setEditing(e=>({...e,discount_type:'fixed'}))}>
              <Text className="font-semibold text-black text-xs">{t.fixed}</Text>
            </TouchableOpacity>
          </View>
          <Text className="font-semibold mb-0.5 text-[#36543C]">{t.discount}</Text>
          <TextInput
            className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-2 border border-[#C0DC17] text-black"
            value={String(editing.discount_value)}
            onChangeText={v=>setEditing(e=>({...e,discount_value:Number(v.replace(/[^\d.]/g,"")||0)}))}
            keyboardType="numeric"
            placeholder={t.enterDiscount}
            textAlign={dir==='rtl'?'right':'left'}
          />
          <Text className="font-semibold mb-0.5 text-[#36543C]">{t.expire}</Text>
          <TextInput
            className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-2 border border-[#C0DC17] text-black"
            value={editing.expire_at}
            onChangeText={v=>setEditing(e=>({...e,expire_at:v}))}
            placeholder={t.enterExpire}
            textAlign={dir==='rtl'?'right':'left'}
          />
          <Text className="font-semibold mb-0.5 text-[#36543C]">{t.limit}</Text>
          <TextInput
            className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-3 border border-[#C0DC17] text-black"
            value={String(editing.usage_limit)}
            onChangeText={v=>setEditing(e=>({...e,usage_limit:Number(v.replace(/[^\d]/g,"")||0)}))}
            keyboardType="numeric"
            placeholder={t.enterLimit}
            textAlign={dir==='rtl'?'right':'left'}
          />
          <View className="flex-row justify-between mt-1">
            <TouchableOpacity className="bg-[#36543C] px-5 py-2 rounded-lg" onPress={handleSave}>
              <Text className="text-white font-bold text-base">{t.save}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 px-5 py-2 rounded-lg" onPress={()=>{setEditing(null);setMode('list');}}>
              <Text className="text-black font-bold text-base">{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}