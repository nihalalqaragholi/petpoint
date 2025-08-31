import { View, Image, Text, TouchableOpacity, Modal, ScrollView, useWindowDimensions } from "react-native";
import { Menu, ShoppingCart, Heart, User, List, PawPrint } from "lucide-react-native";
import { useRef, useState } from "react";
import AnimatedPressable from "./AnimatedPressable";
// import MyPetForm from "./MyPetForm";
 // import MyPetsList from "./MyPetsList"; // Disabled temporarily
import PetOfWeekHomeSection from './PetOfWeekHomeSection';
import BottomBarSection from './BottomBarSection';

const STRINGS = {
  en: {
    welcome: "Welcome to PetPoint! Everything your beloved pets need",
    info: "Baghdad / Atifiya - Near Gas Station\n📞 07759659992",
    shopBy: "Shop by Pet Type",
    freeBaghdad: "Free delivery in Baghdad\non purchases worth 50,000 IQD or more",
    nav: ["App", "My Pets", "Cart", "Orders", "Profile"],
    logout: "Log Out",
    pet: ["Cats", "Dogs", "Birds", "Fishes"],
    animals: {
      cats: "Cats",
      dogs: "Dogs",
      birds: "Birds",
      fishes: "Fishes",
    },
    lang: "العربية",
  },
  ar: {
    welcome: "أهلاً بك في PetPoint! كل ما يحتاجه حيوانك الأليف",
    info: "بغداد / العطيفية - قرب محطة الوقود\n📞 07759659992",
    shopBy: "تسوق حسب النوع",
    freeBaghdad: "توصيل مجاني في بغداد عند الشراء بـ 50,000 دينار أو أكثر",
    nav: ["التطبيق", "حيواناتي", "السلة", "الطلبات", "الملف"],
    logout: "تسجيل الخروج",
    pet: ["قطط", "كلاب", "طيور", "أسماك"],
    animals: {
      cats: "قطط",
      dogs: "كلاب",
      birds: "طيور",
      fishes: "أسماك",
    },
    lang: "EN",
  },
};
const animalEmoji = [
  { key: "cats", emoji: "😺" },
  { key: "dogs", emoji: "🐶" },
  { key: "birds", emoji: "🐦" },
  { key: "fishes", emoji: "🐟" },
];

// Animal icon image URLs - use Pexels images for now
const emojiIcons = {
  cats: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&w=64&h=64&fit=crop",
  dogs: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=64&h=64&fit=crop",
  birds: "https://images.pexels.com/photos/45911/peacock-bird-plumage-color-45911.jpeg?auto=compress&w=64&h=64&fit=crop",
  fishes: "https://images.pexels.com/photos/128756/pexels-photo-128756.jpeg?auto=compress&w=64&h=64&fit=crop",
  truck: "https://images.pexels.com/photos/163743/pexels-photo-163743.jpeg?auto=compress&w=64&h=64&fit=crop"
};

const logoUrl =
  "https://firebasestorage.googleapis.com:443/v0/b/steercode.firebasestorage.app/o/users%2FiygOBjok3mfXWlnlubS014iaV973%2Fattachments%2F42421820-9642-4471-85E0-2ACD14E5A76C.png?alt=media&token=f53044d2-b59c-4c6b-9781-bbcf98914cb1";

interface HomeScreenProps {
  lang: "en" | "ar";
  onChangeLang: (lang: "en" | "ar") => void;
  onSelectAnimal: (animalKey: string) => void;
  onEnterAdmin: () => void;
  onSignOut?: () => void;
  onGotoCart?: () => void;
  onGotoOrders?: () => void;
  onGotoProfile?: () => void;
  onRequireLoginForOrder?: () => void; // New prop to handle login requirement on order
}

