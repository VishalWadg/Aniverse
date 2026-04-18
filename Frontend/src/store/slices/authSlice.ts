import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type AuthState = {
    status: boolean;
    userData: any | null;
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
        login: (state, action: PayloadAction<{ userData: any }>) => {
            state.status = true;
            state.userData = action.payload.userData;
            state.loading = false;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.loading = false;
        }
    }
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
