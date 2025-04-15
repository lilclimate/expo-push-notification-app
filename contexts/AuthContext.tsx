import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 获取API基本URL
const getApiBaseUrl = () => {
  // 在真机上测试时，需要使用实际的IP地址而不是localhost
  // 在生产环境中，这应该是您的API服务器地址
  if (Platform.OS === 'android') {
    // Android模拟器使用10.0.2.2连接到主机上的localhost
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    // iOS模拟器使用localhost直接连接
    return 'http://localhost:3000';
  }
  return 'http://localhost:3000';
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isLoading: true,
  });

  useEffect(() => {
    // 当组件加载时从 AsyncStorage 中加载认证状态
    const loadAuthState = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (userString && accessToken && refreshToken) {
          setState({
            user: JSON.parse(userString),
            accessToken,
            refreshToken,
            isLoading: false,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load auth state from storage', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
  }, []);

  const saveAuthState = async (user: User | null, accessToken: string | null, refreshToken: string | null) => {
    try {
      if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem('user');
      }

      if (accessToken) {
        await AsyncStorage.setItem('accessToken', accessToken);
      } else {
        await AsyncStorage.removeItem('accessToken');
      }

      if (refreshToken) {
        await AsyncStorage.setItem('refreshToken', refreshToken);
      } else {
        await AsyncStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Failed to save auth state to storage', error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const apiUrl = `${getApiBaseUrl()}/api/auth/login`;
      console.log('登录API地址:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const { user, accessToken, refreshToken } = data;
        setState(prev => ({
          ...prev,
          user,
          accessToken,
          refreshToken,
        }));
        await saveAuthState(user, accessToken, refreshToken);
        return true;
      } else {
        console.error('登录失败:', data.message);
        return false;
      }
    } catch (error) {
      console.error('登录错误:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const apiUrl = `${getApiBaseUrl()}/api/auth/register`;
      console.log('注册API地址:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 根据你的API，注册成功后可能会直接返回用户和令牌
        // 如果是这样，可以直接从响应中获取
        if (data.user && data.accessToken && data.refreshToken) {
          setState(prev => ({
            ...prev,
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          }));
          await saveAuthState(data.user, data.accessToken, data.refreshToken);
          return true;
        }
        
        // 否则，重新登录
        return await login(email, password);
      } else {
        console.error('注册失败:', data.message);
        return false;
      }
    } catch (error) {
      console.error('注册错误:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // 如果有refreshToken，调用退出登录API
      if (state.refreshToken) {
        const apiUrl = `${getApiBaseUrl()}/api/auth/logout`;
        console.log('退出登录API地址:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: state.refreshToken }),
        });
        
        if (!response.ok) {
          console.error('退出登录API调用失败');
        }
      }
    } catch (error) {
      console.error('退出登录错误:', error);
    } finally {
      // 无论API调用是否成功，都清除本地存储的认证状态
      setState(prev => ({
        ...prev,
        user: null,
        accessToken: null,
        refreshToken: null,
      }));
      await saveAuthState(null, null, null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 