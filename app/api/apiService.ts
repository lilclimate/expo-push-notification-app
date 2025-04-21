type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  data?: any;
  token?: string;
}

interface ApiResponse<T = any> {
  message: string;
  data: T;
  [key: string]: any;
}

/**
 * 通用的API请求方法
 * @param url API地址
 * @param method HTTP方法
 * @param options 请求选项
 * @returns 返回响应数据
 */
async function apiRequest<T = any>(
  url: string,
  method: HttpMethod,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果提供了token，添加到请求头
    if (options?.token) {
      headers['Authorization'] = `Bearer ${options.token}`;
    }

    // 构建请求配置
    const requestConfig: RequestInit = {
      method,
      headers,
    };

    // 对于POST, PUT请求，添加请求体
    if ((method === 'POST' || method === 'PUT') && options?.data) {
      requestConfig.body = JSON.stringify(options.data);
    }

    // 发送请求
    const response = await fetch(url, requestConfig);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || '请求失败');
    }

    return responseData;
  } catch (error) {
    console.error(`${method} 请求错误:`, error);
    throw error;
  }
}

/**
 * API服务
 */
const apiService = {
  /**
   * GET请求
   * @param url API地址
   * @param options 请求选项
   * @returns 返回响应数据
   */
  get: <T = any>(url: string, options?: RequestOptions) => 
    apiRequest<T>(url, 'GET', options),

  /**
   * POST请求
   * @param url API地址
   * @param options 请求选项
   * @returns 返回响应数据
   */
  post: <T = any>(url: string, options?: RequestOptions) => 
    apiRequest<T>(url, 'POST', options),

  /**
   * PUT请求
   * @param url API地址
   * @param options 请求选项
   * @returns 返回响应数据
   */
  put: <T = any>(url: string, options?: RequestOptions) => 
    apiRequest<T>(url, 'PUT', options),

  /**
   * DELETE请求
   * @param url API地址
   * @param options 请求选项
   * @returns 返回响应数据
   */
  delete: <T = any>(url: string, options?: RequestOptions) => 
    apiRequest<T>(url, 'DELETE', options),
};

export default apiService; 