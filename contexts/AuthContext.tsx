import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '@/app/api';
import { API_ENDPOINTS } from '@/app/api';
import googleAuthService from '@/app/api/auth/google';

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
  refreshTokenExpiresAt: number | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshTokenIfNeeded: () => Promise<boolean>;
  getGoogleAuthUrl: () => Promise<string>;
  handleGoogleCallback: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    accessTokenExpiresAt: null,
    refreshTokenExpiresAt: null,
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

  // 设置自动检查token的定时器 (每小时检查一次)
  const setupRefreshTimer = () => {
    clearRefreshTimer();
    
    // 设置1小时的定时器 (3600000毫秒)
    const ONE_HOUR = 3600000;
    console.log(`定时器将在1小时后检查token状态: ${new Date(Date.now() + ONE_HOUR).toLocaleString()}`);
    
    refreshTimerRef.current = setTimeout(() => {
      checkAndRefreshTokenIfNeeded();
    }, ONE_HOUR);
  };
  
  // 检查并刷新token (如果需要)
  const checkAndRefreshTokenIfNeeded = async () => {
    // 检查用户是否存在
    if (!state.user || !state.refreshToken || !state.refreshTokenExpiresAt) {
      // 重新设置定时器继续检查
      setupRefreshTimer();
      return;
    }
    
    const now = Date.now();
    const refreshTokenExpiresIn = state.refreshTokenExpiresAt - now;
    
    // 如果refreshToken还有不到1小时过期
    if (refreshTokenExpiresIn < 3600000) {
      console.log('refreshToken即将过期，尝试刷新');
      await refreshTokenIfNeeded();
    } else {
      // 重新设置定时器继续检查
      setupRefreshTimer();
    }
  };

  useEffect(() => {
    // 当组件加载时从 AsyncStorage 中加载认证状态
    const loadAuthState = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const accessTokenExpiresAtString = await AsyncStorage.getItem('accessTokenExpiresAt');
        const refreshTokenExpiresAtString = await AsyncStorage.getItem('refreshTokenExpiresAt');
        
        const accessTokenExpiresAt = accessTokenExpiresAtString ? parseInt(accessTokenExpiresAtString) : null;
        const refreshTokenExpiresAt = refreshTokenExpiresAtString ? parseInt(refreshTokenExpiresAtString) : null;

        if (userString && accessToken && refreshToken && accessTokenExpiresAt && refreshTokenExpiresAt) {
          setState({
            user: JSON.parse(userString),
            accessToken,
            refreshToken,
            accessTokenExpiresAt,
            refreshTokenExpiresAt,
            isLoading: false,
          });
          
          // 设置定时检查token的定时器
          setupRefreshTimer();
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
    accessTokenExpiresAt: number | null,
    refreshTokenExpiresAt: number | null
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
      
      if (refreshTokenExpiresAt) {
        await AsyncStorage.setItem('refreshTokenExpiresAt', refreshTokenExpiresAt.toString());
      } else {
        await AsyncStorage.removeItem('refreshTokenExpiresAt');
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
      // 假设refreshToken的有效期是30天，这里需要根据实际后端设置调整
      const refreshTokenExpiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);
      
      setState(prev => ({
        ...prev,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt,
      }));
      
      await saveAuthState(
        state.user, 
        accessToken, 
        refreshToken, 
        accessTokenExpiresAt,
        refreshTokenExpiresAt
      );
      
      // 设置下一次检查的定时器
      setupRefreshTimer();
      
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
      
      const { user, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = data;
      
      // 如果后端没有返回refreshTokenExpiresAt，则自行设置为30天
      const calculatedRefreshTokenExpiresAt = refreshTokenExpiresAt || Date.now() + (30 * 24 * 60 * 60 * 1000);
      
      setState(prev => ({
        ...prev,
        user,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt: calculatedRefreshTokenExpiresAt,
      }));
      
      await saveAuthState(
        user, 
        accessToken, 
        refreshToken, 
        accessTokenExpiresAt,
        calculatedRefreshTokenExpiresAt
      );
      
      // 设置定时检查token的定时器
      setupRefreshTimer();
      
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
        // 如果后端没有返回refreshTokenExpiresAt，则自行设置为30天
        const refreshTokenExpiresAt = data.refreshTokenExpiresAt || Date.now() + (30 * 24 * 60 * 60 * 1000);
        
        setState(prev => ({
          ...prev,
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          accessTokenExpiresAt: data.accessTokenExpiresAt,
          refreshTokenExpiresAt,
        }));
        
        await saveAuthState(
          data.user, 
          data.accessToken, 
          data.refreshToken, 
          data.accessTokenExpiresAt,
          refreshTokenExpiresAt
        );
        
        // 设置定时检查token的定时器
        setupRefreshTimer();
        
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
      // 清除定时器
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
        refreshTokenExpiresAt: null,
      }));
      await saveAuthState(null, null, null, null, null);
    }
  };

  // 获取Google登录URL
  const getGoogleAuthUrl = async (): Promise<string> => {
    try {
      const data = await googleAuthService.getGoogleAuthUrl();
      return data.url;
    } catch (error) {
      if (error instanceof Error) {
        console.error('获取Google登录URL错误:', error.message);
      } else {
        console.error('获取Google登录URL错误:', error);
      }
      return '';
    }
  };

  // 处理Google登录回调
  const handleGoogleCallback = async (code: string): Promise<boolean> => {
    try {
      console.log('处理Google登录回调');
      const data = await googleAuthService.googleAuthCallback(code);
      
      const { user, accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt } = data;
      
      // 如果后端没有返回refreshTokenExpiresAt，则自行设置为30天
      const calculatedRefreshTokenExpiresAt = refreshTokenExpiresAt || Date.now() + (30 * 24 * 60 * 60 * 1000);
      
      setState(prev => ({
        ...prev,
        user,
        accessToken,
        refreshToken,
        accessTokenExpiresAt,
        refreshTokenExpiresAt: calculatedRefreshTokenExpiresAt,
      }));
      
      await saveAuthState(
        user, 
        accessToken, 
        refreshToken, 
        accessTokenExpiresAt,
        calculatedRefreshTokenExpiresAt
      );
      
      // 设置定时检查token的定时器
      setupRefreshTimer();
      
      return true;
    } catch (error) {
      console.error('Google登录错误:', error);
      return false;
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
        getGoogleAuthUrl,
        handleGoogleCallback,
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