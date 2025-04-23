import { apiService, API_ENDPOINTS } from '../index';

// 文章类型
export interface Article {
  _id: string;
  title: string;
  content: string;
  images: string[];
  isDeleted: boolean;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// 文章列表响应类型
export interface ArticlesListResponse {
  articles: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 单个文章响应类型
export interface ArticleResponse {
  article: Article;
}

/**
 * 文章服务
 */
const articlesService = {
  /**
   * 获取文章列表
   * @param page 页码
   * @param limit 每页数量
   * @param token 访问令牌（可选）
   * @returns 文章列表数据
   */
  getArticles: async (page: number = 1, limit: number = 10, token?: string): Promise<ArticlesListResponse> => {
    const url = `${API_ENDPOINTS.ARTICLES.LIST}?page=${page}&limit=${limit}`;
    const response = await apiService.get<ArticlesListResponse>(url, { token });
    return response.data;
  },

  /**
   * 获取文章详情
   * @param id 文章ID
   * @param token 访问令牌（可选）
   * @returns 文章详情数据
   */
  getArticleDetails: async (id: string, token?: string): Promise<ArticleResponse> => {
    const url = API_ENDPOINTS.ARTICLES.DETAILS(id);
    const response = await apiService.get<ArticleResponse>(url, { token });
    return response.data;
  },

  /**
   * 获取我的文章列表
   * @param page 页码
   * @param limit 每页数量
   * @param token 访问令牌
   * @returns 我的文章列表数据
   */
  getMyArticles: async (page: number = 1, limit: number = 10, token: string): Promise<ArticlesListResponse> => {
    const url = `${API_ENDPOINTS.ARTICLES.MY_ARTICLES}?page=${page}&limit=${limit}`;
    const response = await apiService.get<ArticlesListResponse>(url, { token });
    console.log(response, '------response');
    return response.data;
  },

  /**
   * 创建文章
   * @param data 文章数据
   * @param token 访问令牌
   * @returns 创建的文章数据
   */
  createArticle: async (data: { title: string; content: string; images?: string[] }, token: string): Promise<ArticleResponse> => {
    const response = await apiService.post<ArticleResponse>(API_ENDPOINTS.ARTICLES.CREATE, { data, token });
    return response.data;
  },

  /**
   * 更新文章
   * @param id 文章ID
   * @param data 文章数据
   * @param token 访问令牌
   * @returns 更新后的文章数据
   */
  updateArticle: async (id: string, data: { title?: string; content?: string; images?: string[] }, token: string): Promise<ArticleResponse> => {
    const url = API_ENDPOINTS.ARTICLES.UPDATE(id);
    const response = await apiService.put<ArticleResponse>(url, { data, token });
    return response.data;
  },

  /**
   * 删除文章
   * @param id 文章ID
   * @param token 访问令牌
   * @returns 删除结果
   */
  deleteArticle: async (id: string, token: string): Promise<{message: string}> => {
    const url = API_ENDPOINTS.ARTICLES.DELETE(id);
    const response = await apiService.delete<{message: string}>(url, { token });
    return response.data;
  }
};

export default articlesService; 