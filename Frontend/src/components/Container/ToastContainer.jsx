import React from 'react'
import { useSelector, useDispatch} from 'react-redux'
import { removeToast, selectToasts } from '../../store';
import Toast from '../Toast';

function ToastContainer() {

    const toasts = useSelector(selectToasts);
    const dispatch = useDispatch();

    const handleRemove = (id) => {
        dispatch(removeToast(id));
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={handleRemove} />
            ))}
        </div>
  ) 
}

export default ToastContainer