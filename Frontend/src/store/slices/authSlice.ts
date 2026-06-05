import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
    id: string;
    username: string;
    name: string;
    email: string;
    role: string;
    profilePic?: string | null;
    bio?: string | null;
};

export type AuthState = {
    status: boolean;
    userData: AuthUser | null;
    loading: boolean;
};

const initialState: AuthState = {
    status: false,
    userData: null,
    loading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ userData: AuthUser }>) => {
            state.status = true;
            state.userData = action.payload.userData;
            state.loading = false;
        },
        setUserData: (state, action: PayloadAction<AuthUser | null>) => {
            state.status = Boolean(action.payload);
            state.userData = action.payload;
            state.loading = false;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.loading = false;
        }
    }
});

export const { login, setUserData, logout } = authSlice.actions;

export default authSlice.reducer;
