import { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

/**
 * 用户界面页面 - 显示用户信息或登录/注册界面
 */
export default function MeScreen() {
  const { user, isLoading, login, register, logout } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  // 切换登录/注册模式
  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
  };

  // 处理登录/注册
  const handleSubmit = async () => {
    // 表单验证
    if (!username || !password) {
      setError('用户名和密码不能为空');
      return;
    }

    setError('');
    setProcessing(true);

    try {
      let result;
      if (isLoginMode) {
        // 登录
        result = await login(username, password);
        if (!result) {
          setError('用户名或密码错误');
        }
      } else {
        // 注册
        result = await register(username, password);
        if (!result) {
          setError('用户名已存在或注册失败');
        }
      }
    } catch (err) {
      console.error('认证错误:', err);
      setError('操作失败，请重试');
    } finally {
      setProcessing(false);
    }
  };

  // 退出登录
  const handleLogout = async () => {
    setProcessing(true);
    try {
      await logout();
    } catch (err) {
      console.error('退出失败:', err);
    } finally {
      setProcessing(false);
    }
  };

  // 格式化注册时间
  const formatDateTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateTimeString;
    }
  };

  // 加载中视图
  if (isLoading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <ThemedText style={styles.loadingText}>加载中...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F2F6FF', dark: '#202639' }}
      headerImage={
        <IconSymbol
          size={260}
          color="#808080"
          name="person.circle.fill"
          style={styles.headerImage}
        />
      }>
      {user ? (
        // 已登录 - 显示用户信息
        <ThemedView style={styles.container}>
          <ThemedView style={styles.profileHeader}>
            <IconSymbol size={80} name="person.circle.fill" color="#0066FF" />
            <ThemedText type="title">{user.username}</ThemedText>
            
            {/* 退出登录按钮移到用户名旁边 */}
            <TouchableOpacity
              style={styles.headerLogoutButton}
              onPress={handleLogout}
              disabled={processing}>
              {processing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedView style={styles.logoutButtonContent}>
                  <IconSymbol size={16} name="arrow.right.square" color="#FFFFFF" />
                  <ThemedText style={styles.headerLogoutText}>退出</ThemedText>
                </ThemedView>
              )}
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.infoCard}>
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>账号:</ThemedText>
              <ThemedText style={styles.infoValue}>{user.username}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>用户ID:</ThemedText>
              <ThemedText style={styles.infoValue}>{user.id}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.infoRow}>
              <ThemedText style={styles.infoLabel}>注册时间:</ThemedText>
              <ThemedText style={styles.infoValue}>
                {formatDateTime(user.registerTime)}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* 保留底部的大按钮作为备用 */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={processing}>
            {processing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>退出登录</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      ) : (
        // 未登录 - 显示登录/注册表单
        <ThemedView style={styles.container}>
          <ThemedText type="title">
            {isLoginMode ? '登录账号' : '注册新账号'}
          </ThemedText>

          {error ? (
            <ThemedView style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </ThemedView>
          ) : null}

          <ThemedView style={styles.formContainer}>
            <ThemedText>用户名:</ThemedText>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="请输入用户名"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <ThemedText style={styles.inputLabel}>密码:</ThemedText>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="请输入密码"
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              disabled={processing}>
              {processing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.buttonText}>
                  {isLoginMode ? '登录' : '注册'}
                </ThemedText>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
              <ThemedText style={styles.toggleText}>
                {isLoginMode ? '没有账号? 注册新账号' : '已有账号? 登录'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      )}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  headerImage: {
    opacity: 0.2,
    bottom: -70,
    right: -40,
    position: 'absolute',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    width: '100%',
  },
  headerLogoutButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 102, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 80,
  },
  infoValue: {
    flex: 1,
  },
  formContainer: {
    marginTop: 20,
  },
  inputLabel: {
    marginTop: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF0000',
  },
  errorText: {
    color: '#FF0000',
  },
  submitButton: {
    backgroundColor: '#0066FF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: '#0066FF',
  },
});
