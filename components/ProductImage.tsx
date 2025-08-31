import React, { useState } from 'react';
import { View, Image, Text, ViewStyle, TouchableOpacity } from 'react-native';

interface Props {
  uri?: string;
  size: number;
  className?: string;
  style?: ViewStyle;
}

export default function ProductImage({ uri, size, className, style }: Props) {
  const [failed, setFailed] = useState(false);

  const retry = () => {
    setFailed(false);
  };
  if (!uri || failed) {
    return (
      <View style={{ width: size, height: size, borderRadius: 16, ...(style as any) }} className={`bg-[#ececec] items-center justify-center ${className || ''}`}>        
        <Text className="text-2xl text-gray-300 mb-2">🖼️</Text>
        {failed && (
          <>
            <Text className="text-xs text-red-600 mb-2">Image failed to load</Text>
            <TouchableOpacity onPress={retry} className="px-3 py-1 bg-[#C0DC17] rounded-xl">
              <Text className="text-sm font-semibold text-[#36543C]">Retry</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: 16, ...(style as any) }}
      className={className}
      onError={(e) => {
        console.log('[ProductImage] Load failed for', uri, e.nativeEvent?.error || e);
        setFailed(true);
      }}
    />
  );
}