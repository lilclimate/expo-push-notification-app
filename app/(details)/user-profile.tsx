import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert, TouchableOpacity, FlatList, Text, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { articlesService, userService } from '@/app/api';
import { Article } from '@/app/api/articles';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'posts' | 'collects' | 'likes';

// 简化的用户信息类型
interface UserInfo {
  id: string;
  username: string;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const { user: currentUser, accessToken } = useAuth();
  
  const [user, setUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // 添加关注相关状态
  const [followStats, setFollowStats] = useState({ following: 0, followers: 0 });
  const [followStatus, setFollowStatus] = useState<number>(0);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [isProcessingFollow, setIsProcessingFollow] = useState(false);

  // 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!userId) {
        Alert.alert('错误', '用户ID不存在');
        router.back();
        return;
      }

      setIsLoading(true);

      try {
        // 这里应该调用获取用户信息的API
        // 当前仅使用文章中的userId信息作为演示
        const articlesData = await articlesService.getUserArticles(userId, 1, 1, accessToken || undefined);
        if (articlesData.articles.length > 0) {
          const userData = articlesData.articles[0].userId;
          setUser({
            id: userData._id,
            username: userData.username
          });
        } else {
          // 如果没有文章，可能需要另一个API来获取用户信息
          Alert.alert('提示', '无法获取用户信息');
          router.back();
        }
      } catch (error) {
        console.error('获取用户信息错误:', error);
        Alert.alert('错误', '获取用户信息失败，请检查网络连接');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [userId, router, accessToken]);

  // 获取用户文章
  const fetchUserArticles = useCallback(async (currentPage: number, shouldRefresh: boolean = false) => {
    if (!userId) return;
    
    try {
      const data = await articlesService.getUserArticles(userId, currentPage, 10, accessToken || undefined);
      
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
  }, [userId, accessToken]);

  // 获取关注和粉丝数据
  useEffect(() => {
    const fetchFollowStats = async () => {
      if (!userId) return;
      
      try {
        const data = await userService.getFollowCount(userId, accessToken || undefined);
        setFollowStats({
          following: data.following,
          followers: data.followers
        });
      } catch (error) {
        console.error('获取关注数据错误:', error);
      }
    };

    fetchFollowStats();
  }, [userId, accessToken]);

  // 获取关注状态
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!userId || !currentUser) return;
      
      try {
        const data = await userService.getFollowStatus(userId, accessToken || undefined);
        setFollowStatus(data.relationType);
      } catch (error) {
        console.error('获取关注状态错误:', error);
      }
    };

    fetchFollowStatus();
  }, [userId, currentUser, accessToken]);

  // 处理关注/取消关注
  const handleFollowAction = async () => {
    if (!currentUser || !userId || isProcessingFollow) {
      return;
    }

    setIsProcessingFollow(true);
    try {
      // 判断当前状态
      if (followStatus === 0 || followStatus === 2) {
        // 未关注或被关注状态，执行关注操作
        await userService.followUser(userId, accessToken || '');
        // 更新状态
        setFollowStatus(followStatus === 0 ? 1 : 3);
        // 增加粉丝数
        setFollowStats(prev => ({
          ...prev,
          followers: prev.followers + 1
        }));
      } else {
        // 已关注或互相关注状态，执行取消关注操作
        await userService.unfollowUser(userId, accessToken || '');
        // 更新状态
        setFollowStatus(followStatus === 1 ? 0 : 2);
        // 减少粉丝数
        setFollowStats(prev => ({
          ...prev,
          followers: prev.followers - 1
        }));
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      Alert.alert('错误', '关注操作失败，请稍后再试');
    } finally {
      setIsProcessingFollow(false);
    }
  };

  // 获取关注按钮文本
  const getFollowButtonText = () => {
    if (followStatus === 0 || followStatus === 2) {
      return '关注';
    } else {
      return '取消关注';
    }
  };

  // 初始加载
  useEffect(() => {
    if (user && activeTab === 'posts') {
      setIsLoading(true);
      fetchUserArticles(1, true).finally(() => setIsLoading(false));
    }
  }, [user, activeTab, fetchUserArticles]);

  const handleRefresh = useCallback(async () => {
    if (activeTab !== 'posts') return;
    
    setIsRefreshing(true);
    setPage(1);
    await fetchUserArticles(1, true);
    setIsRefreshing(false);
  }, [activeTab, fetchUserArticles]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreData || activeTab !== 'posts') return;
    
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchUserArticles(nextPage);
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMoreData, page, activeTab, fetchUserArticles]);

  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'posts') {
      setIsLoading(true);
      setPage(1);
      fetchUserArticles(1, true).finally(() => setIsLoading(false));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // 检查是否为当前登录用户
  const isCurrentUser = currentUser && user && currentUser.id === user.id;

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

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.notFoundContainer}>
          <ThemedText style={styles.notFoundText}>用户不存在或已被删除</ThemedText>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>返回</Text>
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
          {activeTab === 'posts' ? '该用户还没有发布任何文章' : 
           activeTab === 'collects' ? '该用户还没有收藏任何内容' : 
           '该用户还没有点赞任何内容'}
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
            <ThemedText style={styles.statNumber}>{followStats.following}</ThemedText>
            <ThemedText style={styles.statLabel}>关注</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{followStats.followers}</ThemedText>
            <ThemedText style={styles.statLabel}>粉丝</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statNumber}>{articles.length}</ThemedText>
            <ThemedText style={styles.statLabel}>文章</ThemedText>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          {/* 如果不是当前登录用户，显示关注按钮 */}
          {!isCurrentUser && currentUser && (
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                styles.primaryButton,
                isProcessingFollow && styles.disabledButton
              ]}
              onPress={handleFollowAction}
              disabled={isProcessingFollow}
            >
              <ThemedText style={styles.actionButtonText}>
                {isProcessingFollow ? '处理中...' : getFollowButtonText()}
              </ThemedText>
            </TouchableOpacity>
          )}
          
          {/* 如果是当前登录用户，显示跳转到个人中心的按钮 */}
          {isCurrentUser && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryButton]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <ThemedText style={styles.actionButtonText}>前往个人中心</ThemedText>
            </TouchableOpacity>
          )}
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
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    marginBottom: 20,
  },
  backButton: {
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
    borderRadius: 20,
    marginRight: 12,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  secondaryButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  articleItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingBottom: 16,
  },
  articleContent: {
    flex: 1,
    marginRight: 12,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleExcerpt: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  articleImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  disabledButton: {
    opacity: 0.7,
  },
}); 