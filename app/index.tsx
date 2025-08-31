import { useState } from "react";
import HomeScreen from "../components/HomeScreen";
import CategoryScreen from "../components/CategoryScreen";
import ProductListScreen from "../components/ProductListScreen";
import AdminScreen from "../components/AdminScreen";
import SMSLoginScreen from "../components/SMSLoginScreen";
import CartScreen from "../components/CartScreen";
import OrdersScreen from "../components/OrdersScreen";
import ProfileScreen from "../components/ProfileScreen";
import FoodSubCategoryScreen from "../components/FoodSubCategoryScreen";
import AdminLoginScreen from "../components/AdminLoginScreen";
import { useAnimalNavigation } from "../components/useAnimalNavigation";
import { supabase } from "../lib/supabase";
import { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const [lang, setLang] = useState<"en" | "ar">("en");
  // Load saved language once
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('app_lang');
      if (saved === 'en' || saved === 'ar') setLang(saved);
    })();
  }, []);
  // Persist on change
  useEffect(() => {
    AsyncStorage.setItem('app_lang', lang).catch(() => {});
  }, [lang]);
  const [user, setUser] = useState(null); // user = phone
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminSession, setAdminSession] = useState(null);
  const [currentView, setCurrentView] = useState("home"); // home, cart, orders, profile
  const {
    screen,
    selectedAnimal,
    selectedCategory,
    foodParent,
    foodSub,
    gotoHome,
    gotoCategory,
    gotoFoodSubCategory,
    selectFoodParent,
    selectFoodSub,
    gotoProducts,
  } = useAnimalNavigation();

  // Cart manipulation logic
  const [cart, setCart] = useState([]); // [{id, name, img, price, qty}]
  const addToCart = (prod) => {
    setCart((arr) => {
      const idx = arr.findIndex((i) => i.id === prod.id);
      if (idx !== -1) {
        // Already in cart: increment quantity
        return arr.map((i, j) => (j === idx ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...arr, { ...prod, qty: 1 }];
    });
  };
  const updateCartQty = (id, diff) =>
    setCart((a) =>
      a.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + diff) } : i))
    );
  const removeFromCart = (id) => setCart((a) => a.filter((i) => i.id !== id));

  // Handle admin login modal
  const handleAdminLogin = async (email, password) => {
    try {
      // First try Supabase email/password auth
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.user) {
        const theUser = data.user;
        const isAdmin = !!(
          theUser?.user_metadata?.is_admin || theUser?.app_metadata?.is_admin
        );
        if (isAdmin) {
          setAdminSession(data.session);
          setShowAdminLogin(false);
          setCurrentView("admin");
          return { success: true };
        }
        // Not marked admin – continue to table-based fallback
      }
    } catch (e) {
      console.log('[AdminLogin] Auth error', e?.message || e);
      // continue to fallback
    }

    // Fallback: check custom admins table (phone/username + password)
    try {
      const identifier = (email || '').trim(); // can be phone or username
      const pass = (password || '').trim();
      const { data: admins, error: adminErr } = await supabase
        .from('admins')
        .select('*')
        .eq('phone', identifier)
        .eq('password', pass)
        .limit(1);
      if (adminErr) {
        console.log('[AdminLogin] Admin table error', adminErr.message);
      }
      if (admins && admins.length === 1) {
        setAdminSession({ local: true, admin_id: admins[0].id });
        setShowAdminLogin(false);
        setCurrentView("admin");
        return { success: true };
      }
      return { error: lang === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials' };
    } catch (e) {
      console.log('[AdminLogin] Fallback error', e?.message || e);
      return { error: (lang === 'ar' ? 'فشل الاتصال: ' : 'Failed to fetch: ') + (e?.message || '') };
    }
  };

  // Logout admin
  const handleAdminLogout = () => {
    setAdminSession(null);
    setCurrentView("home");
  };

  // Cart/Orders routes take priority over main nav screens
  // Remove login requirement: Only show login if showLogin=true
  if (showLogin) {
    return (
      <SMSLoginScreen
        lang={lang}
        setLang={setLang}
        onLogin={(u) => {
          setUser(u);
          setShowLogin(false);
        }}
        onBack={() => setShowLogin(false)}
      />
    );
  }
  if (showAdminLogin) {
    // Render AdminLoginScreen; temporary simple modal
    return (
      <AdminLoginScreen
        lang={lang}
        onSuccess={handleAdminLogin}
        onBack={() => setShowAdminLogin(false)}
      />
    );
  }
  if (currentView === "admin" && adminSession) {
    return (
      <AdminScreen
        lang={lang}
        setLang={setLang}
        onExitAdmin={handleAdminLogout}
      />
    );
  }

  if (currentView === "cart") {
    return (
      <CartScreen
        lang={lang}
        setLang={setLang}
        onBack={() => setCurrentView("home")}
        cart={cart}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
      />
    );
  }
  if (currentView === "orders") {
    // Require login for orders
    if (!user) {
      setShowLogin(true);
      return null;
    }
    return (
      <OrdersScreen
        lang={lang}
        setLang={setLang}
        onBack={() => setCurrentView("home")}
      />
    );
  }
  if (currentView === "profile") {
    // Require login for profile
    if (!user) {
      setShowLogin(true);
      return null;
    }
    return (
      <ProfileScreen
        lang={lang}
        setLang={setLang}
        onBack={() => setCurrentView("home")}
        onSignOut={() => {
          setUser(null);
          setShowLogin(true);
        }}
        onEnterAdmin={() => setShowAdminLogin(true)}
      />
    );
  }

  // Re-enabled: show categories/products when an animal is selected
  if (screen === "category" && selectedAnimal) {
    return (
      <CategoryScreen
        animal={selectedAnimal}
        lang={lang}
        setLang={setLang}
        onSelectCategory={(cat) => {
          if (cat === "food") gotoFoodSubCategory();
          else gotoProducts(selectedAnimal, cat);
        }}
        onBack={gotoHome}
      />
    );
  }

  if (screen === "foodsubcategory" && selectedAnimal) {
    return (
      <FoodSubCategoryScreen
        lang={lang}
        parent={foodParent}
        onBack={() =>
          foodParent ? selectFoodParent(null) : gotoCategory(selectedAnimal)
        }
        onSelect={(choice) => {
          if (!foodParent && (choice === "dry" || choice === "wet"))
            selectFoodParent(choice);
          else if (foodParent && typeof choice === "string") selectFoodSub(choice);
        }}
      />
    );
  }

  if (screen === "products" && selectedAnimal && selectedCategory) {
    const isFoodSub =
      typeof selectedCategory === "string" &&
      (selectedCategory.startsWith("dry.") || selectedCategory.startsWith("wet."));
    return (
      <ProductListScreen
        animal={selectedAnimal}
        category={selectedCategory}
        lang={lang}
        setLang={setLang}
        onBack={() => {
          if (isFoodSub) {
            gotoFoodSubCategory();
          } else {
            gotoCategory(selectedAnimal);
          }
        }}
        addToCart={addToCart}
        updateCartQty={updateCartQty}
        removeFromCart={removeFromCart}
        cart={cart}
      />
    );
  }

  // Home
  return (
    <HomeScreen
      lang={lang}
      setLang={setLang}
      onChangeLang={setLang}
      onSelectAnimal={(animalKey) => gotoCategory(animalKey)} // This will not navigate to My Pet as category screen is disabled
      // This now triggers admin login modal
      onEnterAdmin={() => setShowAdminLogin(true)}
      onSignOut={() => {
        setUser(null);
        setShowLogin(true);
      }}
      onGotoCart={() => setCurrentView("cart")}
      onGotoOrders={() => setCurrentView("orders")}
      onGotoProfile={() => setCurrentView("profile")}
      onLogin={() => setShowLogin(true)}
    />
  );
}