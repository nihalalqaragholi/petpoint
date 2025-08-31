import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { supabase } from '../lib/supabase';

const STRINGS = {
  en: {
    flashSale: "Flash Sale",
    add: "Add Flash Sale",
    product: "Select Product",
    discount: "Discount (%)",
    start: "Start Time",
    end: "End Time",
    save: "Save",
    noSales: "No flash sales active.",
    active: "Active",
    expired: "Expired",
    soon: "Upcoming",
    timer: "Ends in",
    remove: "Remove",
    select: "Select...",
    almost: "Almost Sold Out",
    soldout: "Sold Out",
  },
  ar: {
    flashSale: "عرض خاطف",
    add: "إضافة عرض",
    product: "اختر المنتج",
    discount: "نسبة الخصم (%)",
    start: "وقت البدء",
    end: "وقت الانتهاء",
    save: "حفظ",
    noSales: "لا توجد عروض نشطة.",
    active: "نشط",
    expired: "منتهي",
    soon: "قادم",
    timer: "ينتهي خلال",
    remove: "حذف",
    select: "اختر...",
    almost: "يشارف على النفاد",
    soldout: "انتهى المخزون",
  }
};
function formatTimer(ms, lang) {
  if (ms < 0) return lang==="ar"?"انتهى":"Ended";
  let t = Math.floor(ms / 1000);
  const h = Math.floor(t/3600).toString().padStart(2,'0');
  const m = Math.floor((t%3600)/60).toString().padStart(2,'0');
  const s = (t%60).toString().padStart(2,'0');
  return `${h}:${m}:${s}`;
}
export default function AdminFlashSalesPanel({ onClose, lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en;
  const dir = lang==='ar'?'rtl':'ltr';
  // State
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ product_id: '', discount_percent: '', start_at: '', end_at: '' });
  const [msg, setMsg] = useState(null);
  // Load products and sales
  useEffect(() => {
    supabase.from('products').select('id,name,price,stock').then(({data})=>setProducts(data||[]));
    supabase.from('flash_sales').select('*').then(({data})=>setRows(data||[]));
  }, []);
  // Timer refresh for live countdown
  const [, rerender] = useState(0);
  useEffect(()=>{
    const tic = setInterval(()=>rerender(v=>v+1),1000);
    return ()=>clearInterval(tic);
  },[]);
  // Save flash sale
  const handleSave = async()=>{
    if (!form.product_id || !form.discount_percent || !form.start_at || !form.end_at) {setMsg('Fill all!');return;}
    let res = await supabase.from('flash_sales').insert([{...form, discount_percent:Number(form.discount_percent)}]);
    if (!res.error) {
      setForm({ product_id: '', discount_percent: '', start_at: '', end_at: '' });
      let { data } = await supabase.from('flash_sales').select('*');
      setRows(data||[]); setMsg(t.save);
    } else setMsg(res.error.message);
    setTimeout(()=>setMsg(null),1400);
  };
  // Remove flash
  const remove = async(id)=>{
    await supabase.from('flash_sales').delete().eq('id',id);
    let { data } = await supabase.from('flash_sales').select('*');
    setRows(data||[]);
  };
  // Remove expired sales from DB automatically
  useEffect(()=>{
    const now = new Date();
    rows.forEach(sale=>{
      if (new Date(sale.end_at)<now) remove(sale.id);
    });
    // eslint-disable-next-line
  }, [rows.length]);
  return (
    <SafeAreaView className="flex-1 w-full h-full bg-[#F4FAEE]" style={{direction:dir}}>
      <View className="flex-row justify-between items-center mb-1 px-2 mt-1">
        <TouchableOpacity onPress={onClose} className="p-1 bg-white/90 rounded-full"><Text className="text-2xl font-bold text-black">×</Text></TouchableOpacity>
        <Text className="flex-1 text-2xl font-extrabold text-black text-center mr-5" numberOfLines={1}>{t.flashSale}</Text>
      </View>
      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:24}}>
        <View className="bg-white rounded-xl shadow px-2 py-3 mb-3 w-[98%] self-center">
          <Text className="font-bold text-base mb-1 text-[#36543C]">{t.add}</Text>
          {/* Product picker */}
          <View className="mb-1">
            <Text className="text-sm mb-0.5">{t.product}</Text>
            <View className="bg-[#F7FEEB] rounded-md border border-[#C0DC17] px-2 py-1">
              <TextInput
                value={form.product_id}
                onChangeText={v=>setForm(f=>({...f,product_id:v}))}
                placeholder={t.select}
                keyboardType="numeric"
              />
            </View>
            {/* Show product suggestions below input */}
            {form.product_id && products.filter(p=>String(p.id).startsWith(form.product_id)).length>0 &&
              <View className="bg-[#FCFCFC] rounded px-1 py-1 shadow border border-[#C0DC17] max-h-24">
                {products.filter(p=>String(p.id).startsWith(form.product_id)).slice(0,3).map(p=>
                  <TouchableOpacity key={p.id} onPress={()=>setForm(f=>({...f,product_id:p.id+''}))} className="py-1">
                    <Text className="text-[#36543C] ">{p.name?.[lang]||p.name?.en||p.name}</Text>
                  </TouchableOpacity>
                )}
              </View>}
          </View>
          {/* Discount */}
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-1 border border-[#C0DC17] text-black" value={form.discount_percent} onChangeText={v=>setForm(f=>({...f,discount_percent:v.replace(/[^\d.]/g,"")}))} keyboardType="numeric" placeholder={t.discount} />
          {/* Start time */}
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-1 border border-[#C0DC17] text-black" value={form.start_at} onChangeText={v=>setForm(f=>({...f,start_at:v}))} placeholder={t.start+': YYYY-MM-DD HH:MM'} />
          {/* End time */}
          <TextInput className="bg-[#F7FEEB] rounded-md px-2 py-1 mb-1 border border-[#C0DC17] text-black" value={form.end_at} onChangeText={v=>setForm(f=>({...f,end_at:v}))} placeholder={t.end+': YYYY-MM-DD HH:MM'} />
          <TouchableOpacity className="bg-[#C0DC17] px-4 py-2 rounded mt-2 mb-2 self-center" onPress={handleSave}>
            <Text className="font-bold text-[#36543C] text-base">{t.save}</Text>
          </TouchableOpacity>
          {msg && <Text className="text-center text-xs text-red-600 my-1">{msg}</Text>}
        </View>
        {/* Active/History list */}
        {rows.filter(row=>row.start_at && row.product_id).length===0 ? <Text className="text-center mt-8 text-black/60">{t.noSales}</Text>:
          rows.filter(row=>row.start_at && row.product_id).sort((a,b)=>new Date(b.start_at)-new Date(a.start_at)).map(row=>{
            const prod = products.find(p=>p.id === row.product_id);
            const now = Date.now(), st = new Date(row.start_at).getTime(), et = new Date(row.end_at).getTime();
            const status = now < st ? t.soon : (now > et ? t.expired : t.active);
            const timer = status===t.active?formatTimer(et-now, lang):'';
            let stockMsg = '';
            if (prod) {
              const q = prod.stock;
              if(q === 0) stockMsg = t.soldout;
              else if(q <= 3) stockMsg = t.almost;
            }
            return <View key={row.id} className="flex-row items-center bg-[#FEEFCB] rounded-xl mb-2 px-2 py-2 shadow w-full">
              <View className="flex-1 min-w-0">
                <Text className="font-bold text-md text-[#36543C] mb-0.5">{prod ? (prod.name?.[lang]||prod.name?.en||prod.name) : t.product}</Text>
                <Text className="text-xs text-gray-800" numberOfLines={1}>{t.discount}: {row.discount_percent}%</Text>
                <Text className="text-xs text-gray-700" numberOfLines={1}>{`${t.start}: ${row.start_at}`}</Text>
                <Text className="text-xs text-gray-700" numberOfLines={1}>{`${t.end}: ${row.end_at}`}</Text>
                <Text className={status===t.active?"text-xs text-red-600 font-bold mt-1":"text-xs text-gray-600 mt-1"}>{status}</Text>
                {timer ? <Text className="text-xs font-mono text-red-700">{t.timer}: {timer}</Text>: null}
                {!!stockMsg && <Text className="text-xs text-orange-600 font-semibold">{stockMsg}</Text>}
              </View>
              <TouchableOpacity onPress={()=>remove(row.id)} className="mx-2"><Text className="text-red-700">{t.remove}</Text></TouchableOpacity>
            </View>
          })}
      </ScrollView>
    </SafeAreaView>
  );
}
