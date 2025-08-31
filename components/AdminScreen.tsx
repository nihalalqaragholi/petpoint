import { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Linking, Image } from "react-native";
import MyPetsList from './MyPetsList';
import MyPetProfile from './MyPetProfile';
import { supabase } from '../lib/supabase';
import { Pencil, Trash2, Plus, ClipboardList, Package, Truck, PawPrint, Check, X, Gift, Megaphone, BarChart3, Settings, Zap, Award, Users as UsersIcon, Boxes } from "lucide-react-native";
import AdminOrdersTab from "./AdminOrdersTab";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminFeatureScreen from './AdminFeatureScreen';
import AdminNotificationPanel from './AdminNotificationPanel';
import AdminCouponsPanel from './AdminCouponsPanel';
import AdminAnalyticsPanel from './AdminAnalyticsPanel';
import AdminSettingsPanel from './AdminSettingsPanel';
import AdminFlashSalesPanel from './AdminFlashSalesPanel';
import AdminPetOfWeekPanel from './AdminPetOfWeekPanel';
import { useGalleryImagePicker } from '../hooks/useGalleryImagePicker';
import ImageUrlModal from './ImageUrlModal';
import ProductImage from './ProductImage';

const STRINGS = {
  en: {
    admin: "Admin Panel",
    products: "Products",
    delivery: "Delivery",
    addProd: "Add Product",
    editProd: "Edit Product",
    save: "Save",
    cancel: "Cancel",
    animal: "Animal",
    category: "Category",
    prodName: "Product Name",
    prodDesc: "Product Description",
    price: "Price (IQD)",
    uploadImg: "Upload Image",
    changeImg: "Change Image",
    noProds: "No products yet.",
    edit: "Edit",
    del: "Delete",
    cityFees: "Delivery Fees & Times",
    fee: "Fee (IQD)",
    time: "Delivery Time",
    saved: "Saved!",
    lang: "عربي",
    back: "×",
    users: "Users",
    loading: "Loading...",
    noUsers: "No users found.",
    blocked: "Blocked",
    active: "Active",
    activate: "Activate",
    block: "Block",
    stock: "Stock",
    product: "Product",
    quantity: "Quantity",
    status: "Status",
    lowStock: "Low Stock!",
    warning: "Warning: One or more products are running low on stock!",
    editBtn: "Edit",
    deleteBtn: "Delete",
    orders: "Orders",
    notifications: "Notifications",
    coupons: "Coupons",
    analytics: "Analytics",
    settings: "Settings",
  },
  ar: {
    admin: "لوحة الإدارة",
    products: "المنتجات",
    delivery: "التوصيل",
    addProd: "إضافة منتج",
    editProd: "تعديل منتج",
    save: "حفظ",
    cancel: "إلغاء",
    animal: "الحيوان",
    category: "الفئة",
    prodName: "اسم المنتج",
    prodDesc: "وصف المنتج",
    price: "السعر (د.ع)",
    uploadImg: "رفع صورة",
    changeImg: "تغيير الصورة",
    noProds: "لا توجد منتجات بعد",
    edit: "تعديل",
    del: "حذف",
    cityFees: "رسوم ومدة التوصيل",
    fee: "اجرة (د.ع)",
    time: "مدة التوصيل",
    saved: "تم الحفظ!",
    lang: "EN",
    back: "×",
    users: "المستخدمون",
    loading: "يتم التحميل...",
    noUsers: "لا يوجد مستخدمون.",
    blocked: "محظور",
    active: "نشط",
    activate: "تفعيل",
    block: "حظر",
    stock: "المخزون",
    product: "المنتج",
    quantity: "الكمية",
    status: "الحالة",
    lowStock: "المخزون منخفض!",
    warning: "تحذير: منتج واحد أو أكثر على وشك النفاد!",
    editBtn: "تعديل",
    deleteBtn: "حذف",
    orders: "الطلبات",
    notifications: "الإشعارات",
    coupons: "الكوبونات",
    analytics: "التحليلات",
    settings: "الإعدادات",
  }
};

const demoAnimals = [
  { key: "cats", label: { en: "Cats", ar: "قطط" } },
  { key: "dogs", label: { en: "Dogs", ar: "كلاب" } },
  { key: "birds", label: { en: "Birds", ar: "طيور" } },
  { key: "fishes", label: { en: "Fishes", ar: "أسماك" } },
];
const demoCategories = [
  { key: "food", label: { en: "Food", ar: "طعام" } },
  { key: "clean", label: { en: "Clean & Clear", ar: "نظافة وعناية" } },
  { key: "accessories", label: { en: "Accessories", ar: "اكسسوارات" } },
];
const demoProductsInit = [
  {
    id: 1,
    name: { en: "Dry Cat Food", ar: "طعام قطط جاف" },
    desc: { en: "High-protein blend for adult cats.", ar: "خليط عالي البروتين للقطط البالغة" },
    animal: "cats",
    category: "food",
    img: "https://images.pexels.com/photos/4523036/pexels-photo-4523036.jpeg?h=300&w=300",
  },
  {
    id: 2,
    name: { en: "Cat Shampoo", ar: "شامبو القطط" },
    desc: { en: "Hypoallergenic, gentle wash.", ar: "غسيل لطيف ضد التحسس" },
    animal: "cats",
    category: "clean",
    img: "https://images.pexels.com/photos/1170986/pexels-photo-1170986.jpeg?h=300&w=300",
  },
];
const demoCities = [
  { name: "Baghdad", ar: "بغداد", fee: 3000, time: "1-2 days" },
  { name: "Basra", ar: "البصرة", fee: 4000, time: "1-3 days" },
  { name: "Mosul", ar: "الموصل", fee: 5000, time: "2-4 days" },
  { name: "Erbil", ar: "أربيل", fee: 6000, time: "2-5 days" },
  { name: "Kirkuk", ar: "كركوك", fee: 4500, time: "2-4 days" },
  { name: "Najaf", ar: "النجف", fee: 3500, time: "1-3 days" },
  { name: "Diyala", ar: "ديالى", fee: 5500, time: "2-4 days" }
];

