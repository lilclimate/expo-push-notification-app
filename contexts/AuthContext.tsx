import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '@/services/auth';

// 认证上下文类型
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供器属性
interface AuthProviderProps {
  children: ReactNode;
}

// 认证提供器组件
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('加载用户信息失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // 登录方法
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const loggedInUser = await authService.login(username, password);
      if (loggedInUser) {
        setUser(loggedInUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  // 注册方法
  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const newUser = await authService.register(username, password);
      if (newUser) {
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('注册失败:', error);
      return false;
    }
  };

  // 登出方法
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 提供认证上下文值
  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义Hook，用于访问认证上下文
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth必须在AuthProvider内部使用');
  }
  return context;
};
