import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from "@/router";

const http = axios.create({
    baseURL: '/api',
    timeout: 10000, // 请求超时时间
});

let isRefreshing = false;
let subscribers = [];

function onAccessTokenFetched(response) {
    subscribers.forEach(callback => callback(response));
    subscribers = [];
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

        // 如果是401错误且不是登录接口
        if (response && response.status === 401 && !originalRequest._retry &&
            !originalRequest.url.includes('/auth/login')) {

            if (isRefreshing) {
                // 如果正在刷新token，将请求存入队列
                return new Promise(resolve => {
                    subscribers.push(() => {
                        originalRequest.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
                        resolve(http(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 获取刷新token
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // 使用刷新token获取新的access token
                const response = await http.get(`/auth/refresh-token?refreshToken=${refreshToken}`);
                const accessToken = response.data;

                // 保存新的token
                localStorage.setItem('accessToken', accessToken);

                // 更新请求头
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

                // 重新发送之前的请求
                const retryRequest = http(originalRequest);

                // 处理其他被挂起的请求
                onAccessTokenFetched();
                return retryRequest;
            } catch (refreshError) {
                // 刷新token失败，跳转到登录页
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                await router.push('/login');
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
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