const cityGroups = [
  { title: { en: "Central Cities", ar: "المدن المركزية" }, cities: ["Baghdad", "Diyala", "Najaf"] },
  { title: { en: "North Cities", ar: "المدن الشمالية" }, cities: ["Mosul", "Erbil", "Kirkuk"] },
  { title: { en: "South Cities", ar: "المدن الجنوبية" }, cities: ["Basra"] }
];

const foodSubcategories = [
  { key: "dry.kilograms", label: { en: "Dry Food - Kilograms", ar: "طعام جاف - كيلوجرامات" } },
  { key: "dry.bag", label: { en: "Dry Food - Bag", ar: "طعام جاف - كيس" } },
  { key: "wet.cans", label: { en: "Wet Food - Cans", ar: "طعام رطب - علب" } },
  { key: "wet.snacks", label: { en: "Wet Food - Snacks", ar: "طعام رطب - سناكات" } },
  { key: "wet.pouches", label: { en: "Wet Food - Pouches", ar: "طعام رطب - أكياس صغيرة" } },
];
function ProductManagement({ lang }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  // Load products from Supabase
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((p) => ({
        id: p.id,
        name: { en: p.name_en || '', ar: p.name_ar || '' },
        desc: { en: p.description_en || '', ar: p.description_ar || '' },
        animal: p.animal_type,
        category: p.category,
        img: p.img_url || '',
        price: Number(p.price || 0),
        stock: Number(p.stock || 0),
      }));
    },
  });
  const products = productsQuery.data || [];
  const [editProd, setEditProd] = useState(null); // null, or {...product fields}
  const [formMode, setFormMode] = useState("none"); // "none", "add", "edit"
  // --- Image hook ---
  const [uploadImage, { uploading, error: imgError, imageUrl }] = useGalleryImagePicker();
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlImporting, setUrlImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  async function saveProductToDb() {
    // Map fields defensively from current editProd shape
    let name_en = (editProd.nameEn || editProd.name_en || (editProd.name && editProd.name.en) || "").toString().trim();
    let name_ar = (editProd.nameAr || editProd.name_ar || (editProd.name && editProd.name.ar) || "").toString().trim();
    let desc_en = (editProd.descEn || editProd.desc_en || (editProd.desc && editProd.desc.en) || "").toString().trim();
    let desc_ar = (editProd.descAr || editProd.desc_ar || (editProd.desc && editProd.desc.ar) || "").toString().trim();
    // Auto-fill missing translation with the other one
    if (!name_en && name_ar) name_en = name_ar;
    if (!name_ar && name_en) name_ar = name_en;
    if (!desc_en && desc_ar) desc_en = desc_ar;
    if (!desc_ar && desc_en) desc_ar = desc_en;
    const image_url = editProd.img || editProd.image_url || null;
    const animal = editProd.animal || '';
    const category = editProd.category || '';
    const price = Number(editProd.price || 0);
    const stock = Math.max(0, Number(editProd.stock || 0));

    console.log('[AdminSave] Persist', { animal, category, price, stock, hasImg: !!image_url, name_en_len: name_en.length, name_ar_len: name_ar.length });

    if (!animal || !category || !name_en) {
      throw new Error('Missing required fields (name/animal/category)');
    }

    if (editProd.id) {
      const { error } = await supabase
        .from('products')
        .update({ name_en, name_ar, description_en: desc_en, description_ar: desc_ar, img_url: image_url, price, stock, animal_type: animal, category })
        .eq('id', editProd.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('products')
        .insert([{ name_en, name_ar, description_en: desc_en, description_ar: desc_ar, img_url: image_url, price, stock, animal_type: animal, category }]);
      if (error) throw error;
    }
  }

  const handleSaveProduct = async () => {
    if (uploading || urlImporting) {
      Alert.alert(lang==='ar'?"انتظر":"Please wait", lang==='ar'?"يرجى انتظار اكتمال رفع/جلب الصورة.":"Please wait for image upload/import to finish.");
      return;
    }
    // Normalize names to avoid blocking save if one language is missing
    setEditProd(p => p ? ({
      ...p,
      name: {
        en: (p.name?.en || p.name?.ar || '').toString(),
        ar: (p.name?.ar || p.name?.en || '').toString(),
      },
      desc: {
        en: (p.desc?.en || p.desc?.ar || '').toString(),
        ar: (p.desc?.ar || p.desc?.en || '').toString(),
      }
    }) : p);
    setSaving(true);
    try {
      await saveProductToDb();
      console.log('[AdminSave] Success');
      Alert.alert(lang==='ar'? 'تم الحفظ' : 'Saved', lang==='ar'? 'تم حفظ المنتج بنجاح' : 'Product saved successfully');
      // Optionally reset form
      setEditProd(null);
      setFormMode("none");
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (e:any) {
      console.log('[AdminSave] Error', e?.message || e);
      Alert.alert('Save failed', e?.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };
  const insertMutation = useMutation({
    mutationFn: async (p) => {
      const { error } = await supabase.from('products').insert({
        name_en: p.name.en,
        name_ar: p.name.ar,
        description_en: p.desc.en,
        description_ar: p.desc.ar,
        animal_type: p.animal,
        category: p.category,
        price: p.price ?? 0,
        img_url: p.img || null,
        stock: Math.max(0, Number(p.stock || 0)),
      });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
  const updateMutation = useMutation({
    mutationFn: async (p) => {
      const { error } = await supabase.from('products').update({
        name_en: p.name.en,
        name_ar: p.name.ar,
        description_en: p.desc.en,
        description_ar: p.desc.ar,
        animal_type: p.animal,
        category: p.category,
        price: p.price ?? 0,
        img_url: p.img || null,
        stock: Math.max(0, Number(p.stock || 0)),
      }).eq('id', p.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
  const handleInput = (field, value, lng) => {
    setEditProd((p) => {
      if (!p) return p;
      if (lng) return { ...p, [field]: { ...p[field], [lng]: value } };
      return { ...p, [field]: value };
    });
  };
  const importFromUrl = async (url: string) => {
    const trimmedUrl = url.trim();
    let decodedUrl = trimmedUrl;
    try {
      decodedUrl = decodeURIComponent(trimmedUrl);
    } catch {}
    console.log('[ImportURL] Start', decodedUrl);
    // Optimistic: show pasted URL immediately so user can save without waiting
    setShowUrlModal(false);
    handleInput('img', decodedUrl);
    setUrlImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('upload-from-url', { body: { url: decodedUrl } });
      console.log('[ImportURL] Response', { data, error });
      if (error) throw error;
      const signed = (data as any)?.signedUrl || (data as any)?.signed_url;
      if (signed) {
        handleInput('img', signed);
      }
      Alert.alert(lang==='ar'?'تم جلب الصورة':'Image imported');
    } catch (e: any) {
      console.log('[ImportURL] Error', e);
      // Keep pasted URL; notify user of fallback
      Alert.alert(lang==='ar'?'فشل جلب الصورة':'Failed to import image',(e?.message || '') + (lang==='ar'? '\nسيتم استخدام الرابط كما هو.':'\nWe will use the pasted URL as-is.'));
    } finally {
      setUrlImporting(false);
    }
  };
  const addProduct = () => {
    setEditProd({
      id: null,
      name: { en: "", ar: "" },
      desc: { en: "", ar: "" },
      animal: "cats",
      category: "food",
      img: "",
      price: 0,
      stock: 0,
    });
    setFormMode("add");
  };
  const editProduct = (p) => {
    setEditProd({ ...p });
    setFormMode("edit");
  };
  const saveProduct = () => {
    if (uploading || urlImporting) {
      Alert.alert(lang==='ar'?"انتظر":"Please wait", lang==='ar'?"يرجى انتظار اكتمال رفع/جلب الصورة.":"Please wait for image upload/import to finish.");
      return;
    }
    if (!editProd?.name?.en || !editProd?.name?.ar) {
      Alert.alert(lang==='ar'? 'الاسم مطلوب' : 'Name is required');
      return;
    }
    if (formMode === 'add') insertMutation.mutate(editProd);
    if (formMode === 'edit' && editProd.id) updateMutation.mutate(editProd);
    setEditProd(null);
    setFormMode("none");
  };
  const deleteProduct = (id) => {
    if (id) deleteMutation.mutate(id);
  };
  if (formMode !== "none" && editProd) {
    return (
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} className="mt-2">
        <View className="bg-[#F7FEEB] rounded-3xl shadow-lg px-5 py-5 mb-4 border border-[#C0DC17]">
          <Text className="text-xl font-bold mb-4 text-[#36543C] text-center">{formMode === "add" ? t.addProd : t.editProd}</Text>
          <View className="items-center mb-6">
            <ProductImage uri={editProd.img} size={100} className="mb-2" />
            <TouchableOpacity
              className="bg-[#C0DC17] px-6 py-2 rounded-xl mt-1"
              disabled={uploading}
              onPress={async () => {
                const url = await uploadImage('admin'); // In real app, pass admin id
                if(url) handleInput("img", url);
              }}
            >
              <Text className="text-[#36543C] font-bold text-base">{uploading ? (lang==='ar'?'...يتم التحميل':'Uploading...') : (editProd.img ? t.changeImg : t.uploadImg)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white px-4 py-2 rounded-xl mt-2 border border-[#C0DC17]"
              onPress={() => setShowUrlModal(true)}
            >
              <Text className="text-[#36543C] font-semibold text-sm">{lang==='ar' ? 'لصق رابط الصورة' : 'Paste Image URL'}</Text>
            </TouchableOpacity>
            {!!editProd.img && (
              <View className="mt-3 items-center">
                <Text numberOfLines={1} className="text-xs text-black/70 max-w-[260px]">{editProd.img}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(editProd.img)} className="mt-1 px-3 py-1 rounded-xl bg-black/10">
                  <Text className="text-xs font-semibold text-black">{lang==='ar' ? 'فتح الصورة' : 'Open Image'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {(uploading || urlImporting) && (
              <View className="mt-2 flex-row items-center">
                <ActivityIndicator color="#36543C" />
                <Text className="ml-2 text-[#36543C] font-semibold">{uploading ? (lang==='ar'?'جارٍ رفع الصورة':'Uploading image...') : (lang==='ar'?'جاري الجلب من الرابط':'Importing from URL...')}</Text>
              </View>
            )}
            {!!imgError && <Text className="text-xs text-red-500 mt-1">{imgError}</Text>}
          </View>
          <ImageUrlModal
            visible={showUrlModal}
            onCancel={() => setShowUrlModal(false)}
            onSubmit={(url) => { importFromUrl(url); }}
            lang={lang}
          />
          <Text className="mb-1 font-semibold text-[#36543C]">{t.animal}</Text>
          <View className={`flex-row mb-2 gap-x-2 ${dir==='rtl'?'justify-end':''}`}>
            {demoAnimals.map((a) => (
              <TouchableOpacity
                key={a.key}
                className={`px-3 py-1 rounded-xl ${editProd.animal===a.key ? "bg-[#C0DC17]" : "bg-white/70"}`}
                onPress={() => handleInput("animal", a.key)}
              >
                <Text className="font-semibold text-black">{a.label[lang]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="mb-1 font-semibold text-[#36543C]">{t.category}</Text>
          <View className={`flex-row mb-2 gap-x-2 flex-wrap ${dir==='rtl'?'justify-end':''}`}>
            {demoCategories.map((c) => (
              <TouchableOpacity
                key={c.key}
                className={`px-3 py-1 rounded-xl mb-2 ${editProd.category===c.key ? "bg-[#FF7300]" : "bg-white/70"}`}
                onPress={() => handleInput("category", c.key)}
              >
                <Text className="font-semibold text-black">{c.label[lang]}</Text>
              </TouchableOpacity>
            ))}
            {foodSubcategories.map(fsub => (
              <TouchableOpacity
                key={fsub.key}
                className={`px-3 py-1 rounded-xl mb-2 border ${editProd.category===fsub.key ? "bg-[#C0DC17] border-[#789E1B]" : "bg-white/70 border-gray-200"}`}
                onPress={() => handleInput("category", fsub.key)}
              >
                <Text className="font-semibold text-black text-xs">{fsub.label[lang]}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Names */}
          <Text className="mb-1 font-semibold text-[#36543C]">{t.prodName}</Text>
          <TextInput
            placeholder={lang==='ar' ? "اسم المنتج بالعربية" : "English name"}
            value={editProd.name[lang]}
            onChangeText={v => handleInput("name", v, lang)}
            className="bg-white border border-[#C0DC17] rounded-xl px-3 py-1.5 mb-3 text-black"
          />
          <TextInput
            placeholder={lang==='ar' ? "اسم المنتج بالانكليزية" : "Arabic name"}
            value={editProd.name[lang==='en' ? 'ar' : 'en']}
            onChangeText={v => handleInput("name", v, lang==='en' ? 'ar' : 'en')}
            className="bg-white border border-[#C0DC17] rounded-xl px-3 py-1.5 mb-3 text-black"
          />
          {/* Descriptions */}
          <Text className="mb-1 font-semibold text-[#36543C]">{t.prodDesc}</Text>
          <TextInput
            placeholder={lang==='ar' ? "وصف المنتج بالعربية" : "English description"}
            value={editProd.desc[lang]}
            onChangeText={v => handleInput("desc", v, lang)}
            className="bg-white border border-[#C0DC17] rounded-xl px-3 py-1.5 mb-3 text-black"
            multiline
          />
          <TextInput
            placeholder={lang==='ar' ? "الوصف بالانكليزية" : "Arabic description"}
            value={editProd.desc[lang==='en' ? 'ar' : 'en']}
            onChangeText={v => handleInput("desc", v, lang==='en' ? 'ar' : 'en')}
            className="bg-white border border-[#C0DC17] rounded-xl px-3 py-6 text-black"
            multiline
          />
          {/* Price */}
          <Text className="mb-1 font-semibold text-[#36543C]">{t.price}</Text>
          <TextInput
            placeholder={lang==='ar' ? 'السعر بالدينار' : 'Price in IQD'}
            value={String(editProd.price ?? 0)}
            onChangeText={(v) => handleInput('price', Number(v.replace(/[^\d.]/g, '')) || 0)}
            keyboardType="numeric"
            className="bg-white border border-[#C0DC17] rounded-xl px-3 py-1.5 mb-3 text-black"
          />
          {/* Stock */}
          <Text className="mb-1 font-semibold text-[#36543C]">{t.stock}</Text>
          <TextInput
            placeholder={lang==='ar' ? 'الكمية في المخزون' : 'Units in stock'}
            value={String(editProd.stock ?? 0)}
            onChangeText={(v) => handleInput('stock', Math.max(0, Number(v.replace(/[^\d]/g, '')) || 0))}
            keyboardType="numeric"
            className="bg-white border border-[#C0DC17] rounded-xl px-3 py-1.5 mb-3 text-black"
          />
          <View className="flex-row justify-between mt-5">
            <TouchableOpacity className="bg-[#36543C] px-7 py-2.5 rounded-xl opacity-100" disabled={uploading||urlImporting||saving} onPress={handleSaveProduct}>
              <Text className="text-white font-bold text-lg">{t.save}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-200 px-7 py-2.5 rounded-xl" onPress={()=>{setFormMode("none");setEditProd(null);}}>
              <Text className="text-black font-bold text-lg">{t.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }
  return (
    <View className="flex-1 bg-[#F4FAEE]">
      <TouchableOpacity className="flex-row items-center justify-center bg-[#C0DC17] py-3 rounded-2xl mb-3 mx-6 shadow-lg" onPress={addProduct}>
        <Plus size={22} color="#454" />
        <Text className="text-center text-[#36543C] text-lg font-bold ml-2">{t.addProd}</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {productsQuery.isLoading && (
          <Text className="text-center mt-12 text-black/60">Loading...</Text>
        )}
        {!productsQuery.isLoading && products.length === 0 && (
          <Text className="text-center mt-12 text-black/60">{t.noProds}</Text>
        )}
        {products.map((p) => (
          <View key={p.id} className="flex-row items-center bg-white rounded-3xl my-3 px-4 py-3 shadow-lg mx-2 gap-x-4">
            <ProductImage uri={p.img} size={64} style={{ marginRight: 12 }} />
            <View className="flex-1">
              <Text className="font-bold text-[17px] text-black mb-0.5">{p.name[lang]}</Text>
              <Text className="text-xs text-[#85A36C]">{p.name[lang === 'en' ? 'ar' : 'en']} • {Number(p.price||0).toLocaleString()} IQD</Text>
            </View>
            <TouchableOpacity className="px-1.5" onPress={() => editProduct(p)}>
              <Pencil size={22} color="#36543C" />
            </TouchableOpacity>
            <TouchableOpacity className="px-1.5" onPress={() => deleteProduct(p.id)}>
              <Trash2 size={22} color="#FE2037" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function DeliveryEditor({ lang }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const qc = useQueryClient();
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cities').select('*').order('sort', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });
  const updateCity = useMutation({
    mutationFn: async ({ id, fee, time }) => {
      const { error } = await supabase.from('cities').update({ fee: Number(fee||0), time }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cities'] }),
  });
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 26 }} className="bg-[#DFECCB]">
      <Text className={`text-lg font-bold text-black mb-4 mt-2 text-center ${dir==='rtl'?'text-right':'text-left'}`}>{t.cityFees}</Text>
      <View className="bg-[#FCEED8] rounded-2xl shadow px-2 pt-2 pb-2">
        {isLoading && <Text className="text-center text-black/60 my-4">{t.loading}</Text>}
        {!isLoading && cities.map((c) => (
          <View key={c.id} className={`rounded-2xl bg-[#FCFCFC] shadow mb-3 px-3 pt-3 pb-2 ${dir==='rtl'?'items-end':'items-start'}` }>
            <Text className={`font-bold text-lg text-black mb-1 ${dir==='rtl'?'text-right':'text-left'}`}>{lang==='ar'?c.ar:c.name} <Text className="text-xs text-gray-500">{lang==='ar'?c.name:c.ar}</Text></Text>
            <View className={`flex-row gap-x-6 w-full mb-2 ${dir==='rtl'?'flex-row-reverse':''}`}>
              <View style={{flex:1}}>
                <Text className={`text-xs text-black mb-1 font-semibold ${dir==='rtl'?'text-right':'text-left'}`}>{t.fee}</Text>
                <TextInput
                  defaultValue={String(c.fee)}
                  keyboardType="numeric"
                  onEndEditing={(e)=>updateCity.mutate({ id: c.id, fee: e.nativeEvent.text.replace(/\D/g,'') || 0, time: c.time })}
                  className="w-full bg-gray-100 rounded px-2 py-2 text-lg text-black"
                  textAlign={dir==='rtl'?'right':'left'}
                />
              </View>
              <View style={{flex:1}}>
                <Text className={`text-xs text-black mb-1 font-semibold ${dir==='rtl'?'text-right':'text-left'}`}>{t.time}</Text>
                <TextInput
                  defaultValue={c.time || ''}
                  onEndEditing={(e)=>updateCity.mutate({ id: c.id, fee: c.fee, time: e.nativeEvent.text })}
                  className="w-full bg-gray-100 rounded px-2 py-2 text-lg text-black"
                  textAlign={dir==='rtl'?'right':'left'}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function AdminPets({ lang }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPet, setSelectedPet] = useState(null);
  const [editingPet, setEditingPet] = useState(null);
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true);
      const { data } = await supabase.from('pets').select('*');
      setPets(data||[]);
      setLoading(false);
    };
    fetchPets();
  }, [refresh]);
  const types = ['Cat','Dog','Bird','Fish','Turtle','Hamster','Rabbit'];
  const typeCounts = types.map(type => ({ type, count:pets.filter(p=>p.type===type).length }));
  // Edit
  const handleEdit = pet => setEditingPet(pet);
  // Delete
  const handleDelete = async pet => {
    if (!pet) return;
    if (!confirm(lang==='ar'?'هل أنت متأكد من الحذف؟':'Are you sure to delete?')) return;
    await supabase.from('pets').delete().eq('id', pet.id);
    setSelectedPet(null);
    setEditingPet(null);
    setRefresh(r=>!r);
  };
  // Save edited pet (using MyPetForm)
  const handleSaved = () => {
    setEditingPet(null);
    setSelectedPet(null);
    setRefresh(r=>!r);
  };
  // Choose proper child
  if (editingPet)
    return <MyPetForm lang={lang} petToEdit={editingPet} onClose={()=>setEditingPet(null)} onSaved={handleSaved} />;
  if (selectedPet)
    return <MyPetProfile pet={selectedPet} lang={lang} onEdit={()=>handleEdit(selectedPet)} onDelete={()=>handleDelete(selectedPet)} onClose={()=>setSelectedPet(null)} />;
  return (
    <ScrollView className="flex-1 bg-[#DFECCB] px-2 pt-5 pb-14">
      <Text className="text-2xl font-extrabold text-black mb-5 text-center">{lang==='ar'?'ملفات الحيوانات':'All Pets'}</Text>
      <View className="flex-row flex-wrap justify-center mb-3">
        {typeCounts.map(tc => tc.count>0 && (
          <View key={tc.type} className="bg-[#F9FBE5] rounded-2xl px-4 py-1.5 m-1 mb-3 shadow"><Text className="text-base font-bold text-[#36543C]">{lang==='ar'?({Cat:'قطط',Dog:'كلاب',Bird:'طيور',Fish:'أسماك',Turtle:'سلاحف',Hamster:'هامستر',Rabbit:'أرانب'})[tc.type]:tc.type}: {tc.count}</Text></View>
        ))}
      </View>
      {loading ? <Text className="text-lg text-[#888] mt-8 text-center">{lang==='ar'?STRINGS.ar.loading:STRINGS.en.loading}</Text> :
        pets.map(pet => (
        <TouchableOpacity key={pet.id} className="flex-row items-center bg-white/90 rounded-2xl px-4 py-4 mb-3 shadow" onPress={()=>setSelectedPet(pet)}>
          {pet.image_url ? <Image source={{ uri: pet.image_url }} style={{ width:52, height:52, borderRadius:30, marginRight:11 }} /> : null}
          <View className="flex-1">
            <Text className="text-lg font-semibold text-black mb-0.5">{pet.name}</Text>
            <Text className="text-base text-[#6A8463]">{pet.type}</Text>
          </View>
          <Text className="text-[#C0DC17] text-xl">›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
export default function AdminScreen({ lang, setLang, onExitAdmin }) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  // const [tab, setTab] = useState("orders");
  // const [adminTab, setAdminTab] = useState('orders');
  const [openFeature, setOpenFeature] = useState(null);

  const adminFeatures = [
    { key: "orders", label: t.orders || "Orders", icon: ClipboardList, color: "#F59E0B", bg: "#FFF7E8" },
    { key: "products", label: t.products, icon: Package, color: "#2563EB", bg: "#EAF5FF" },
    { key: "delivery", label: t.delivery, icon: Truck, color: "#16A34A", bg: "#F0FDF4" },
    { key: "pets", label: lang === "ar" ? "الحيوانات" : "My Pets", icon: PawPrint, color: "#8B5CF6", bg: "#F3F0FF" },
    { key: "notifications", label: t.notifications || "Notifications", icon: Megaphone, color: "#EC4899", bg: "#FFF1F7" },
    { key: "coupons", label: t.coupons || "Coupons", icon: Gift, color: "#10B981", bg: "#EEFFF8" },
    { key: "analytics", label: t.analytics || "Analytics", icon: BarChart3, color: "#0EA5E9", bg: "#E6F7FE" },
    { key: "settings", label: t.settings || "Settings", icon: Settings, color: "#6B7280", bg: "#F3F4F6" },
    { key: "flash", label: lang==='ar'?"العرض الخاطف":"Flash Sale", icon: Zap, color: "#F43F5E", bg: "#FFF1F2" },
    { key: "petofweek", label: lang==='ar'?"عميل الأسبوع":"Customer of the Week", icon: null, color: "#C026D3", bg: "#FAE8FF" },
    { key: "users", label: t.users, icon: UsersIcon, color: "#0EA5E9", bg: "#E6F7FE" },
    { key: "stock", label: t.stock, icon: Boxes, color: "#22C55E", bg: "#EDFFF5" },
  ];

  // Stock management (live from Supabase)
  const LOW_STOCK_THRESHOLD = 5;
  const [editingStockId, setEditingStockId] = useState<string | number | null>(null);
  const [editQty, setEditQty] = useState(0);
  const stockProductsQuery = useQuery({
    queryKey: ['stock-products'],
    enabled: openFeature === 'stock',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id,name_en,name_ar,stock,img_url')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(p => ({ id: p.id, name_en: p.name_en || '', name_ar: p.name_ar || '', stock: Number(p.stock || 0), img_url: p.img_url || '' }));
    },
  });
  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: string | number; stock: number }) => {
      const { error } = await supabase.from('products').update({ stock }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
  // User list query
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      let { data, error } = await supabase.from('users_meta').select('*').order('last_login', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: openFeature === 'users',
  });
  const queryClient = useQueryClient();
  const userMutation = useMutation({
    mutationFn: async ({ user_id, newBlock }) => {
      const { error } = await supabase.from('users_meta').update({ is_blocked: newBlock }).eq('user_id', user_id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] })
  });
  return (
    <SafeAreaView className="flex-1 w-full h-full bg-[#DFECCB]">
      {/* Exit, language toggle */}
      <View className="flex-row justify-between items-center mb-1 px-2 mt-1">
        {onExitAdmin && (
          <TouchableOpacity className="p-2 bg-white/90 rounded-full z-10" onPress={onExitAdmin}>
            <Text className="text-xl font-extrabold text-black">{t.back}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity className="bg-white/80 px-5 py-2 rounded-full" onPress={()=>setLang(lang==="en"?"ar":"en") }>
          <Text className="font-bold text-black text-base">{t.lang}</Text>
        </TouchableOpacity>
      </View>
      <Text className={`text-2xl font-extrabold text-black mb-4 text-center ${dir==='rtl'?'self-end':'self-start'}`}>{t.admin}</Text>
      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:28}}>
        {/* Admin Features grid */}
        <View className="w-full flex-row flex-wrap justify-between gap-y-3 mb-6 mt-2 px-1">
          {adminFeatures.filter(f => f.key !== 'users' && f.key !== 'stock').map((f, i) => {
            const Icon = f.icon;
            return (
              <TouchableOpacity
                key={f.key}
                className="w-[48%] aspect-[1.7/1] bg-white border border-[#eee] rounded-3xl shadow-lg items-center justify-center mb-2"
                style={{ elevation: 4 }}
                onPress={() => setOpenFeature(f.key)}
                activeOpacity={0.91}
              >
                <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: f.bg || '#F5F5F5' }}>
                  {Icon ? (
                    <Icon size={26} color={f.color || '#666'} />
                  ) : (
                    <Text style={{ fontSize: 22 }}>🏆</Text>
                  )}
                </View>
                <Text className="mt-2 font-bold text-base text-[#666]" numberOfLines={1}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={() => setOpenFeature('users')} className="w-[48%] aspect-[1.7/1] bg-white border border-[#eee] rounded-3xl shadow-lg items-center justify-center mb-2" style={{elevation:4}} activeOpacity={0.91}>
            <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#E6F7FE' }}>
              <UsersIcon size={26} color="#0EA5E9" />
            </View>
            <Text className="mt-2 font-bold text-base text-[#36543C]">{t.users}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setOpenFeature('stock')} className="w-[48%] aspect-[1.7/1] bg-white border border-[#eee] rounded-3xl shadow-lg items-center justify-center mb-2" style={{elevation:4}} activeOpacity={0.91}>
            <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: '#EDFFF5' }}>
              <Boxes size={26} color="#22C55E" />
            </View>
            <Text className="mt-2 font-bold text-base text-[#36543C]">{t.stock}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Feature modals, EXCEPT coupons */}
      {(openFeature && openFeature !== 'coupons') && (
        <View className="absolute top-0 left-0 w-full h-full z-50 bg-[#f4faee]">
          {openFeature === 'orders' && (
            <AdminFeatureScreen title={lang==='ar'?t.products:'Orders'} onClose={()=>setOpenFeature(null)} lang={lang}>
              <AdminOrdersTab lang={lang}/>
            </AdminFeatureScreen>
          )}
          {openFeature === 'products' && (
            <AdminFeatureScreen title={lang==='ar'?t.products:'Products'} onClose={()=>setOpenFeature(null)} lang={lang}>
              <ProductManagement lang={lang} />
            </AdminFeatureScreen>
          )}
          {openFeature === 'delivery' && (
            <AdminFeatureScreen title={lang==='ar'?t.delivery:'Delivery'} onClose={()=>setOpenFeature(null)} lang={lang}>
              <DeliveryEditor lang={lang} />
            </AdminFeatureScreen>
          )}
          {openFeature === 'pets' && (
            <AdminFeatureScreen title={lang==='ar'?'الحيوانات':'My Pets'} onClose={()=>setOpenFeature(null)} lang={lang}>
              <AdminPets lang={lang} />
            </AdminFeatureScreen>
          )}
          {openFeature === 'users' && (
            <AdminFeatureScreen title={t.users} onClose={()=>setOpenFeature(null)} lang={lang}>
              <View className="px-1">
                {(usersLoading) ? <Text className="text-black text-lg my-10 text-center">{t.loading}</Text> :
                (users?.length === 0 ? <Text className="text-gray-500 text-lg my-10 text-center">{t.noUsers}</Text> :
                  <ScrollView className="max-h-[75vh]">
                    {users.map(u => (
                      <View key={u.user_id} className="flex-row items-center bg-white rounded-lg px-3 py-2 mb-3 shadow-sm">
                        <Text className="text-xs font-bold w-[32%]" numberOfLines={1} ellipsizeMode="tail">{u.phone}</Text>
                        <Text className="text-xs w-[36%] text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleString(): '--'}</Text>
                        <Text className={`text-xs px-2 py-0.5 rounded-full ${u.is_blocked ? 'bg-red-400 text-white' : 'bg-green-200 text-green-900'} mx-1`}>{u.is_blocked? t.blocked : t.active}</Text>
                        <TouchableOpacity className="ml-1" onPress={()=>userMutation.mutate({user_id: u.user_id, newBlock:!u.is_blocked})}>
                          <Text className={`text-xs font-semibold underline ${u.is_blocked?'text-green-700':'text-red-600'}`}>{u.is_blocked? t.activate : t.block}</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </AdminFeatureScreen>
          )}
          {openFeature === 'stock' && (
            <AdminFeatureScreen title={t.stock} onClose={()=>setOpenFeature(null)} lang={lang}>
              <View className="bg-white rounded-xl py-3 px-2 shadow-md">
                <View className="flex-row mb-2 border-b border-gray-200 pb-1">
                  <Text className="flex-1 text-xs font-bold text-gray-800">{t.product}</Text>
                  <Text className="w-16 text-xs font-bold text-gray-800 text-center">{t.quantity}</Text>
                  <Text className="w-20 text-xs font-bold">{t.status}</Text>
                  <Text className="w-8" />
                </View>
                {!stockProductsQuery.isLoading && (stockProductsQuery.data || []).map((item) => (
                  <View className="flex-row items-center mb-1.5" key={item.id}>
                    <ProductImage uri={item.img_url} size={32} style={{ marginRight: 8 }} />
                    <Text className="flex-1 text-[13px] font-semibold text-black" numberOfLines={1}>{lang==='ar'? item.name_ar : item.name_en}</Text>
                    {editingStockId === item.id ? (
                      <TextInput
                        value={String(editQty)}
                        keyboardType="number-pad"
                        onChangeText={val => {
                          let n = Math.max(0, Number(val.replace(/[^\d]/g, "")) || 0);
                          setEditQty(n);
                        }}
                        className="w-14 px-1 py-0.5 text-center border rounded bg-gray-50 text-[13px]"
                        placeholder={lang==='ar'?'الكمية':'Quantity'}
                      />
                    ) : (
                      <Text className="w-14 text-center text-[13px] font-medium">{item.stock}</Text>
                    )}
                    {item.stock < LOW_STOCK_THRESHOLD ? (
                      <Text className="w-20 text-[11px] px-2 py-1 text-center rounded-full bg-red-200 text-red-800 font-bold ml-1">{t.lowStock}</Text>
                    ) : (
                      <Text className="w-20" />
                    )}
                    {editingStockId === item.id ? (
                      <>
                        <TouchableOpacity className="ml-1" onPress={() => {
                          updateStockMutation.mutate({ id: item.id, stock: editQty });
                          setEditingStockId(null);
                        }}>
                          <Check size={20} color="#20b25b" />
                        </TouchableOpacity>
                        <TouchableOpacity className="ml-1" onPress={() => setEditingStockId(null)}>
                          <X size={20} color="#c22" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity className="ml-1" onPress={() => { setEditingStockId(item.id); setEditQty(item.stock); }}>
                        <Pencil size={20} color="#36543C" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {stockProductsQuery.isLoading && (
                  <Text className="text-center text-gray-500 my-3">{t.loading}</Text>
                )}
                {!!stockProductsQuery.data && stockProductsQuery.data.some(i => i.stock < LOW_STOCK_THRESHOLD) && (
                  <View className="mt-4 rounded bg-red-100 border border-red-300 px-2 py-1">
                    <Text className="text-[13px] text-red-700 font-semibold">{t.warning}</Text>
                  </View>
                )}
              </View>
            </AdminFeatureScreen>
          )}
          {openFeature === 'notifications' && (
            <AdminFeatureScreen title={lang==='ar'?STRINGS.ar.notifications:'Notifications'} onClose={()=>setOpenFeature(null)} lang={lang}>
              <AdminNotificationPanel onClose={()=>setOpenFeature(null)} lang={lang}/>
            </AdminFeatureScreen>
          )}
          {openFeature === 'settings' && (
            <View className="absolute top-0 left-0 w-full h-full z-50">
              <AdminSettingsPanel onClose={()=>setOpenFeature(null)} lang={lang}/>
            </View>
          )}
          {openFeature === 'flash' && (
            <View className="absolute top-0 left-0 w-full h-full z-50">
              <AdminFlashSalesPanel onClose={()=>setOpenFeature(null)} lang={lang}/>
            </View>
          )}
          {openFeature === 'petofweek' && (
            <View className="absolute top-0 left-0 w-full h-full z-50">
              <AdminPetOfWeekPanel onClose={()=>setOpenFeature(null)} lang={lang}/>
            </View>
          )}
        </View>
      )}
      {/* FULLSCREEN COUPONS OVERLAY */}
      {openFeature === 'coupons' && (
        <View className="absolute top-0 left-0 w-full h-full z-50">
          <AdminCouponsPanel onClose={()=>setOpenFeature(null)} lang={lang}/>
        </View>
      )}
      {/* FULLSCREEN ANALYTICS OVERLAY */}
      {openFeature === 'analytics' && (
        <View className="absolute top-0 left-0 w-full h-full z-50">
          <AdminAnalyticsPanel onClose={()=>setOpenFeature(null)} lang={lang}/>
        </View>
      )}
    </SafeAreaView>
  );
}