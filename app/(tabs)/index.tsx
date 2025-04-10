import { Image, StyleSheet, Platform, TouchableOpacity, ScrollView } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNotifications } from '@/hooks/useNotifications';

export default function HomeScreen() {
  const { expoPushToken, notification, notificationData, schedulePushNotification, sendTypedNotification } = useNotifications();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12'
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter app.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>
          When you're ready, run{' '}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.notificationContainer}>
        <ThemedText type="subtitle">推送通知测试</ThemedText>
        <ThemedText>点击按钮发送不同类型的通知，测试通知点击跳转功能</ThemedText>
        
        <ThemedView style={styles.buttonsRow}>
          <TouchableOpacity 
            style={[styles.notificationButton, styles.buttonA]}
            onPress={async () => {
              await sendTypedNotification('A');
            }}
          >
            <ThemedText style={styles.buttonText}>发送通知A</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.notificationButton, styles.buttonB]}
            onPress={async () => {
              await sendTypedNotification('B');
            }}
          >
            <ThemedText style={styles.buttonText}>发送通知B</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {expoPushToken && (
          <ThemedView style={styles.tokenContainer}>
            <ThemedText type="defaultSemiBold">推送令牌:</ThemedText>
            <ThemedText style={styles.tokenText} selectable>{expoPushToken}</ThemedText>
          </ThemedView>
        )}

        {notification && (
          <ThemedView style={styles.receivedContainer}>
            <ThemedText type="defaultSemiBold">最近收到的通知:</ThemedText>
            <ThemedText>标题: {notification.request.content.title}</ThemedText>
            <ThemedText>内容: {notification.request.content.body}</ThemedText>
            <ThemedText style={styles.tokenText}>数据: {JSON.stringify(notification.request.content.data)}</ThemedText>
          </ThemedView>
        )}
        
        {notificationData && (
          <ThemedView style={[styles.receivedContainer, styles.dataContainer]}>
            <ThemedText type="defaultSemiBold">通知点击数据:</ThemedText>
            <ThemedText>类型: {notificationData.type || '未指定'}</ThemedText>
            <ThemedText>目标页面: {notificationData.screen || '未指定'}</ThemedText>
            {notificationData.params && (
              <ThemedText>参数ID: {notificationData.params.id}</ThemedText>
            )}
            <ThemedText style={styles.tokenText}>完整数据: {JSON.stringify(notificationData)}</ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  notificationContainer: {
    gap: 12,
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  notificationButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonA: {
    backgroundColor: '#007AFF',
  },
  buttonB: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tokenContainer: {
    marginTop: 8,
    gap: 4,
  },
  tokenText: {
    fontSize: 12,
    opacity: 0.7,
  },
  receivedContainer: {
    marginTop: 16,
    gap: 4,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  dataContainer: {
    backgroundColor: 'rgba(0, 149, 120, 0.1)',
  }
});
