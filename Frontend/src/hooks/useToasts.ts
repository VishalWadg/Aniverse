import { useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast as sonnerToast } from 'sonner';

type ToastDuration = number | undefined;

type ToastId = number | string;

type ToastPromiseMessages = {
    loading?: string;
    success?: string;
    error?: string;
};

const getToastOptions = (duration?: ToastDuration) => {
    if (duration === undefined) {
        return undefined;
    }

    return { duration };
};

const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;

        if (typeof responseData === 'string' && responseData.trim()) {
            return responseData;
        }

        if (responseData && typeof responseData === 'object') {
            const message = 'message' in responseData ? responseData.message : null;
            if (typeof message === 'string' && message.trim()) {
                return message;
            }

            const errorText = 'error' in responseData ? responseData.error : null;
            if (typeof errorText === 'string' && errorText.trim()) {
                return errorText;
            }
        }

        if (typeof error.message === 'string' && error.message.trim()) {
            return error.message;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return null;
}

export default function useToasts() {
    const success = useCallback((message: string, duration?: ToastDuration) => {
        return sonnerToast.success(message, getToastOptions(duration));
    }, []);

    const error = useCallback((message: string, duration?: ToastDuration) => {
        return sonnerToast.error(message, getToastOptions(duration));
    }, []);

    const info = useCallback((message: string, duration?: ToastDuration) => {
        return sonnerToast.info(message, getToastOptions(duration));
    }, []);

    const removeToast = useCallback((id?: ToastId) => {
        sonnerToast.dismiss(id);
    }, []);

    const promise = useCallback(async <T,>(
        promiseInput: Promise<T> | (() => Promise<T>),
        messages: ToastPromiseMessages = {}
    ) => {
        const trackedPromise = typeof promiseInput === 'function' ? promiseInput() : promiseInput;

        sonnerToast.promise(trackedPromise, {
            loading: messages.loading || 'Loading...',
            success: messages.success || 'Success!',
            error: (error) => getErrorMessage(error) || messages.error || 'An error occurred',
        });

        return trackedPromise;
    }, []);

    return useMemo(() => ({
        success,
        error,
        info,
        removeToast,
        promise,
    }), [error, info, promise, removeToast, success]);
}
