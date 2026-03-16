import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { router } from '../router';


const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1';

// In-memory token storage
let memoryToken: string | null = null;
let memoryTokenExpiry: number | null = null;

let refreshPromise: Promise<any> | null = null;

let isAuthInitialized = false;

const axiosClient = axios.create({
    baseURL,
    timeout: 2000, // 2 seconds timeout to prevent hanging
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true 
});

export const shouldCheckAuth = () => {
    if(memoryToken) return false;
    if(isAuthInitialized) return false;
    return true;
}

export const resetAuthStatus = () => {
    memoryToken = null;
    memoryTokenExpiry = null;
    isAuthInitialized = false; // Reset so we check again on next login attempt
}

// --- 2. EXPOSED REFRESH FUNCTION ---
// This is what rootLoader AND the interceptors will call
export const performRefresh = async() => {
    // If a refresh is already in progress, return the existing promise
    // This prevents multiple Refresh's and makes other requests wait
    resetAuthStatus();
    if(refreshPromise) {
        return refreshPromise;
    }
    
    // create the promise
    refreshPromise = (async () => {
        try {
            const response = await axiosClient.post('/auth/refresh', {}, { withCredentials: true });
            const token = response.data.token;
            setMemoryTokenNExpiry(token);
            isAuthInitialized = true;
            return response.data;
        } catch (error) {
            setMemoryTokenNExpiry(null);
            isAuthInitialized = true;
            // router.navigate('/login');
            return Promise.reject(error);
            
        }finally {
            // Clear the promise once done (whether success or failure) so future refreshes can be made
            refreshPromise = null;
        }
    }) ();

    return refreshPromise;
}

// 1. Helper to check expiry (No arguments needed)
const isTokenExpired = () => {
    if (!memoryToken || !memoryTokenExpiry) return true; // No token = expired

    const currentTime = Date.now();
    const bufferTime = 10 * 1000; // 10 seconds buffer

    // Check if Current Time is past (Expiry - Buffer)
    return currentTime >= (memoryTokenExpiry - bufferTime);
};


export const setMemoryTokenNExpiry = (token) => {
    memoryToken = token;
    if (token) {
        try {
            const decoded: any = jwtDecode(token);
            // Convert 'exp' (seconds) to milliseconds
            memoryTokenExpiry = typeof decoded?.exp === "number" ? decoded.exp * 1000 : null;
        } catch (e) {
            // If token is invalid/malformed, treat as expired
            memoryToken = null;
            memoryTokenExpiry = null;
        }
    } else {
        memoryTokenExpiry = null;
    }
};

axiosClient.interceptors.request.use(
    async (config: any) => {
        const url = typeof config?.url === "string" ? config.url : "";

        // 1. skip public paths
        if(url.includes('/auth/')) return config;

        // 2. CASE A: A refresh is already happening (Queueing)
        if(refreshPromise) {
            try {
                // wait for the ongoing refresh to complete
                const data = await refreshPromise;

                // use token we just got
                const newToken = data.token;
                if(newToken){
                    config.headers = config.headers ?? {};
                    config.headers["Authorization"] = `Bearer ${newToken}`;
                }
                return config;
            } catch (error) {
                // If the shared refresh failed, this request must also fail
                const err: any = error;
                console.error("Refresh failed: ", err?.response?.data?.message || err?.message);
                router.navigate('/login');
                return Promise.reject(error);
            }
        }
        // 3. CASE B: No ongoing refresh, check if token needs refresh
        if(memoryToken && isTokenExpired()) {
            console.log("Warning: Token is expired or about to expire. Refreshing...");
            try {
                const data = await performRefresh();
                const newToken = data.token;
                config.headers = config.headers ?? {};
                config.headers["Authorization"] = `Bearer ${newToken}`;
            } catch (error) {
                const err: any = error;
                console.error("Failed to refresh token:", err?.response?.data?.message || err?.message);
                router.navigate('/login');
                setMemoryTokenNExpiry(null);
                return Promise.reject(error);
            }

        }else if (memoryToken){
            config.headers = config.headers ?? {};
            config.headers["Authorization"] = `Bearer ${memoryToken}`; // token is valid so attach it
        }
        return config;
    },
    (error) => Promise.reject(error)
)

// Optional: Add interceptors to handle token expiration if needed
axiosClient.interceptors.response.use(
    (response) => response,
    async (error: any) => {
        const originalRequest: any = error?.config ?? {};
        // check 3 conditions:
        // 1. is error response status 401
        // 2. is it not a request to the login/refresh endpoint itself (prevents loops)
        // 3. have we already retried this ? (prevent infinite loop)
       // If refresh endpoint itself fails, just reject

        if(
            error.response?.status === 401 &&
            !(typeof originalRequest?.url === "string" ? originalRequest.url : "").includes('/auth/') &&
            !originalRequest._Retry
        ){
            originalRequest._Retry = true; // mark the request as retried
            try {
                console.log("401 detected. Attempting Silent Refresh...");

                // A. Call the Refresh Endpoint
                // We use the existing instance, but the Request Interceptor will skip 
                // adding the old header because of the URL check.
                // The browser automatically sends the HttpOnly cookie.
                const data = await performRefresh();
                // B. get the new token
                const token = data.token;
                // D. Update the header of the FAILED request with the NEW token
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers["Authorization"] = `Bearer ${token}`;

                // E. Retry the original request
                // We return the result of calling axiosClient again with the updated config
                return axiosClient(originalRequest);

            } catch (refreshError) {
                // F. Refresh failed (Cookie expired or invalid)
                // console.error(refreshError.message );
                console.log((refreshError as any)?.response?.data?.message);
                // router.navigate('/login');
                setMemoryTokenNExpiry(null);
                return Promise.reject(refreshError);
            }

        }
        // Handle 401 or other global errors here
        return Promise.reject(error);
    }
);

export default axiosClient;

export const getMemoryToken = () => memoryToken;
export const getTokenExpiry = () => memoryTokenExpiry;
