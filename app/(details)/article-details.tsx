import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  View,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { articlesService, Article } from '@/app/api/articles';

export default function ArticleDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, accessToken } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();

  useEffect(() => {
    const fetchArticleDetails = async () => {
      if (!id) {
        Alert.alert('错误', '文章ID不存在');
        return;
      }

      setIsLoading(true);

      try {
        const articleData = await articlesService.getArticleDetails(id, accessToken || undefined);
        setArticle(articleData);
      } catch (error) {
        console.error('获取文章详情错误:', error);
        Alert.alert('错误', '获取文章详情失败，请检查网络连接');
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

  // 处理作者点击事件
  const handleAuthorPress = () => {
    if (!article) return;
    
    // 检查作者是否是当前登录用户
    if (user && user.id === article.userId._id) {
      // 如果是当前用户，跳转到个人中心
      router.push('/(tabs)/profile');
    } else {
      // 否则跳转到作者主页
      router.push({
        pathname: '/(details)/user-profile',
        params: { userId: article.userId._id }
      });
    }
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
            <TouchableOpacity onPress={handleAuthorPress}>
              <ThemedText style={[styles.author, styles.authorLink]}>
                作者: {article.userId.username}
              </ThemedText>
            </TouchableOpacity>
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
  authorLink: {
    color: Colors.light.tint,
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