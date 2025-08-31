import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { supabase } from '../lib/supabase';

const STRINGS = {
  en: {
    settings: "App Settings",
    close: "Close",
    appName: "App Name",
    appNameAr: "اسم التطبيق (بالعربية)",
    logo: "Logo URL",
    contact: "Contact Info",
    phone: "Phone",
    whatsapp: "WhatsApp",
    social: "Social Media Links",
    save: "Save",
    saved: "Saved!",
    adminRoles: "Admin Roles",
    addAdmin: "Add Admin",
    phoneReq: "Phone required!",
    passReq: "Password required!",
    admins: "Admins",
    username: "Phone/Username",
    password: "Password",
    role: "Role",
    remove: "Remove",
    none: "No admins yet.",
  },
  ar: {
    settings: "إعدادات التطبيق",
    close: "إغلاق",
    appName: "اسم التطبيق (بالانكليزية)",
    appNameAr: "اسم التطبيق (بالعربية)",
    logo: "رابط الشعار",
    contact: "معلومات التواصل",
    phone: "هاتف",
    whatsapp: "واتساب",
    social: "روابط السوشيال ميديا",
    save: "حفظ",
    saved: "تم الحفظ!",
    adminRoles: "صلاحيات الإدارة",
    addAdmin: "إضافة مسؤول",
    phoneReq: "الهاتف مطلوب!",
    passReq: "كلمة المرور مطلوبة!",
    admins: "المسؤولون",
    username: "الهاتف/المستخدم",
    password: "كلمة المرور",
    role: "الدور",
    remove: "حذف",
    none: "لا يوجد مسؤوليين بعد.",
  }
};

