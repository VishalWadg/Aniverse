import {configureStore} from '@reduxjs/toolkit';
import {authReducer} from './index'
import {postReducer} from './index';  

const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
    }
});

export default store;