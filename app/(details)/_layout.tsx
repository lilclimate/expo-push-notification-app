import { Stack, router } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function DetailsLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  
  return (
    <Stack screenOptions={{ 
      headerShown: true,
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ marginLeft: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="chevron-back" 
            size={28} 
            color={Colors[colorScheme].text} 
          />
        </TouchableOpacity>
      )
    }}>
      <Stack.Screen 
        name="article-details" 
        options={{ 
          title: '文章详情',
          headerTitleAlign: 'center'
        }} 
      />
    </Stack>
  );
} 