import http from './http';

export interface LoginForm {
    username: string;
    password: string;
}

export interface LoginResponse<T> {
    code: number;
    message?: string;
    data: T | null;
}

export interface RegisterForm {
    username: string;
    password: string;
    email: string;
    captchaCode: string;
}

export interface RegisterResponse {
    code: number;
    message?: string;
}

export interface SendCodeResponse {
    code: number;
    message?: string;
}

/**
 * 登录
 * @param loginData 登录数据
 * @returns 登录响应
 */
export async function loginAPI(loginData: LoginForm) : Promise<LoginResponse<unknown>> {
    if(!loginData.username || !loginData.password) {
        return {
            code: 400,
            message: '请输入账号和密码',
            data: null,
        }
    }
    try {
        const res = await http.post<LoginResponse<unknown>>('/user/login', loginData);
        if(res.code === 200) {
            return {
                code: 200,
                message: '登录成功',
                data: res.data,
            }
        }
        else {
            return {
                code: res.code,
                message: res.message,
                data: null,
            }
        }
    }
    catch(error: unknown) {
        return {
            code: 500,
            message: error instanceof Error ? error.message : '未知错误',
            data: null,
        }
    }
}

export async function registerAPI(registerData: RegisterForm) : Promise<RegisterResponse> {
    try{
        const res = await http.post<RegisterResponse>('/user/register', registerData);
        if(res.code === 200) {
            return {
                code: 200,
                message: '注册成功',
            }
          }
          else {
            return {
                code: res.code,
                message: res.message,
            }
          }
    }
    catch(error: unknown) {
        return {
            code: 500,
            message: error instanceof Error ? error.message : '未知错误',
        }
    }
}

export async function sendCodeAPI(registerData: RegisterForm) : Promise<SendCodeResponse> {
    if(!registerData.email) {
        return {
            code: 400,
            message: '请输入邮箱',
        }
    }
    try {
        const res = await http.post<SendCodeResponse>('/user/send_code', {
            email: registerData.email,
            action: 'register'
        });
        return {
            code: res.code,
            message: res.message,
        }
    }
    catch(error: unknown) {
        return {
            code: 500,
            message: error instanceof Error ? error.message : '未知错误',
        }
    }
}

export async function logoutAPI() {
    try {
        await http.post('/user/logout');
    }
    catch(error: unknown) {
        console.error('Logout error:', error);
    }
}
