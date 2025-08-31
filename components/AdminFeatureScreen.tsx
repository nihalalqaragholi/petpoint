import { View, Text, TouchableOpacity } from "react-native";

export default function AdminFeatureScreen({
  title,
  onClose,
  children,
  lang = "en"
}) {
  return (
    <View className="absolute inset-0 z-50 bg-[#F4FAEE] px-2 pt-9 pb-2 flex-1">
      <View className="flex-row justify-between items-center mb-2">
        <TouchableOpacity onPress={onClose} className="p-2 bg-white/90 rounded-full">
          <Text className="text-2xl font-bold text-black">×</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-2xl font-extrabold text-black text-center mr-7">{title}</Text>
      </View>
      <View className="flex-1 w-full h-full">
        {children}
      </View>
    </View>
  );
}