export default function AdminSettingsPanel({ onClose, lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en;
  const dir = lang==='ar'?'rtl':'ltr';
  // SETTINGS STATE
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    (async()=>{
      const { data } = await supabase.from('settings').select('*').single();
      setSettings(data||{app_name:"",app_name_ar:"",logo_url:"",phone:"",whatsapp:"",social:""});
    })();
  }, []);
  // SAVE SETTINGS
  const saveSettings = async () => {
    setSaving(true);
    let up = { ...settings };
    let { error } = settings.id
      ? await supabase.from('settings').update(up).eq('id', settings.id)
      : await supabase.from('settings').insert([up]);
    setSaving(false);
    if (!error) Alert.alert(t.saved);
  };
  // ADMINS SECTION
  const [admins, setAdmins] = useState([]);
  const [newAdmin, setNewAdmin] = useState({ phone: '', password: '', role: 'admin' });
  const [adminMsg, setAdminMsg] = useState(null);
  useEffect(() => {
    supabase.from('admins').select('*').then(({data})=>setAdmins(data||[]));
  }, []);
  const addAdmin = async () => {
    if (!newAdmin.phone || !newAdmin.phone.trim()) return setAdminMsg(t.phoneReq);
    if (!newAdmin.password) return setAdminMsg(t.passReq);
    setAdminMsg(null);
    let { error } = await supabase.from('admins').insert([{
      phone: newAdmin.phone.trim(),
      password: newAdmin.password, // store hashed in prod!
      role: newAdmin.role
    }]);
    if (!error) {
      setNewAdmin({ phone: '', password: '', role: 'admin' });
      const { data } = await supabase.from('admins').select('*');
      setAdmins(data||[]);
      setAdminMsg(t.saved);
      setTimeout(()=>setAdminMsg(null),1400);
    } else {
      setAdminMsg(error.message);
    }
  };
  const removeAdmin = async (id) => {
    await supabase.from('admins').delete().eq('id',id);
    const { data } = await supabase.from('admins').select('*');
    setAdmins(data||[]);
  };
  // UI
  return (
    <SafeAreaView className="flex-1 w-full h-full bg-[#F4FAEE]" style={{direction:dir}}>
      <View className="flex-row justify-between items-center mb-1 px-2 mt-1">
        <TouchableOpacity onPress={onClose} className="p-1 bg-white/90 rounded-full"><Text className="text-2xl font-bold text-black">×</Text></TouchableOpacity>
        <Text className="flex-1 text-2xl font-extrabold text-black text-center mr-5" numberOfLines={1}>{t.settings}</Text>
      </View>
      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:28}} showsVerticalScrollIndicator>
        {/* BASIC SETTINGS */}
        <View className="bg-white rounded-xl shadow px-2 py-3 mb-4 w-[98%] self-center">
          <Text className="font-bold text-base mb-2 text-[#36543C]">{t.appName}</Text>
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-2 border border-[#C0DC17] text-black" value={settings?.app_name} onChangeText={v=>setSettings(s=>({...s,app_name:v}))} placeholder={t.appName} textAlign={dir==='rtl'?'right':'left'} />
          <Text className="font-bold text-base mb-1 text-[#36543C]">{t.appNameAr}</Text>
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-2 border border-[#C0DC17] text-black" value={settings?.app_name_ar} onChangeText={v=>setSettings(s=>({...s,app_name_ar:v}))} placeholder={t.appNameAr} textAlign={dir==='rtl'?'right':'left'} />
          <Text className="font-bold text-base mb-1 text-[#36543C]">{t.logo}</Text>
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-2 border border-[#C0DC17] text-black" value={settings?.logo_url} onChangeText={v=>setSettings(s=>({...s,logo_url:v}))} placeholder={t.logo} textAlign={dir==='rtl'?'right':'left'} />
          {settings?.logo_url ? <Image source={{ uri: settings.logo_url }} style={{width:70, height:70, borderRadius:16, alignSelf:'center', marginBottom:7 }}/>:null}
          <Text className="font-bold text-base mb-1 text-[#36543C]">{t.contact}</Text>
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-1 border border-[#C0DC17] text-black" value={settings?.phone} onChangeText={v=>setSettings(s=>({...s,phone:v}))} placeholder={t.phone} textAlign={dir==='rtl'?'right':'left'} />
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-1 border border-[#C0DC17] text-black" value={settings?.whatsapp} onChangeText={v=>setSettings(s=>({...s,whatsapp:v}))} placeholder={t.whatsapp} textAlign={dir==='rtl'?'right':'left'} />
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 border border-[#C0DC17] text-black" value={settings?.social} onChangeText={v=>setSettings(s=>({...s,social:v}))} placeholder={t.social} textAlign={dir==='rtl'?'right':'left'} />
          <TouchableOpacity className="bg-[#36543C] px-5 py-2 my-3 rounded-lg" onPress={saveSettings} disabled={saving}>
            <Text className="text-white font-bold text-base text-center">{saving?t.saved:t.save}</Text>
          </TouchableOpacity>
        </View>
        {/* ADMINS SECTION */}
        <View className="bg-white rounded-xl shadow px-2 py-3 mb-1 w-[98%] self-center">
          <Text className="font-bold text-base mb-2 text-[#36543C]">{t.adminRoles}</Text>
          {admins.length===0 ? <Text className="text-center mb-2 text-gray-500">{t.none}</Text> :
            admins.map(admin => (
              <View key={admin.id} className="flex-row items-center justify-between bg-[#F9FBE5] rounded mb-1 px-2 py-1">
                <Text className="font-semibold flex-1" numberOfLines={1}>{admin.phone}</Text>
                <Text className="mx-1 text-xs text-gray-600">{admin.role || "-"}</Text>
                <TouchableOpacity onPress={()=>removeAdmin(admin.id)}><Text className="text-red-600 font-bold">{t.remove}</Text></TouchableOpacity>
              </View>
            ))}
          {/* New Admin */}
          <Text className="font-bold text-xs mt-2 mb-1 text-[#36543C]">{t.addAdmin}</Text>
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-1 border border-[#C0DC17] text-black" value={newAdmin.phone} onChangeText={v=>setNewAdmin(a=>({...a,phone:v}))} placeholder={t.phone} textAlign={dir==='rtl'?'right':'left'} />
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-1 border border-[#C0DC17] text-black" value={newAdmin.password} onChangeText={v=>setNewAdmin(a=>({...a,password:v}))} placeholder={t.password} textAlign={dir==='rtl'?'right':'left'} secureTextEntry={true} />
          <TouchableOpacity className="bg-[#C0DC17] px-4 py-2 rounded mt-1 mb-2 self-center" onPress={addAdmin}>
            <Text className="font-bold text-[#36543C] text-base">{t.addAdmin}</Text>
          </TouchableOpacity>
          {adminMsg ? <Text className="text-center text-xs text-red-600 my-1">{adminMsg}</Text> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
