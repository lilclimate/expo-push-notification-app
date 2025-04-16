import { Stack } from 'expo-router';
import React from 'react';

export default function DetailsLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
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