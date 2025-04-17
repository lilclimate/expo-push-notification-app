import { Stack } from 'expo-router';
import React from 'react';

export default function ModalsLayout() {
  return (
    <Stack 
      screenOptions={{ 
        presentation: 'modal', 
        headerShown: false,
        headerTitle: " ",
      }}
    >
      <Stack.Screen 
        name="create-article" 
        options={{ 
          title: '发布文章',
          headerTitleAlign: 'center',
          headerShown: true
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          headerShown: false
        }} 
      />
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
} 