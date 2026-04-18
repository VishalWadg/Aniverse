import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type RouteToastPayload = {
    id: string;
    message: string;
    type?: 'info' | 'success' | 'error';
    duration?: number;
};

type RouteToastState = Record<string, unknown> & {
    toast?: RouteToastPayload;
};

function RouteToast() {
    const location = useLocation();
    const navigate = useNavigate();
    const routeState = location.state as RouteToastState | null;
    const routeToast = routeState?.toast;

    useEffect(() => {
        if (!routeToast?.id || !routeToast.message) {
            return;
        }

        if (routeToast.type === 'success') {
            toast.success(routeToast.message, {
                id: routeToast.id,
                duration: routeToast.duration,
            });
        } else if (routeToast.type === 'error') {
            toast.error(routeToast.message, {
                id: routeToast.id,
                duration: routeToast.duration,
            });
        } else {
            toast.info(routeToast.message, {
                id: routeToast.id,
                duration: routeToast.duration,
            });
        }

        const nextState = { ...(routeState ?? {}) };
        delete nextState.toast;

        navigate(
            {
                pathname: location.pathname,
                search: location.search,
                hash: location.hash,
            },
            {
                replace: true,
                state: Object.keys(nextState).length ? nextState : null,
            }
        );
    }, [location.hash, location.pathname, location.search, navigate, routeState, routeToast]);

    return null;
}

export default RouteToast;
