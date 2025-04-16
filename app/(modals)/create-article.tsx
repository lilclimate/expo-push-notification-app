import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Platform } from 'react-native';

// 获取API基本URL
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  }
  return 'http://localhost:3000';
};

export default function CreateArticleScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { accessToken } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  const handlePublish = async () => {
    if (!title.trim()) {
      Alert.alert('错误', '标题不能为空');
      return;
    }

    if (!content.trim()) {
      Alert.alert('错误', '内容不能为空');
      return;
    }

    if (!accessToken) {
      Alert.alert('错误', '请先登录');
      router.push('/(tabs)/profile');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = `${getApiBaseUrl()}/api/articles`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title,
          content
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('成功', '文章发布成功', [
          { text: '确定', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('错误', data.message || '发布失败，请重试');
      }
    } catch (error) {
      console.error('发布文章错误:', error);
      Alert.alert('错误', '网络错误，请检查网络连接');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <TextInput
          style={styles.titleInput}
          placeholder="请输入标题..."
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="请输入正文内容..."
          placeholderTextColor="#999"
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>取消</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.publishButton, isSubmitting && styles.disabledButton]} 
          onPress={handlePublish}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>发布</Text>
          )}
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    color: '#333',
  },
  contentInput: {
    flex: 1,
    fontSize: 16,
    padding: 16,
    minHeight: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  publishButton: {
    backgroundColor: '#0a7ea4',
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 