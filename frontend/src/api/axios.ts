import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface RetryConfig extends InternalAxiosRequestConfig { _retry?:boolean }
let refreshPromise:Promise<string>|null=null;
let authFailureHandler:()=>void=()=>undefined;
export const setAuthFailureHandler=(handler:()=>void)=>{authFailureHandler=handler;};
export const clearAuthStorage=()=>{localStorage.removeItem('token');localStorage.removeItem('refreshToken');};

const api=axios.create({baseURL:'/api',timeout:15000});
api.interceptors.request.use(config=>{const token=localStorage.getItem('token');if(token)config.headers.Authorization=`Bearer ${token}`;return config;});
api.interceptors.response.use(response=>response,async(error:AxiosError)=>{
  const config=error.config as RetryConfig|undefined; const status=error.response?.status;
  const path=config?.url||''; const isAuthEndpoint=['/auth/login','/auth/register','/auth/refresh'].some(value=>path.includes(value));
  if(status!==401||!config||config._retry||isAuthEndpoint)return Promise.reject(error);
  const refreshToken=localStorage.getItem('refreshToken'); if(!refreshToken){clearAuthStorage();authFailureHandler();return Promise.reject(error);}
  config._retry=true;
  try {
    refreshPromise??=axios.post('/api/auth/refresh',{refreshToken}).then(({data})=>{localStorage.setItem('token',data.data.accessToken);localStorage.setItem('refreshToken',data.data.refreshToken);return data.data.accessToken;}).finally(()=>{refreshPromise=null;});
    const accessToken=await refreshPromise; config.headers.Authorization=`Bearer ${accessToken}`; return api(config);
  } catch(refreshError){clearAuthStorage();authFailureHandler();return Promise.reject(refreshError);}
});
export const productAPI={get:(url:string)=>api.get(url),post:(url:string,data?:unknown)=>api.post(url,data),put:(url:string,data?:unknown)=>api.put(url,data),delete:(url:string)=>api.delete(url)};
export default api;
