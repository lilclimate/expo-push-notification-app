import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ProfileScreen() {
  const { user, isLoading, login, register, logout } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
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
    
    if (!success) {
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
    
    if (!success) {
      Alert.alert('注册失败', '请检查您的输入信息并重试');
    }
  };
  
  const handleLogout = () => {
    logout();
    setUsername('');
    setEmail('');
    setPassword('');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
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
  
  if (user) {
    // 已登录状态
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <ThemedView style={styles.profileContainer}>
            <ThemedText style={styles.title}>我的资料</ThemedText>
            <ThemedText style={styles.userInfo}>用户名: {user.username}</ThemedText>
            <ThemedText style={styles.userInfo}>邮箱: {user.email}</ThemedText>
            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]} 
              onPress={handleLogout}
            >
              <Text style={styles.buttonText}>退出登录</Text>
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  // 未登录状态
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <ThemedView style={styles.authContainer}>
          <ThemedText style={styles.title}>
            {isRegistering ? '注册账号' : isLoggingIn ? '登录账号' : '欢迎使用'}
          </ThemedText>
          
          {!isRegistering && !isLoggingIn ? (
            // 选择登录或注册
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.loginButton]} 
                onPress={() => setIsLoggingIn(true)}
              >
                <Text style={styles.buttonText}>登录</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.button, styles.registerButton]} 
                onPress={() => setIsRegistering(true)}
              >
                <Text style={styles.buttonText}>注册</Text>
              </TouchableOpacity>
            </View>
          ) : isRegistering ? (
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
              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => {
                    setIsRegistering(false);
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setShowPassword(false);
                  }}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>取消</Text>
                </TouchableOpacity>
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
              <View style={styles.buttonsContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => {
                    setIsLoggingIn(false);
                    setEmail('');
                    setPassword('');
                    setShowPassword(false);
                  }}
                  disabled={submitting}
                >
                  <Text style={styles.buttonText}>取消</Text>
                </TouchableOpacity>
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
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
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
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    borderRadius: 12,
    marginTop: 50,
  },
  profileContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 12,
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
    marginBottom: 16,
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
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '45%',
  },
  loginButton: {
    backgroundColor: '#0a7ea4',
  },
  registerButton: {
    backgroundColor: '#28a745',
  },
  submitButton: {
    backgroundColor: '#0a7ea4',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 24,
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