import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import GoogleIcon from '@/components/ui/GoogleIcon';

export default function LoginScreen() {
  const { login, register, getGoogleAuthUrl, handleGoogleCallback } = useAuth();
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // 表单状态
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const colorScheme = useColorScheme() ?? 'light';
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }
    
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    
    if (success) {
      router.back();
    } else {
      Alert.alert('登录失败', '请检查您的邮箱和密码是否正确');
    }
  };
  
  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }
    
    setSubmitting(true);
    const success = await register(username, email, password);
    setSubmitting(false);
    
    if (success) {
      router.back();
    } else {
      Alert.alert('注册失败', '请检查您的输入信息并重试');
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const handleBack = () => {
    router.back();
  };

  // 处理Google登录
  const handleGoogleLogin = async () => {
    try {
      setSubmitting(true);
      const googleAuthUrl = await getGoogleAuthUrl();
      
      if (!googleAuthUrl) {
        Alert.alert('错误', '获取Google登录链接失败');
        setSubmitting(false);
        return;
      }
      
      // 添加URL回调监听
      const handleUrl = async (event: { url: string }) => {
        const { url } = event;
        
        // 检查URL是否包含我们应用的回调URL和授权码
        if (url.includes('auth/google/callback')) {
          // 从URL中提取授权码
          const code = url.split('code=')[1]?.split('&')[0];
          
          if (code) {
            // 处理Google登录回调
            const success = await handleGoogleCallback(code);
            
            if (success) {
              router.back();
            } else {
              Alert.alert('登录失败', 'Google登录认证失败');
            }
          }
        }
      };
      
      // 添加URL事件监听器
      const subscription = Linking.addEventListener('url', handleUrl);
      
      // 打开Google登录页面
      await Linking.openURL(googleAuthUrl);
      
      setSubmitting(false);
      
      // 注册完成后记得移除监听器
      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error('Google登录错误:', error);
      setSubmitting(false);
      Alert.alert('错误', '启动Google登录失败');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>
          {isRegistering ? '注册' : '登录'}
        </ThemedText>
        <View style={styles.placeholder} />
      </ThemedView>

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.authContainer}>
          {isRegistering ? (
            // 注册表单
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="用户名"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor="#999"
              />
              <TextInput
                style={styles.input}
                placeholder="邮箱"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="密码"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle} 
                  onPress={togglePasswordVisibility}
                >
                  <IconSymbol 
                    size={24} 
                    name={showPassword ? "eye.slash" : "eye"} 
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.button, styles.submitButton, submitting && styles.disabledButton]} 
                onPress={handleRegister}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>注册</Text>
                )}
              </TouchableOpacity>
              
              <View style={styles.switchContainer}>
                <ThemedText style={styles.switchText}>已有账号？</ThemedText>
                <TouchableOpacity onPress={() => setIsRegistering(false)}>
                  <ThemedText style={styles.switchButton}>去登录</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.googleButton}
                  onPress={handleGoogleLogin}
                  disabled={submitting}
                >
                  <GoogleIcon size={20} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // 登录表单
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="邮箱"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="密码"
                  value={password}
                  onChangeText={setPassword}
                  placeholderTextColor="#999"
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle} 
                  onPress={togglePasswordVisibility}
                >
                  <IconSymbol 
                    size={24} 
                    name={showPassword ? "eye.slash" : "eye"} 
                    color={Colors[colorScheme].icon}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.button, styles.submitButton, submitting && styles.disabledButton]} 
                onPress={handleLogin}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>登录</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.googleLoginButton, submitting && styles.disabledButton]} 
                onPress={handleGoogleLogin}
                disabled={submitting}
              >
                <View style={styles.googleButtonContent}>
                  <GoogleIcon size={20} />
                  <Text style={styles.googleButtonText}>使用Google账号登录</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.switchContainer}>
                <ThemedText style={styles.switchText}>没有账号？</ThemedText>
                <TouchableOpacity onPress={() => setIsRegistering(true)}>
                  <ThemedText style={styles.switchButton}>去注册</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#333',
  },
  passwordToggle: {
    padding: 10,
    marginRight: 5,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
  },
  switchButton: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginLeft: 5,
  },
  googleLoginButton: {
    backgroundColor: 'white',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  googleButton: {
    marginLeft: 10,
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    width: 30, 
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  }
}); 