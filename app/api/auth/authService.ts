import { apiService, API_ENDPOINTS } from '../index';

// 认证响应类型
interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  message?: string;
  refreshTokenExpiresAt?: number;
  rememberMe?: boolean;
}

// 刷新token响应类型
interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  message?: string;
}

/**
 * 认证服务
 */
const authService = {
  /**
   * 用户登录
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 登录结果
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, {
      data: { email, password }
    });
    return response as unknown as AuthResponse;
  },

  /**
   * 用户注册
   * @param username 用户名
   * @param email 用户邮箱
   * @param password 用户密码
   * @returns 注册结果
   */
  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, {
      data: { username, email, password }
    });
    return response as unknown as AuthResponse;
  },

  /**
   * 退出登录
   * @param refreshToken 刷新令牌
   * @returns 退出结果
   */
  logout: async (refreshToken: string): Promise<{message: string}> => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {
      data: { refreshToken }
    });
    return response as unknown as {message: string};
  },

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌和刷新令牌
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      data: { refreshToken }
    });
    return response as unknown as RefreshTokenResponse;
  }
};

export default authService; 