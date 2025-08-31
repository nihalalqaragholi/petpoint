import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { supabase } from "../lib/supabase";
import { ChevronDown, ChevronUp, User, MapPin, List, BadgeCheck, Loader } from "lucide-react-native";

const statusColors = {
  pending: "#F4CB0A",
  processing: "#3693D6",
  delivered: "#38C172",
  cancelled: "#F9443B"
};
const statusList = ["pending","processing","delivered","cancelled"];

const demoOrders = [
  {
    order_number: '1001',
    customer_name: 'Ahmed Ali',
    customer_phone: '07712345678',
    delivery_address: 'Baghdad, Dora, House 23',
    city: 'Baghdad',
    status: 'processing',
    items: JSON.stringify([
      { title: 'Dry Cat Food', qty: 2, price: 7000 },
      { title: 'Cat Shampoo', qty: 1, price: 5500 }
    ]),
    total_amount: 12500,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    order_number: '1002',
    customer_name: 'Sura Alwan',
    customer_phone: '07892223344',
    delivery_address: 'Basrah, Corniche Ave, Bldg 11',
    city: 'Basrah',
    status: 'pending',
    items: JSON.stringify([
      { title: 'Dog Leash', qty: 1, price: 3000 }
    ]),
    total_amount: 3000,
    created_at: new Date(Date.now() - 2*86400000).toISOString()
  },
  {
    order_number: '1003',
    customer_name: 'Saleh Kareem',
    customer_phone: '07983334455',
    delivery_address: 'Erbil, Ankawa, Villa 8',
    city: 'Erbil',
    status: 'delivered',
    items: JSON.stringify([
      { title: 'Fish Food', qty: 3, price: 1800 },
      { title: 'Aquarium Filter', qty: 1, price: 6000 }
    ]),
    total_amount: 11400,
    created_at: new Date(Date.now() - 3*86400000).toISOString()
  }
];
export default function AdminOrdersTab({ lang }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null); // id
  const [saving, setSaving] = useState(null); // id of order being saved
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchOrdersWithDemo() {
      setLoading(true);
      let { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if ((data?.length ?? 0) === 0) {
        for (const o of demoOrders) {
          await supabase.from("orders").insert([{ ...o }]);
        }
        ({ data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false }));
      }
      setDebugInfo(JSON.stringify({ data, error }, null, 2));
      if (!ignore) setOrders(data || []);
      setLoading(false);
    }
    fetchOrdersWithDemo();
    // Live update
    const channel = supabase.channel("orders_admin").on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
      supabase.from("orders").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
        setOrders(data || []);
        setDebugInfo(JSON.stringify({ data, error }, null, 2));
      });
    }).subscribe();
    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  const handleExpand = id => setExpanded(expanded === id ? null : id);
  const handleStatus = async (id, status) => {
    setSaving(id);
    await supabase.from("orders").update({ status }).eq("id", id);
    setSaving(null);
  };

  if (loading) return <View className="flex-1 pt-24 items-center"><ActivityIndicator size="large"/><Text style={{marginTop:18}} className="text-black text-lg">Loading...</Text></View>;

  if (!orders.length) return <ScrollView><Text className="text-center text-gray-500 mt-12 text-lg">No orders found.</Text>{debugInfo && <Text className="text-xs bg-yellow-100 p-2 mx-2 mt-3 rounded">{debugInfo}</Text>}</ScrollView>;

  return (
    <ScrollView className="flex-1 bg-[#F4FAEE] px-1.5 pt-2">
      {orders.map(order => (
        <View key={order.id} className="bg-white rounded-xl px-3 py-2 mb-3 shadow-sm">
          <View className="flex-row justify-between items-center">
            <Text className="text-xs font-bold text-[#36543C] mr-2" numberOfLines={1} style={{flex:1}}>
              #{order.order_number}
            </Text>
            <View className="flex-row items-center gap-x-2">
              {/* STATUS always visible as color badge */}
              <Text className={`text-[11px] font-semibold px-2 py-0.5 rounded-full text-white`} style={{backgroundColor: statusColors[order.status]||'#aaa', minWidth:66, textAlign:'center'}} numberOfLines={1} ellipsizeMode="tail">
                {order.status ? order.status.charAt(0).toUpperCase()+order.status.slice(1) : '—'}
              </Text>
              <Text className="text-[11px] text-gray-400 ml-2" numberOfLines={1} ellipsizeMode="tail" style={{minWidth: 60}}>
                {order.created_at? new Date(order.created_at).toLocaleDateString():''}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center mt-1 mb-0.5" style={{gap:6}}>
            <User color="#88BB50" size={14} />
            <Text className="text-xs text-black font-medium flex-1" numberOfLines={1} ellipsizeMode="tail">{order.customer_name}</Text>
            <Text className="text-xs text-gray-500 ml-1" numberOfLines={1} ellipsizeMode="tail">{order.city || ''}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <Text className="text-xs text-black font-bold">
              Total: {order.total_amount?.toLocaleString?.()??order.total_amount}
              {order.delivery_fee ? ` + ${order.delivery_fee?.toLocaleString?.()??order.delivery_fee} ` : ''}IQD
            </Text>
          </View>
          {/* Expand button/icon as before */}
          <TouchableOpacity className="absolute right-2 top-2" onPress={()=>handleExpand(order.id)} hitSlop={8}>
            {expanded===order.id ? <ChevronUp color="#36543C" size={18} /> : <ChevronDown color="#36543C" size={18} />}
          </TouchableOpacity>
          {/* Expanded detailed view below, like before */}
          {expanded===order.id && <View className="pt-2">
            <View className="flex-row items-start mb-1"><MapPin color="#A88B0A" size={13} /><Text className="ml-1 text-xs text-black">{order.delivery_address||'No address'}</Text></View>
            <View className="flex-row items-center mb-1"><Text className="ml-1 text-[11px] text-black">Phone: {order.customer_phone||'No phone'}</Text></View>
            <View className="bg-[#F7F9ED] rounded-lg py-1 px-2 my-1">
              <Text className="font-bold text-xs mb-1">Order Items:</Text>
              {(Array.isArray(order.items) ? order.items : (()=>{try{return JSON.parse(order.items);}catch{return []}})()).map((item, idx) => (
                <Text className="text-[11px] text-black" key={idx}>• {item.title} x{item.qty} — {item.price?.toLocaleString?.()??item.price} IQD</Text>
              ))}
            </View>
          </View>}
        </View>
      ))}
    </ScrollView>
  );
}