import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/app/api/auth';
import { API_ENDPOINTS } from '@/app/api';

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
  accessTokenExpiresAt: number | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshTokenIfNeeded: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    isLoading: true,
  });
  
  // 使用 useRef 来跟踪刷新token的定时器
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清除定时器的函数
  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  // 设置自动刷新token的定时器
  const setupRefreshTimer = (expiresAt: number) => {
    clearRefreshTimer();
    
    // 获取当前时间戳（毫秒）
    const now = Date.now();
    
    // 计算过期前一小时的时间点（毫秒）
    const refreshTime = expiresAt - (60 * 60 * 1000);
    
    // 如果已经过了刷新时间，立即刷新
    if (now >= refreshTime) {
      refreshTokenIfNeeded();
      return;
    }
    
    // 否则，设置定时器在过期前一小时刷新
    const timeoutDuration = refreshTime - now;
    console.log(`Token将在 ${new Date(refreshTime).toLocaleString()} 刷新`);
    
    refreshTimerRef.current = setTimeout(() => {
      refreshTokenIfNeeded();
    }, timeoutDuration);
  };

  useEffect(() => {
    // 当组件加载时从 AsyncStorage 中加载认证状态
    const loadAuthState = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const expiresAtString = await AsyncStorage.getItem('accessTokenExpiresAt');
        const accessTokenExpiresAt = expiresAtString ? parseInt(expiresAtString) : null;

        if (userString && accessToken && refreshToken && accessTokenExpiresAt) {
          setState({
            user: JSON.parse(userString),
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
            isLoading: false,
          });
          
          // 设置刷新token的定时器
          setupRefreshTimer(accessTokenExpiresAt);
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load auth state from storage', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuthState();
    
    // 组件卸载时清除定时器
    return () => {
      clearRefreshTimer();
    };
  }, []);

  const saveAuthState = async (
    user: User | null, 
    accessToken: string | null, 
    refreshToken: string | null, 
    accessTokenExpiresAt: number | null
  ) => {
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
      
      if (accessTokenExpiresAt) {
        await AsyncStorage.setItem('accessTokenExpiresAt', accessTokenExpiresAt.toString());
      } else {
        await AsyncStorage.removeItem('accessTokenExpiresAt');
      }
    } catch (error) {
      console.error('Failed to save auth state to storage', error);
    }
  };
  
  // 刷新token的函数
  const refreshTokenIfNeeded = async (): Promise<boolean> => {
    if (!state.refreshToken) {
      return false;
    }
    
    try {
      const data = await authService.refreshToken(state.refreshToken);
      
      const { accessToken, refreshToken, accessTokenExpiresAt } = data;
      
      setState(prev => ({
        ...prev,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
      }));
      
      await saveAuthState(state.user, accessToken, refreshToken, accessTokenExpiresAt);
      
      // 设置下一次刷新的定时器
      setupRefreshTimer(accessTokenExpiresAt);
      
      console.log('Token已成功刷新');
      return true;
    } catch (error: any) {
      console.error('刷新Token错误:', error);
      
      // 如果刷新token失败，并且返回"无效或过期的刷新令牌"
      if (error.message?.includes('无效或过期的刷新令牌')) {
        console.error('刷新令牌无效或已过期，清除登录状态');
        await logout();
      }
      
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('调用登录API');
      
      const data = await authService.login(email, password);
      
      const { user, accessToken, refreshToken, accessTokenExpiresAt } = data;
      
      setState(prev => ({
        ...prev,
        user,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
      }));
      
      await saveAuthState(user, accessToken, refreshToken, accessTokenExpiresAt);
      
      // 设置刷新token的定时器
      setupRefreshTimer(accessTokenExpiresAt);
      
      return true;
    } catch (error) {
      console.error('登录错误:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('调用注册API');
      
      const data = await authService.register(username, email, password);

      if (data.user && data.accessToken && data.refreshToken && data.accessTokenExpiresAt) {
        setState(prev => ({
          ...prev,
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          accessTokenExpiresAt: data.accessTokenExpiresAt,
        }));
        
        await saveAuthState(
          data.user, 
          data.accessToken, 
          data.refreshToken, 
          data.accessTokenExpiresAt
        );
        
        // 设置刷新token的定时器
        setupRefreshTimer(data.accessTokenExpiresAt);
        
        return true;
      }
      
      // 否则，重新登录
      return await login(email, password);
    } catch (error) {
      console.error('注册错误:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // 清除刷新token的定时器
      clearRefreshTimer();
      
      // 如果有refreshToken，调用退出登录API
      if (state.refreshToken) {
        try {
          await authService.logout(state.refreshToken);
        } catch (error) {
          console.error('退出登录API调用失败', error);
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
        accessTokenExpiresAt: null,
      }));
      await saveAuthState(null, null, null, null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshTokenIfNeeded,
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