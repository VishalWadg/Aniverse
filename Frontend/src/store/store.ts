import {configureStore} from '@reduxjs/toolkit';
import {authReducer} from './index'
import { setupListeners } from '@reduxjs/toolkit/query';
import {baseApi} from '../api/baseApi'
// import {postReducer} from './index';  

const store = configureStore({
    reducer: {
        auth: authReducer,
        // posts: postReducer,
        [baseApi.reducerPath]: baseApi.reducer
    },
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware().concat(baseApi.middleware)
});

setupListeners(store.dispatch)

export default store;
