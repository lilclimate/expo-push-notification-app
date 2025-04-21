import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, Alert, TouchableOpacity, FlatList, Text, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { articlesService, Article } from '@/app/api/articles';

type TabType = 'posts' | 'collects' | 'likes';

export default function ProfileScreen() {
  const { user, isLoading: authLoading, accessToken, refreshTokenIfNeeded } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  
  // 添加 useEffect 来处理token刷新
  useEffect(() => {
    if (user && accessToken) {
      // 在组件挂载时尝试检查并刷新token
      refreshTokenIfNeeded();
    }
  }, [user, accessToken, refreshTokenIfNeeded]);
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchMyArticles = useCallback(async (currentPage: number, shouldRefresh: boolean = false) => {
    if (!accessToken) return;
    
    try {
      const data = await articlesService.getMyArticles(currentPage, 10, accessToken);
      
      if (shouldRefresh) {
        setArticles(data.articles);
      } else {
        setArticles(prev => [...prev, ...data.articles]);
      }
      
      setHasMoreData(data.articles.length === 10);
    } catch (error) {
      console.error('获取文章错误:', error);
      Alert.alert('错误', '获取文章失败，请检查网络连接');
    }
  }, [accessToken]);

  // 初始加载
  useEffect(() => {
    if (user && activeTab === 'posts') {
      setIsLoading(true);
      fetchMyArticles(1, true).finally(() => setIsLoading(false));
    }
  }, [user, activeTab, fetchMyArticles]);

  const handleRefresh = useCallback(async () => {
    if (activeTab !== 'posts') return;
    
    setIsRefreshing(true);
    setPage(1);
    await fetchMyArticles(1, true);
    setIsRefreshing(false);
  }, [activeTab, fetchMyArticles]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreData || activeTab !== 'posts') return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchMyArticles(nextPage);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMoreData, page, activeTab, fetchMyArticles]);

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'posts') {
      setIsLoading(true);
      setPage(1);
      fetchMyArticles(1, true).finally(() => setIsLoading(false));
    }
  };

  const navigateToSettings = () => {
    router.push('/(modals)/settings');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          <ThemedText style={styles.loadingText}>加载中...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!user) {
    // 如果用户未登录，导航到登录页面
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.notLoggedInContainer}>
          <ThemedText style={styles.notLoggedInText}>请先登录</ThemedText>
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={() => router.push('/(modals)/login')}
          >
            <Text style={styles.buttonText}>去登录</Text>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const renderArticleItem = ({ item }: { item: Article }) => (
    <Link href={{ pathname: "/article-details", params: { id: item._id } }} asChild>
      <TouchableOpacity style={styles.articleItem}>
        <ThemedView style={styles.articleContent}>
          <ThemedText style={styles.articleTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.articleExcerpt} numberOfLines={3}>
            {item.content}
          </ThemedText>
          <View style={styles.articleMeta}>
            <ThemedText style={styles.articleDate}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
        </ThemedView>
        
        {item.images && item.images.length > 0 && (
          <View style={styles.articleImageContainer}>
            <Image 
              source={{ uri: item.images[0] }} 
              style={styles.articleImage} 
              resizeMode="cover"
            />
          </View>
        )}
      </TouchableOpacity>
    </Link>
  );
  
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors[colorScheme].tint} />
        <ThemedText style={styles.footerText}>加载更多...</ThemedText>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <IconSymbol name="doc.text" size={64} color={Colors[colorScheme].tabIconDefault} />
        <ThemedText style={styles.emptyText}>
          {activeTab === 'posts' ? '您还没有发布任何文章' : 
           activeTab === 'collects' ? '您还没有收藏任何内容' : 
           '您还没有点赞任何内容'}
        </ThemedText>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部个人信息区域 */}
      <ThemedView style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</ThemedText>
          </View>
          <TouchableOpacity style={styles.avatarEditButton}>
            <IconSymbol name="plus" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.profileInfo}>
          <ThemedText style={styles.username}>{user.username}</ThemedText>
          <ThemedText style={styles.userIdText}>ID: {user.id}</ThemedText>
          
          <ThemedText style={styles.location}>
            <IconSymbol name="location" size={14} color={Colors[colorScheme].text} />
            {' 广东深圳'}
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>27</ThemedText>
            <ThemedText style={styles.statLabel}>关注</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>142</ThemedText>
            <ThemedText style={styles.statLabel}>粉丝</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{articles.length}</ThemedText>
            <ThemedText style={styles.statLabel}>文章</ThemedText>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]}
            onPress={() => router.push('/(modals)/create-article')}
          >
            <ThemedText style={styles.actionButtonText}>发布文章</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={navigateToSettings}
          >
            <IconSymbol name="gearshape" size={18} color={Colors[colorScheme].text} />
          </TouchableOpacity>
        </View>
      </ThemedView>
      
      {/* 标签页 */}
      <ThemedView style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'posts' && styles.activeTab
          ]}
          onPress={() => handleTabPress('posts')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              activeTab === 'posts' && styles.activeTabText
            ]}
          >
            文章
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'collects' && styles.activeTab
          ]}
          onPress={() => handleTabPress('collects')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              activeTab === 'collects' && styles.activeTabText
            ]}
          >
            收藏
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'likes' && styles.activeTab
          ]}
          onPress={() => handleTabPress('likes')}
        >
          <ThemedText 
            style={[
              styles.tabText, 
              activeTab === 'likes' && styles.activeTabText
            ]}
          >
            点赞
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
      
      {/* 标签页内容 */}
      <FlatList
        data={activeTab === 'posts' ? articles : []}
        renderItem={renderArticleItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors[colorScheme].tint]}
            tintColor={Colors[colorScheme].tint}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
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
  notLoggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notLoggedInText: {
    fontSize: 18,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHeader: {
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 5,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F9A826',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    marginBottom: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userIdText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    opacity: 0.7,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    marginRight: 24,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  secondaryButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  articleItem: {
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff', // 使用固定颜色以确保黑暗模式下也能看清
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  articleContent: {
    flex: 1,
    padding:
    16,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: 12,
  },
  articleMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  articleDate: {
    fontSize: 12,
    opacity: 0.5,
  },
  articleImageContainer: {
    width: 80,
    backgroundColor: '#f0f0f0',
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 