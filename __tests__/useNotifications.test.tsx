import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useNotifications } from '../hooks/useNotifications';

// 模拟expo-notifications模块
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  removeNotificationSubscription: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

// 模拟expo-device模块
jest.mock('expo-device', () => ({
  isDevice: true,
}));

describe('useNotifications Hook 测试', () => {
  // 在每个测试前重置所有模拟
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 测试用例1: 测试Hook是否正确初始化（happy path）
  test('应该正确初始化通知处理程序和监听器', async () => {
    // 模拟获取权限的返回值
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'test-expo-push-token' });

    // 渲染hook
    const { result, waitForNextUpdate } = renderHook(() => useNotifications());
    
    // 等待异步操作完成
    await waitForNextUpdate();
    
    // 断言: 验证设置通知处理程序的函数被调用
    expect(Notifications.setNotificationHandler).toHaveBeenCalled();
    
    // 断言: 验证添加通知监听器的函数被调用
    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    
    // 断言: 验证token被正确设置
    expect(result.current.expoPushToken).toBe('test-expo-push-token');
  });

  // 测试用例2: 测试发送本地通知功能（happy path）
  test('应该能够发送本地通知', async () => {
    // 模拟通知权限
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockResolvedValue({ data: 'test-expo-push-token' });
    
    // 渲染hook
    const { result, waitForNextUpdate } = renderHook(() => useNotifications());
    
    // 等待异步操作完成
    await waitForNextUpdate();
    
    // 调用发送通知方法
    await act(async () => {
      await result.current.schedulePushNotification('测试标题', '测试内容', { testData: 'test' });
    });
    
    // 断言: 验证调度通知的函数被正确调用，并且参数正确
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        title: '测试标题',
        body: '测试内容',
        data: { testData: 'test' }
      },
      trigger: null
    });
  });

  // 测试用例3: 测试在没有通知权限的情况下的行为（bad path）
  test('当用户拒绝通知权限时，应该处理正确', async () => {
    // 模拟没有获得通知权限
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    
    // 监视console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // 渲染hook
    const { result, waitForNextUpdate } = renderHook(() => useNotifications());
    
    // 等待异步操作完成
    await waitForNextUpdate();
    
    // 断言: 验证获取权限的函数被调用
    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    
    // 断言: 验证token是undefined
    expect(result.current.expoPushToken).toBeUndefined();
    
    // 断言: 验证console.log被调用，记录没有权限的信息
    expect(consoleSpy).toHaveBeenCalledWith('未获取通知权限!');
    
    consoleSpy.mockRestore();
  });

  // 测试用例4: 测试在非物理设备上的行为（bad path）
  test('在模拟器或web环境中无法获取推送令牌', async () => {
    // 重新模拟设备判断为非物理设备
    (Device.isDevice as jest.Mock) = jest.fn().mockReturnValue(false);
    
    // 监视console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    // 渲染hook
    const { result, waitForNextUpdate } = renderHook(() => useNotifications());
    
    // 等待异步操作完成
    await waitForNextUpdate();
    
    // 断言: 验证token是undefined
    expect(result.current.expoPushToken).toBeUndefined();
    
    // 断言: 验证console.log被调用，记录需要物理设备的信息
    expect(consoleSpy).toHaveBeenCalledWith('必须使用物理设备才能接收推送通知');
    
    consoleSpy.mockRestore();
    
    // 恢复Device.isDevice为true，避免影响其他测试
    (Device.isDevice as jest.Mock) = jest.fn().mockReturnValue(true);
  });
});
