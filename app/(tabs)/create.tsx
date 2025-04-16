import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

// 这个页面只是一个占位符，永远不会被直接访问
// 点击标签栏的加号按钮时，会直接导航到创建文章的模态页面
export default function CreatePlaceholderScreen() {
  useEffect(() => {
    // 如果用户通过某种方式直接访问了这个页面，重定向到文章列表页
    router.replace('/(tabs)/articles');
  }, []);

  return <View />;
} 