import { jest } from '@jest/globals';
import apiService from '@/app/api/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// 模拟依赖
jest.mock('@react-native-async-storage/async-storage', () => ({
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

// 模拟 fetch 全局函数
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('apiService', () => {
  beforeEach(() => {
    // 重置所有模拟
    jest.resetAllMocks();
    console.error = jest.fn();
  });

  describe('处理无效或过期的令牌', () => {
    it('应该在响应中包含"无效或过期的令牌"消息时清除用户状态并重定向', async () => {
      // 模拟响应
      const mockJsonPromise = Promise.resolve({ message: '无效或过期的令牌' });
      const mockFetchPromise = Promise.resolve({
        ok: false,
        json: () => mockJsonPromise,
      } as Response);
      
      (global.fetch as jest.Mock).mockReturnValue(mockFetchPromise);

      // 尝试进行一个 API 请求
      await expect(apiService.get('https://api.example.com/data', { token: 'invalid-token' }))
        .rejects.toThrow('无效或过期的令牌');

      // 验证是否清除了认证状态
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('user');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('refreshToken');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('accessTokenExpiresAt');

      // 验证是否重定向到个人页面
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/profile');
    });

    it('应该在响应中包含"invalid token"消息时清除用户状态并重定向', async () => {
      // 模拟响应
      const mockJsonPromise = Promise.resolve({ message: 'invalid token' });
      const mockFetchPromise = Promise.resolve({
        ok: false,
        json: () => mockJsonPromise,
      } as Response);
      
      (global.fetch as jest.Mock).mockReturnValue(mockFetchPromise);

      // 尝试进行一个 API 请求
      await expect(apiService.get('https://api.example.com/data', { token: 'invalid-token' }))
        .rejects.toThrow('invalid token');

      // 验证是否清除了认证状态
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(4);
      
      // 验证是否重定向到个人页面
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/profile');
    });

    it('应该在 HTTP 状态码为 401 时清除用户状态并重定向', async () => {
      // 模拟响应
      const mockJsonPromise = Promise.resolve({ message: '未授权' });
      const mockFetchPromise = Promise.resolve({
        ok: false,
        status: 401,
        json: () => mockJsonPromise,
      } as Response);
      
      (global.fetch as jest.Mock).mockReturnValue(mockFetchPromise);

      // 尝试进行一个 API 请求
      await expect(apiService.get('https://api.example.com/data', { token: 'invalid-token' }))
        .rejects.toThrow('未授权');

      // 验证是否清除了认证状态
      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(4);
      
      // 验证是否重定向到个人页面
      expect(router.replace).toHaveBeenCalledWith('/(tabs)/profile');
    });

    it('不应该在其他错误情况下清除用户状态或重定向', async () => {
      // 模拟响应
      const mockJsonPromise = Promise.resolve({ message: '资源未找到' });
      const mockFetchPromise = Promise.resolve({
        ok: false,
        status: 404,
        json: () => mockJsonPromise,
      } as Response);
      
      (global.fetch as jest.Mock).mockReturnValue(mockFetchPromise);

      // 尝试进行一个 API 请求
      await expect(apiService.get('https://api.example.com/data', { token: 'valid-token' }))
        .rejects.toThrow('资源未找到');

      // 验证没有清除认证状态
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
      
      // 验证没有重定向
      expect(router.replace).not.toHaveBeenCalled();
    });
  });
}); 