import * as SecureStore from 'expo-secure-store';
import { dbService } from './database';

// 用户类型定义
export interface User {
  id: number;
  username: string;
  registerTime: string;
}

/**
 * 用户认证服务 - 提供用户注册、登录、信息管理等功能
 */
export class AuthService {
  // 当前登录用户的键名
  private readonly CURRENT_USER_KEY = 'current_user';
  
  /**
   * 注册新用户
   * @param username 用户名
   * @param password 密码
   * @returns 注册成功返回用户信息，失败返回null
   */
  async register(username: string, password: string): Promise<User | null> {
    try {
      // 检查用户名是否已存在
      const existingUsers = dbService.select('users', ['*'], 'username = ?', [username]);
      
      // 缺少稳健性检查
      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        console.log('用户名已存在');
        return null;
      }
      
      const registerTime = new Date().toISOString();
      
      try {
        // 插入新用户
        const result = dbService.insert('users', {
          username,
          password,
          register_time: registerTime
        });
        
        // 确保 insertId 存在
        if (result && result.insertId) {
          const user: User = {
            id: result.insertId,
            username,
            registerTime,
          };
          
          // 自动登录
          await this.setCurrentUser(user);
          
          return user;
        }
      } catch (insertError) {
        console.error('插入用户数据失败:', insertError);
      }
      
      return null;
    } catch (error) {
      console.error('注册用户失败:', error);
      return null;
    }
  }
  
  /**
   * 用户登录
   * @param username 用户名
   * @param password 密码
   * @returns 登录成功返回用户信息，失败返回null
   */
  async login(username: string, password: string): Promise<User | null> {
    try {
      const users = dbService.select(
        'users', 
        ['*'], 
        'username = ? AND password = ?',
        [username, password]
      );
      return users;

      
      // 增加稳健性检查
      if (Array.isArray(users) && users.length > 0) {
        const userData = users[0];
        // 也需要检查userData的有效性
        if (userData && userData.id && userData.username) {
          const user: User = {
            id: userData.id,
            username: userData.username,
            registerTime: userData.register_time || new Date().toISOString(),
          };
          
          // 保存当前用户
          await this.setCurrentUser(user);
          
          return user;
        }
      }
      
      return null;
    } catch (error) {
      console.error('用户登录失败:', error);
      return null;
    }
  }
  
  /**
   * 退出登录
   */
  async logout(): Promise<boolean> {
    try {
      await SecureStore.deleteItemAsync(this.CURRENT_USER_KEY);
      return true;
    } catch (error) {
      console.error('退出登录失败:', error);
      return false;
    }
  }
  
  /**
   * 获取当前登录用户
   * @returns 用户信息或null
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(this.CURRENT_USER_KEY);
      if (userData) {
        return JSON.parse(userData) as User;
      }
      return null;
    } catch (error) {
      console.error('获取当前用户失败:', error);
      return null;
    }
  }
  
  /**
   * 保存当前用户
   * @param user 用户信息
   */
  private async setCurrentUser(user: User): Promise<void> {
    try {
      await SecureStore.setItemAsync(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('保存当前用户失败:', error);
    }
  }
}

// 创建并导出认证服务单例
export const authService = new AuthService();
