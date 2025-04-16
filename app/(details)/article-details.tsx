import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  View
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
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

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Article {
  _id: string;
  title: string;
  content: string;
  images: string[];
  isDeleted: boolean;
  userId: User;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ArticleResponse {
  message: string;
  data: Article;
}

export default function ArticleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    const fetchArticleDetails = async () => {
      if (!id) {
        Alert.alert('错误', '文章ID不存在');
        return;
      }

      setIsLoading(true);

      try {
        const apiUrl = `${getApiBaseUrl()}/api/articles/${id}`;
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (accessToken) {
          headers['Authorization'] = `Bearer ${accessToken}`;
        }

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers,
        });

        const data: ArticleResponse = await response.json();

        if (response.ok) {
          setArticle(data.data);
        } else {
          Alert.alert('错误', data.message || '获取文章详情失败');
        }
      } catch (error) {
        console.error('获取文章详情错误:', error);
        Alert.alert('错误', '网络错误，请检查网络连接');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id, accessToken]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={styles.loadingText}>加载中...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>文章不存在或已被删除</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>{article.title}</ThemedText>
          
          <View style={styles.metaContainer}>
            <ThemedText style={styles.author}>
              作者: {article.userId.username}
            </ThemedText>
            <ThemedText style={styles.date}>
              {formatDate(article.createdAt)}
            </ThemedText>
          </View>
          
          <ThemedText style={styles.articleContent}>
            {article.content}
          </ThemedText>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  author: {
    fontSize: 14,
    opacity: 0.7,
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 24,
  },
}); 