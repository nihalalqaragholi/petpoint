import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface Props {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (url: string) => void;
  lang?: 'en' | 'ar';
}

export default function ImageUrlModal({ visible, onCancel, onSubmit, lang = 'en' }: Props) {
  const [url, setUrl] = useState('');
  if (!visible) return null;
  const cleaned = url.trim();
  const isValid = /^https:\/\//i.test(cleaned);
  const t = {
    title: lang === 'ar' ? 'رابط الصورة' : 'Image URL',
    placeholder: lang === 'ar' ? 'الصق رابط الصورة هنا (https فقط)' : 'Paste image URL here (https only)',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    save: lang === 'ar' ? 'حفظ' : 'Save',
  };
  return (
    <View className="absolute inset-0 bg-black/40 items-center justify-center px-6">
      <View className="w-full bg-white rounded-2xl p-4">
        <Text className="text-lg font-bold text-black mb-3 text-center">{t.title}</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          placeholder={t.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          className="bg-gray-100 rounded-xl px-3 py-2 text-black mb-3"
        />
        <View className="flex-row justify-end gap-x-2">
          <TouchableOpacity className="px-4 py-2 rounded-xl bg-gray-200" onPress={onCancel}>
            <Text className="text-black font-semibold">{t.cancel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl ${isValid ? 'bg-[#C0DC17]' : 'bg-gray-300'}`}
            disabled={!isValid}
            onPress={() => {
              const encoded = encodeURI(cleaned);
              onSubmit(encoded);
              setUrl('');
            }}
          >
            <Text className="text-[#36543C] font-bold">{t.save}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}