import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  View,
  RefreshControl,
  Alert,
  DeviceEventEmitter
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { Platform } from 'react-native';
import { REFRESH_ARTICLES_EVENT } from '@/app/(modals)/create-article';

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

interface ArticlesResponse {
  message: string;
  data: {
    articles: Article[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export default function ArticlesScreen() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { accessToken } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';

  const fetchArticles = useCallback(async (currentPage: number, refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else if (currentPage === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const apiUrl = `${getApiBaseUrl()}/api/articles?page=${currentPage}&limit=10`;
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

      const data: ArticlesResponse = await response.json();

      if (response.ok) {
        if (refresh || currentPage === 1) {
          setArticles(data.data.articles);
        } else {
          setArticles((prev) => [...prev, ...data.data.articles]);
        }
        setTotalPages(data.data.pagination.totalPages);
      } else {
        Alert.alert('错误', data.message || '获取文章列表失败');
      }
    } catch (error) {
      console.error('获取文章列表错误:', error);
      Alert.alert('错误', '网络错误，请检查网络连接');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchArticles(1);

    // 监听刷新事件
    const subscription = DeviceEventEmitter.addListener(
      REFRESH_ARTICLES_EVENT,
      () => {
        console.log('收到刷新文章列表事件');
        setPage(1);
        fetchArticles(1, true);
      }
    );

    // 组件卸载时移除监听
    return () => {
      subscription.remove();
    };
  }, [fetchArticles]);

  const handleRefresh = () => {
    setPage(1);
    fetchArticles(1, true);
  };

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchArticles(nextPage);
    }
  };

  const handleArticlePress = (articleId: string) => {
    router.push({
      pathname: "/(details)/article-details",
      params: { id: articleId }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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

  if (articles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>暂无文章</ThemedText>
          <TouchableOpacity 
            style={styles.emptyButton}
            onPress={handleRefresh}
          >
            <ThemedText style={styles.emptyButtonText}>刷新</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.articleItem}
            onPress={() => handleArticlePress(item._id)}
          >
            <ThemedView style={styles.articleCard}>
              <ThemedText style={styles.articleTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.articleContent} numberOfLines={2}>
                {item.content}
              </ThemedText>
              <View style={styles.articleFooter}>
                <ThemedText style={styles.articleAuthor}>
                  作者: {item.userId.username}
                </ThemedText>
                <ThemedText style={styles.articleDate}>
                  {formatDate(item.createdAt)}
                </ThemedText>
              </View>
            </ThemedView>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors[colorScheme].tint]}
            tintColor={Colors[colorScheme].tint}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={Colors[colorScheme].tint} />
              <ThemedText style={styles.footerText}>加载更多...</ThemedText>
            </View>
          ) : page >= totalPages && articles.length > 0 ? (
            <View style={styles.footerLoading}>
              <ThemedText style={styles.footerText}>没有更多文章了</ThemedText>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#0a7ea4',
    padding: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  articleItem: {
    marginBottom: 16,
  },
  articleCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleContent: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  articleAuthor: {
    fontSize: 12,
    opacity: 0.7,
  },
  articleDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  footerLoading: {
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
  },
}); 