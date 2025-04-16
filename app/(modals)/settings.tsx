import React from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const handleLogout = async () => {
    Alert.alert(
      '确认退出',
      '您确定要退出登录吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          onPress: async () => {
            await logout();
            router.back();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>设置</ThemedText>
        <View style={styles.placeholder} />
      </ThemedView>

      <ThemedView style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>账号</ThemedText>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="person.circle" size={22} color={Colors[colorScheme].text} />
              <ThemedText style={styles.menuItemText}>个人资料</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="bell" size={22} color={Colors[colorScheme].text} />
              <ThemedText style={styles.menuItemText}>通知设置</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="lock" size={22} color={Colors[colorScheme].text} />
              <ThemedText style={styles.menuItemText}>隐私设置</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>应用</ThemedText>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="paintbrush" size={22} color={Colors[colorScheme].text} />
              <ThemedText style={styles.menuItemText}>外观</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="globe" size={22} color={Colors[colorScheme].text} />
              <ThemedText style={styles.menuItemText}>语言</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>支持</ThemedText>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="questionmark.circle" size={22} color={Colors[colorScheme].text} />
              <ThemedText style={styles.menuItemText}>帮助与反馈</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemContent}>
              <IconSymbol name="doc.text" size={22} color={Colors[colorScheme].text} />
              <ThemedText style={styles.menuItemText}>关于我们</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={18} color={Colors[colorScheme].tabIconDefault} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>退出登录</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    opacity: 0.7,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutSection: {
    marginTop: 40,
    paddingBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 