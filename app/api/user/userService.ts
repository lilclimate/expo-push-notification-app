import { apiService, API_ENDPOINTS } from '../index';

// 关注数量接口响应
export interface FollowCountResponse {
  following: number; // 关注数
  followers: number; // 粉丝数
}

// 关注状态响应
export interface FollowStatusResponse {
  relationType: number; // 0=互相未关注, 1=已关注, 2=被关注, 3=互相关注
}

/**
 * 用户关注服务
 */
const userService = {
  /**
   * 获取用户关注和粉丝数
   * @param userId 用户ID
   * @param token 访问令牌
   * @returns 关注数和粉丝数
   */
  getFollowCount: async (userId: string, token?: string) => {
    try {
      const response = await apiService.get<FollowCountResponse>(
        API_ENDPOINTS.FOLLOW.COUNT(userId),
        { token }
      );
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error('获取关注数据失败:', error.message);
      } else {
        console.error('获取关注数据失败:', error);
      }
      throw error;
    }
  },

  /**
   * 获取用户关注状态
   * @param userId 用户ID
   * @param token 访问令牌
   * @returns 关注状态
   */
  getFollowStatus: async (userId: string, token?: string) => {
    try {
      const response = await apiService.get<FollowStatusResponse>(
        API_ENDPOINTS.FOLLOW.STATUS(userId),
        { token }
      );
      return response.data;
    } catch (error) {
      console.error('获取关注状态失败:', error);
      throw error;
    }
  },

  /**
   * 关注用户
   * @param userId 要关注的用户ID
   * @param token 访问令牌
   * @returns 关注结果
   */
  followUser: async (userId: string, token: string) => {
    try {
      const response = await apiService.post(
        API_ENDPOINTS.FOLLOW.FOLLOW(userId),
        { token }
      );
      return response.data;
    } catch (error) {
      console.error('关注用户失败:', error);
      throw error;
    }
  },

  /**
   * 取消关注用户
   * @param userId 要取消关注的用户ID
   * @param token 访问令牌
   * @returns 取消关注结果
   */
  unfollowUser: async (userId: string, token: string) => {
    try {
      const response = await apiService.delete(
        API_ENDPOINTS.FOLLOW.FOLLOW(userId),
        { token }
      );
      return response.data;
    } catch (error) {
      console.error('取消关注用户失败:', error);
      throw error;
    }
  }
};

export default userService; 