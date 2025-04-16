import { Stack } from 'expo-router';
import React from 'react';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: true }}>
      <Stack.Screen 
        name="create-article" 
        options={{ 
          title: '发布文章',
          headerTitleAlign: 'center'
        }} 
      />
    </Stack>
  );
} 