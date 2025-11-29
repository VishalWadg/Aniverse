import axiosClient, { performRefresh, resetAuthStatus } from "./axiosClient";

const authApi = {

    // POST /api/v1/auth/signup
    createAccount: async (userData) => {
        // userData = { username, email, password, name }
        
        // 1. Handle default values here or in the component, not inside the API call if possible.
        // But if you want to ensure a name exists:
        const payload = { 
            ...userData, 
            name: userData.name || "User" 
        };

        const response = await axiosClient.post('/auth/signup', payload);
        
        // 2. Just return the data. Do NOT dispatch here.
        return response.data; 
    },

    // POST /api/v1/auth/login
    login: async (credentials) => {
        const response = await axiosClient.post('/auth/login', credentials);
        return response.data; // Returns { token, user, expiresIn }
    },

    // POST /api/v1/auth/refresh
    refresh: async () => await performRefresh(),
    

    // POST /api/v1/auth/logout
    logout: async () => {
        try {
            await axiosClient.post('/auth/logout');
        } finally {
            resetAuthStatus(); // Always reset, even if backend fails
        }
    },

    // GET /api/v1/auth/check-username
    checkUsernameAvailability: async (username) => {
        const response = await axiosClient.get(`/auth/check-username?username=${username}`);
        return response.data; 
    }
}

export default authApi;