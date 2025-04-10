import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * 注册推送通知token并设置通知处理程序
 * @param projectId - Expo项目ID，在iOS设备上必须提供（在bare workflow中）
 * @returns 推送通知token和通知处理相关的状态和方法
 */
export function useNotifications(projectId?: string) {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // 初始化配置通知
    setupNotifications();
    
    // 注册推送通知的设备令牌
    registerForPushNotificationsAsync(projectId).then(token => setExpoPushToken(token));

    // 监听收到的通知
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // 监听用户对通知的响应
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('收到通知响应:', response);
      // 这里可以添加处理通知点击的逻辑
    });

    return () => {
      // 清理监听器
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // 配置通知行为
  const setupNotifications = async () => {
    // 设置通知处理程序
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  };

  // 发送本地测试通知的方法
  const schedulePushNotification = async (
    title: string = '测试通知标题',
    body: string = '测试通知内容',
    data: object = { data: '测试数据' }
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
      },
      trigger: null, // 立即显示通知
    });
  };

  return {
    expoPushToken,
    notification,
    schedulePushNotification,
  };
}

/**
 * 注册推送通知并获取设备令牌
 * @param projectId - Expo项目ID，在bare workflow中必须提供
 * @returns 设备推送令牌
 */
async function registerForPushNotificationsAsync(projectId?: string): Promise<string | undefined> {
  let token;
  
  // 检查是否为物理设备
  if (Device.isDevice) {
    // 检查通知权限
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    // 如果没有权限则请求权限
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    // 如果用户拒绝了权限
    if (finalStatus !== 'granted') {
      console.log('未获取通知权限!');
      return undefined;
    }
    
    try {
      // 获取设备推送令牌
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: projectId, // 在iOS设备上必须提供projectId
      })).data;
      console.log('Expo推送令牌:', token);
    } catch (error) {
      console.error('获取推送令牌失败:', error);
    }
  } else {
    console.log('必须使用物理设备才能接收推送通知');
  }

  // iOS需要额外配置
  if (Platform.OS === 'ios') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
