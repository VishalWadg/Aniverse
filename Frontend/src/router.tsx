import {createBrowserRouter, 
  createRoutesFromElements, redirect, // Preferred over createRoutesFromChildren (same thing, newer name)
  Route } from 'react-router-dom'
import App from './App'

import store from './store/store'
import { login, logout } from './store'
import authApi from './api/authApi'
import { setMemoryTokenNExpiry, shouldCheckAuth } from './api/axiosClient'
import { getMemoryToken } from './api/axiosClient'

// --- Components ---
import { AuthLayout } from './components'

// --- Pages & Loaders ---
// We import these explicitly to get the named 'loader' exports
import Home from './pages/Home'
import AllPosts, { allPostsLoader } from './pages/AllPosts' // You need to export this from AllPosts.jsx
import Post from './pages/Post'
import EditPost from './pages/EditPost' // You need to export this from EditPost.jsx

// These don't have loaders, so standard import is fine
import { Login, Signup, AddPost } from './pages' 

const rootLoader = async ({request}) => {
    const url = new URL(request.url)
    const pathname = url.pathname
    // Define public routes (routes that don't need authentication)

    const publicRoutes = ['/login', '/signup', '/', '/all-posts'];
    // 1. OPTIMIZATION: Check if we already have a token
    // If we have a token, we assume the session is valid. 
    // if we have already checked auth once, no need to do it again
    if(!shouldCheckAuth()) {
        // We can return the user from Redux state if needed, or just null
        return store.getState().auth.userData; 
    }

    // 2. If NO token (Reload or First Load), then we MUST refresh
    try {
        
        // 1. Attempt to refresh the token (Browser sends HttpOnly cookie)
        const data = await authApi.refresh();
        console.log("Refresh called in rootLoader:", request.url);
        // 2. If successful, initialize the app state
        if (data && data.token) {
            // A. Restore Access Token to Axios Memory
            setMemoryTokenNExpiry(data.token);
      
            // B. Restore User to Redux Store
            // Note: We use 'store.dispatch' because we can't use hooks here
            store.dispatch(login({ userData: data.user }));
      
            return data; // Return data to the component (optional usage)
        }
        // 3. No valid token
    } catch (error) {
        // 3. If refresh fails (Session expired/Invalid), ensure clean state
        store.dispatch(logout());
        setMemoryTokenNExpiry(null);
        // Same logic: allow public routes, redirect protected routes
        if (publicRoutes.includes(pathname)) {
          return null;
        }
        return redirect('/login');
    }
    if (publicRoutes.includes(pathname)) {
      return null;
    }
    return redirect('/login');
}

export const router = createBrowserRouter(createRoutesFromElements(
  <Route 
    path='/' 
    element={<App />}
    loader={rootLoader}
  >
    
    {/* --- Public Route (Home) --- */}
    {/* Requires homeLoader to fetch posts immediately */}
    <Route 
      path='/' 
      element={<Home />} 
      
    />

    {/* --- Auth Routes --- */}
    <Route path='login' element={
      <AuthLayout authentication={false}>
        <Login />
      </AuthLayout>
    }/>
    
    <Route path='signup' element={
      <AuthLayout authentication={false}>
        <Signup />
      </AuthLayout>
    }/>

    {/* --- Protected Routes --- */}
    
    <Route path='all-posts' element={<AllPosts />} 
      // Add the loader here so data fetches while navigating
      loader={allPostsLoader}
      shouldRevalidate={({currentUrl, nextUrl, defaultShouldRevalidate}) => {
        // 1. If we are on home and we clicked home again..
        if(currentUrl.pathname === nextUrl.pathname && currentUrl.search === nextUrl.search) {  // pathname means the part after domain, search means query params
          return false; // Prevent revalidation i.e dont run the loader
        }
        // 2. Otherwise (Form actions, Navigation from other pages), do default behavior
        return defaultShouldRevalidate;
      }} 
    />
    
    <Route path='add-post' element={
      <AuthLayout authentication={true}>
        <AddPost />
      </AuthLayout>
    }/>
    
    <Route path='edit-post/:id' element={
      <AuthLayout authentication={true}>
        <EditPost />
      </AuthLayout>
    }
      // Loader fetches the existing post data to fill the form
    />
    
    <Route path='post/:id' element={
      <AuthLayout authentication={true}>
        <Post />
      </AuthLayout>
    } 
    />

  </Route>
))