export default function HomeScreen({
  lang,
  onChangeLang,
  onSelectAnimal,
  onEnterAdmin,
  onSignOut,
  onGotoCart,
  onGotoOrders,
  onGotoProfile,
  onRequireLoginForOrder,
}: HomeScreenProps) {
  const t = STRINGS[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  const { width: screenWidth } = useWindowDimensions();
  // Responsive sizing
  const gridItemWidth = Math.max(64, Math.min(88, (screenWidth - 32 - 12) / 4)); // padding 16*2 and small gaps
  const animalEmojiSize = screenWidth < 340 ? 26 : screenWidth < 400 ? 30 : 32;
  const animalLabelSize = screenWidth < 340 ? 10 : 11;
  const bannerEmojiSize = screenWidth < 340 ? 24 : 29;
  const bottomPadding = screenWidth < 360 ? 96 : 88;
  const logoTapCount = useRef(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  // const [petModalVisible, setPetModalVisible] = useState(false); // Disabled temporarily

  const handleLogoTap = () => {
    logoTapCount.current += 1;
    if (logoTapCount.current === 5) {
      logoTapCount.current = 0;
      onEnterAdmin && onEnterAdmin();
    } else {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      tapTimeout.current = setTimeout(() => {
        logoTapCount.current = 0;
      }, 1200);
    }
  };

  // Wrapper for cart press to require login only when ordering
  const handleCartPress = () => {
    if (onRequireLoginForOrder) {
      onRequireLoginForOrder();
    } else {
      onGotoCart && onGotoCart();
    }
  };

  // My Pets list view disabled temporarily
  // if (petModalVisible) {
  //   return (
  //     <View className="flex-1 bg-[#DFECCB] px-4 pt-8">
  //       <View className="absolute top-8 right-5 z-20">
  //         <TouchableOpacity onPress={() => onChangeLang(lang === "en" ? "ar" : "en") }>
  //           <Text className="text-base font-bold text-[#FF7300]">{t.lang}</Text>
  //         </TouchableOpacity>
  //       </View>
  //       <MyPetsList lang={lang} onClose={() => setPetModalVisible(false)} />
  //     </View>
  //   );
  // }
  return (
    <View className={`flex-1 bg-[#DFECCB] px-3 pt-7 ${dir==='rtl'?'rtl':''}`}> 
      {/* Top-bar language switch removed as per requirement */}
      <ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom: bottomPadding}}> 
        {/* Welcoming Section: center for Arabic */}
        <View className="w-full flex items-center mb-4 mt-0 min-h-[105px]">
          <View style={{backgroundColor:'#FF7300',borderRadius:19,borderWidth:0,shadowColor:'#c1c1c1',shadowOpacity:0.12,shadowOffset:{width:0,height:3},shadowRadius:7,elevation:4,paddingTop:14,paddingBottom:9,paddingHorizontal:13,alignItems:'center',width:'100%',maxWidth:410,justifyContent:'center',flexDirection:'column'}}>
            <Image
              source={{ uri: logoUrl }}
              style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 6 }}
              resizeMode="contain"
              onTouchEnd={handleLogoTap}
            />
            <Text
              className={`font-semibold text-white ${lang==='ar'?'font-arabic':''} ${dir==='rtl'?'text-right':'text-center'}`}
              style={{fontSize: 12, lineHeight:18, textAlign:'center', width:'100%'}}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.9}
            >
              {t.welcome}
            </Text>
          </View>
        </View>
        {/* Pet Icons Row: smaller/more space - fits أسماك */}
        <View className="mb-1 px-2">
          <Text className={`font-extrabold text-black mb-0.5 ${dir === "rtl" ? "text-right" : "text-left"} ${lang==='ar'?'font-arabic':''}`}
            style={{ fontSize: screenWidth < 340 ? 14 : 15 }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.9}
          >
            {t.shopBy}
          </Text>
          <View className={`flex-row justify-between gap-x-1 mt-1 items-end ${dir==='rtl'?'flex-row-reverse':''}`}> 
            {[{ key: "cats", emoji: "🐱" },
              { key: "dogs", emoji: "🐶" },
              { key: "birds", emoji: "🐦" },
              { key: "fishes", emoji: "🐠" }
            ].map((a, i) => (
              <TouchableOpacity
                onPress={() => onSelectAnimal(a.key)}
                key={a.key}
                style={{ width: gridItemWidth, alignItems: 'center', paddingVertical: 2 }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: animalEmojiSize, marginBottom: 3 }}>
                  {a.emoji}
                </Text>
                <Text
                  className={`font-bold text-black mt-1 ${lang==='ar'?'font-arabic':''}`}
                  style={{ fontSize: animalLabelSize, maxWidth: gridItemWidth - 6, textAlign:'center' }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {t.animals[a.key]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Free Delivery Banner: responsive for AR */}
        <View className="mt-3 mb-3 rounded-2xl px-3 py-3 flex-row items-center shadow-sm justify-between" style={{ backgroundColor: "#FCEED8", maxWidth: 430, flexDirection:dir==='rtl'?'row-reverse':'row' }}>
          <Text className={`text-black font-semibold leading-5 flex-1 pr-2 ${dir === "rtl" ? "text-right" : "text-left"} ${lang==='ar'?'font-arabic':''}`}
            style={{ fontSize: screenWidth < 360 ? 12 : 13 }}
            numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.85}>
            {t.freeBaghdad}
          </Text>
          <Text style={{ fontSize: bannerEmojiSize, marginLeft: dir==='rtl'?0:10, marginRight: dir==='rtl'?10:0 }}>🚛</Text>
        </View>
        {/* Pet of the Week just below promo banner */}
        <PetOfWeekHomeSection lang={lang} />
        {/* Spacer */}
        <View style={{height:24}} />
      </ScrollView>
      {/* Bottom Nav: more space, Arabic font, vertical gap, full RTL */}
      {/* My Pets tab disabled temporarily */}
      {/* {[// {icon:'🐾', label:t.nav[1]||'My Pets', onPress:()=>setPetModalVisible(true)},
          {icon:'🛒', label:t.nav[2]||'Cart', onPress:handleCartPress},
          {icon:'📦', label:t.nav[3]||'Orders', onPress:onGotoOrders},
          {icon:'👤', label:t.nav[4]||'Profile', onPress:onGotoProfile}
        ].map((item, idx)=>(
          <TouchableOpacity
            onPress={item.onPress}
            key={item.label}
            style={{flex:1,alignItems:'center',justifyContent:'flex-end',minWidth:53}} activeOpacity={0.8}
          >
            <Text style={{fontSize:21, marginBottom:2}}>{item.icon}</Text>
            <Text className={`text-[11px] font-semibold ${lang==='ar'?'font-arabic':''} text-[#232] mt-[5px]`} numberOfLines={1} style={{textAlign:'center',maxWidth:65}}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))} */}
      {/* Bottom Navigation with language switcher */}
      <BottomBarSection
        lang={lang}
        active="home"
        onTab={(key)=>{
          if (key==='cart') onGotoCart && onGotoCart();
          if (key==='orders') onGotoOrders && onGotoOrders();
          if (key==='profile') onGotoProfile && onGotoProfile();
        }}
        onToggleLang={() => onChangeLang(lang === 'en' ? 'ar' : 'en')}
      />
    </View>
  );
}