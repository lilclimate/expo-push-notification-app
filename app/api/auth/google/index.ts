import { apiService } from '../../index';
import { API_ENDPOINTS } from '../../index';

interface GoogleAuthUrlResponse {
  url: string;
}

interface GoogleAuthCallbackResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt?: number;
}

/**
 * 获取Google登录授权URL
 * @returns Google授权URL
 */
export const getGoogleAuthUrl = async (): Promise<any> => {
  const response = await apiService.get<GoogleAuthUrlResponse>(`${API_ENDPOINTS.AUTH.GOOGLE}`);
  console.log(response, 'getGoogleAuthUrlResponse');
  return response;
};

/**
 * 使用Google授权码获取用户信息和令牌
 * @param code Google授权码
 * @returns 用户信息和令牌
 */
export const googleAuthCallback = async (code: string): Promise<GoogleAuthCallbackResponse> => {
  const response = await apiService.post<GoogleAuthCallbackResponse>(`${API_ENDPOINTS.AUTH.GOOGLE_CALLBACK}`, {
    data: { code }
  });
  return response.data;
};

const googleAuthService = {
  getGoogleAuthUrl,
  googleAuthCallback
};

export default googleAuthService; 