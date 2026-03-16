import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastType = "info" | "success" | "error";

export type Toast = {
    id: number;
    message: string;
    type: ToastType;
    duration: number;
};

type ToastState = {
    toasts: Toast[];
};

const initialState: ToastState = {
    toasts: [],
};

const toastSlice = createSlice({
    name: "toast",
    initialState,
    reducers: {
        addToast: (state, action: PayloadAction<Toast>) => {
            state.toasts.push(action.payload);
        },

        removeToast: (state, action: PayloadAction<number>) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        },

        clearAllToasts: (state) => {
            state.toasts = [];
        }
    }
});

export const {addToast, removeToast, clearAllToasts} = toastSlice.actions;

export default toastSlice.reducer;

export const selectToasts = (state: any) => state.toast.toasts as Toast[];
