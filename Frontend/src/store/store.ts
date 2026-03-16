import {configureStore} from '@reduxjs/toolkit';
import {authReducer} from './index'
import {toastReducer} from './index'
// import {postReducer} from './index';  

const store = configureStore({
    reducer: {
        auth: authReducer,
        // posts: postReducer,
        toast: toastReducer
    }
});

export default store;