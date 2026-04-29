import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/user';

const http = axios.create({
    baseURL: '/api',
    timeout: 10000, // 请求超时时间
});

function clearAuthState() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    try {
        useUserStore().logout();
    } catch (error) {
        console.warn('Clear auth state failed:', error);
    }
}

// 请求拦截器
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

http.interceptors.response.use(
    response => response.data,
    async error => {
        const { config, response } = error;
        const originalRequest = config;
        const requestUrl = originalRequest?.url ?? '';

        // 未登录或登录态失效时，仅清理鉴权状态并留在当前页。
        if (response && response.status === 401 &&
            !requestUrl.includes('/auth/login') &&
            !requestUrl.includes('/user/login')) {
            clearAuthState();
            return Promise.reject(error);
        }

        // 其他错误处理
        if (response) {
            switch (response.status) {
                case 403:
                    ElMessage.error('没有权限访问');
                    break;
                case 404:
                    ElMessage.error('请求的资源未找到');
                    break;
                default:
                    ElMessage.error(response.data?.message || '服务器内部错误');
            }
        } else if (error.request) {
            ElMessage.error('网络错误，请检查您的网络连接');
        } else {
            ElMessage.error('请求失败');
        }

        return Promise.reject(error);
    }
);

export default http;
