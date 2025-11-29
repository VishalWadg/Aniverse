
import {useDispatch} from 'react-redux';
import { addToast as addToastAction, removeToast as removeToastAction } from '../store';

export default function useToasts() {
    const dispatch = useDispatch();

    const addToast = (message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        const newToast = {id, message, type, duration};

        dispatch(addToastAction(newToast));

        if(duration > 0){
            setTimeout(() => {
                dispatch(removeToastAction(id));
            }, duration);
        }

        return id;
    }

    const removeToast = (id) => {
        dispatch(removeToastAction(id));
    }

    return {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        info: (message, duration) => addToast(message, 'info', duration),
        removeToast,
        promise: async (promise, messages) => {
            const loadingId = addToast(messages.loading || 'Loading...', 'info', 0);
            try {
                const result = await promise;
                removeToast(loadingId);
                addToast(messages.success || 'Success!', 'success', 4000);
                return result;
            }catch (error) {
                removeToast(loadingId);
                addToast(messages.error || 'An error occurred', 'error', 4000);
                throw error;
            }
        }
    };
}
