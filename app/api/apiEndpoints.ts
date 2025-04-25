import { Platform } from 'react-native';

// 获取API基本URL
const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000';
  }
  return 'http://localhost:3000';
};

// API端点
const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    BASE: `${getApiBaseUrl()}/api/auth`,
    LOGIN: `${getApiBaseUrl()}/api/auth/login`,
    REGISTER: `${getApiBaseUrl()}/api/auth/register`,
    LOGOUT: `${getApiBaseUrl()}/api/auth/logout`,
    REFRESH_TOKEN: `${getApiBaseUrl()}/api/auth/refresh-token`
  },
  // 文章相关
  ARTICLES: {
    LIST: `${getApiBaseUrl()}/api/articles`,
    DETAILS: (id: string) => `${getApiBaseUrl()}/api/articles/${id}`,
    CREATE: `${getApiBaseUrl()}/api/articles`,
    UPDATE: (id: string) => `${getApiBaseUrl()}/api/articles/${id}`,
    DELETE: (id: string) => `${getApiBaseUrl()}/api/articles/${id}`,
    MY_ARTICLES: `${getApiBaseUrl()}/api/articles/my`,
    USER_ARTICLES: (userId: string) => `${getApiBaseUrl()}/api/articles/user/${userId}`
  },
  // 用户相关
  USERS: {
    PROFILE: `${getApiBaseUrl()}/api/users/profile`,
    UPDATE_PROFILE: `${getApiBaseUrl()}/api/users/profile`
  },
  // 用户关注相关
  FOLLOW: {
    COUNT: (userId: string) => `${getApiBaseUrl()}/api/users/${userId}/follow/count`,
    STATUS: (userId: string) => `${getApiBaseUrl()}/api/users/${userId}/follow/status`,
    FOLLOW: (userId: string) => `${getApiBaseUrl()}/api/users/${userId}/follow`
  }
};

export default API_ENDPOINTS; 