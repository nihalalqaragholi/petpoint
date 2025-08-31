import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { supabase } from '../lib/supabase';

const STRINGS = {
  en: {
    analytics: "Analytics & Reports",
    close: "Close",
    users: "Total Users",
    orders: "Total Orders",
    revenue: "Revenue (IQD)",
    topProducts: "Most Purchased Products",
    loading: "Loading...",
    rank: "#",
    product: "Product",
    quantity: "Sold",
    none: "No data",
    topCustomer: "Top Customer This Week",
    customer: "Customer",
    orders: "Orders",
  },
  ar: {
    analytics: "التحليلات والتقارير",
    close: "إغلاق",
    users: "إجمالي المستخدمين",
    orders: "الطلبات",
    revenue: "الإيرادات (د.ع)",
    topProducts: "الأكثر مبيعًا",
    loading: "...جاري التحميل",
    rank: "#",
    product: "المنتج",
    quantity: "تم البيع",
    none: "لا توجد بيانات",
    topCustomer: "أكثر عميل خلال الأسبوع",
    customer: "العميل",
    orders: "الطلبات",
  }
};

export default function AdminAnalyticsPanel({ onClose, lang = 'en' }) {
  const t = STRINGS[lang] || STRINGS.en;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const [data, setData] = useState({ users:0, orders:0, revenue:0, products:[] });
  const [loading, setLoading] = useState(true);
  const [topCustomer, setTopCustomer] = useState(null);
  useEffect(() => {
    (async()=>{
      setLoading(true);
      const [usersQ, ordersQ, revQ, prodQ] = await Promise.all([
        supabase.from('users_meta').select('id', { count:'exact', head:true }),
        supabase.from('orders').select('id', { count:'exact', head:true }),
        supabase.from('orders').select('total'), // you may want 'total_price' instead of 'total' depending on schema
        supabase.from('orders_products').select('product_id, quantity'),
      ]);
      // Total users/orders
      const users = usersQ.count||0;
      const orders = ordersQ.count||0;
      // Revenue
      const revenue = (revQ.data||[]).reduce((sum, o)=>sum + (o.total||0), 0);
      // Most purchased products (aggregate by product_id)
      const freq = {};
      (prodQ.data||[]).forEach(row=>{ freq[row.product_id] = (freq[row.product_id]||0) + (row.quantity||0); });
      let topProds = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,3);
      // Fetch product names
      let names = {};
      if (topProds.length > 0) {
        const ids = topProds.map(([pid])=>pid);
        const { data: pnames } = await supabase.from('products').select('id,name').in('id', ids);
        names = (pnames||[]).reduce((obj,p)=>({...obj,[p.id]:p.name}), {});
      }
      setData({
        users, orders, revenue,
        products: topProds.map(([pid, qty], i)=>({
          rank:i+1,
          name:names[pid]?.[lang] || names[pid]?.en || `ID ${pid}`,
          quantity:qty
        }))
      });
      // -- Top customer in last 7 days --
      const fromDate = new Date(Date.now() - 7*24*60*60*1000).toISOString().substring(0,10);
      const custOrdersQ = await supabase.from('orders').select('id,user_id').gte('created_at', fromDate);
      const freq2 = {};
      (custOrdersQ.data||[]).forEach(row=>{ freq2[row.user_id] = (freq2[row.user_id]||0) + 1 });
      let best = Object.entries(freq2).sort((a,b)=>b[1]-a[1])[0];
      if (best) {
        const { data: customerInfo } = await supabase.from('users_meta').select('phone,full_name').eq('user_id', best[0]);
        setTopCustomer({
          phone: customerInfo && customerInfo[0]?.phone,
          name: customerInfo && customerInfo[0]?.full_name,
          orders: best[1],
        });
      } else setTopCustomer(null);
      setLoading(false);
    })();
  }, []);
  return (
    <SafeAreaView className="flex-1 bg-[#F4FAEE] w-full h-full" style={{direction:dir}}>
      <View className="flex-row justify-between items-center mb-1 px-2">
        <TouchableOpacity onPress={onClose} className="p-1 bg-white/90 rounded-full"><Text className="text-2xl font-bold text-black">×</Text></TouchableOpacity>
        <Text className="flex-1 text-2xl font-extrabold text-black text-center mr-5" numberOfLines={1}>{t.analytics}</Text>
      </View>
      {loading ? <Text className="text-center text-lg font-bold text-gray-700 mt-10">{t.loading}</Text> : (
        <ScrollView contentContainerStyle={{flexGrow:1,paddingBottom:18}} showsVerticalScrollIndicator>
        <View className="flex-row justify-between gap-x-1 mb-2 px-0 w-full">
          <View className="flex-1 bg-white rounded-xl shadow p-2 items-center mx-0 min-w-0"><Text className="font-bold text-lg mb-0.5 text-[#36543C]">{data.users}</Text><Text className="text-xs text-gray-600">{t.users}</Text></View>
          <View className="flex-1 bg-white rounded-xl shadow p-2 items-center mx-0 min-w-0"><Text className="font-bold text-lg mb-0.5 text-[#36543C]">{data.orders}</Text><Text className="text-xs text-gray-600">{t.orders}</Text></View>
          <View className="flex-1 bg-white rounded-xl shadow p-2 items-center mx-0 min-w-0"><Text className="font-bold text-lg mb-0.5 text-[#36543C]">{data.revenue.toLocaleString()}</Text><Text className="text-xs text-gray-600">{t.revenue}</Text></View>
        </View>
        <View className="bg-white rounded-xl shadow px-2 py-2 mb-2 mt-2 w-full min-w-0">
          <Text className="text-[#1F3E20] mb-1 font-bold text-base text-center">{t.topCustomer}</Text>
          {topCustomer ? (
            <View className="flex-row items-center justify-center gap-x-2">
              <Text className="font-semibold text-base text-black">{t.customer}: {topCustomer.name||topCustomer.phone||'-'}</Text>
              <Text className="text-xs text-gray-600 mx-2">|</Text>
              <Text className="font-semibold text-base text-black">{t.orders}: {topCustomer.orders}</Text>
            </View>
          ) : <Text className="text-center text-gray-400 mt-1">{t.none}</Text>}
        </View>
        <View className="bg-white rounded-xl shadow px-2 py-2 w-full min-w-0 mb-2">
          <Text className="text-[#1F3E20] mb-1 font-bold text-base text-center">{t.topProducts}</Text>
          {data.products.length===0 ? <Text className="text-center text-gray-500">{t.none}</Text> :
            <View className={dir==='rtl'?"flex-row-reverse":""}>
              <View className="w-[12%]"><Text className="text-xs font-semibold text-gray-500">{t.rank}</Text></View>
              <View className="w-[64%]"><Text className="text-xs font-semibold text-gray-500">{t.product}</Text></View>
              <View className="w-[24%]"><Text className="text-xs font-semibold text-gray-500">{t.quantity}</Text></View>
            </View>}
          {data.products.map(row=>
            <View className="flex-row items-center my-0.5" key={row.rank}>
              <Text className="w-[12%] font-bold text-[#C0DC17] text-base text-center">{row.rank}</Text>
              <Text className="w-[64%] text-black font-semibold text-base text-center">{row.name}</Text>
              <Text className="w-[24%] text-black text-base text-center">{row.quantity}</Text>
            </View>
          )}
        </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}