export type AuthFailureReason = 'expired' | 'unauthorized';

type AuthFailureListener = (reason: AuthFailureReason) => void;

const listeners = new Set<AuthFailureListener>();
let hasReportedAuthFailure = false;

export const subscribeAuthFailure = (listener: AuthFailureListener) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

export const reportAuthFailure = (reason: AuthFailureReason) => {
    if (hasReportedAuthFailure) {
        return;
    }

    hasReportedAuthFailure = true;

    for (const listener of listeners) {
        try {
            listener(reason);
        } catch (error) {
            console.error('Auth failure listener crashed', error);
        }
    }
};

export const resetAuthFailureState = () => {
    hasReportedAuthFailure = false;
};
