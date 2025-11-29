# Frontend Improvements Documentation
## Aniverse Frontend – Progressive Learning Roadmap

This version reorganizes every improvement into a progressive learning path so you can grow from beginner basics to advanced releases. Each stage lists concrete tasks, priorities, and backend work (if any) you should finish beforehand.

---

## Table of Contents
1. [Stage 1 – Foundations & Feedback](#stage-1--foundations--feedback)
2. [Stage 2 – Reliable Data & State](#stage-2--reliable-data--state)
3. [Stage 3 – Core UX & Navigation](#stage-3--core-ux--navigation)
4. [Stage 4 – Profiles & Media](#stage-4--profiles--media)
5. [Stage 5 – Architecture & Performance](#stage-5--architecture--performance)
6. [Stage 6 – Testing & Code Quality](#stage-6--testing--code-quality)
7. [Stage 7 – Build & Deployment](#stage-7--build--deployment)
8. [Stage 8 – Advanced & Nice-to-Have](#stage-8--advanced--nice-to-have)
9. [Summary & Priority Matrix](#summary--priority-matrix)
10. [Backend Dependency Map](#backend-dependency-map)

---

## Stage 1 – Foundations & Feedback
_Goal: make the app stable, configurable, and friendly while you learn the basics._

### 1.1 Configure Environment Variables (Priority: CRITICAL)
**Why:** avoid hard-coded secrets and ensure dev/prod parity.  
**How:** create `.env.example`, load `VITE_BACKEND_URL`, throw if missing, and document usage.

```properties
# .env.example
VITE_BACKEND_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Aniverse
VITE_APPWRITE_URL=
VITE_APPWRITE_PROJECT_ID=
```

```javascript
// axiosClient.js
const baseURL = import.meta.env.VITE_BACKEND_URL;
if (!baseURL) throw new Error('VITE_BACKEND_URL is not set');
```

### 1.2 Add Loading States (Priority: HIGH)
Create `LoadingSpinner` with `react-spinners` and show it whenever `postApi` calls run so the UI never feels frozen.

```javascript
function LoadingSpinner({ fullScreen }) {
  const spinner = (
    <div className="flex justify-center items-center">
      <ClipLoader size={40} color="#6E8CFB" />
    </div>
  );
  return fullScreen
    ? <div className="fixed inset-0 bg-black/40 flex items-center justify-center">{spinner}</div>
    : spinner;
}
```

### 1.3 Toast-Based Error Handling (Priority: CRITICAL)  
**Backend dependency:** Backend Improvement 2.1.
1. Build `Toast`, `ToastContainer`, and `useToast`.

```javascript
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const showToast = useCallback((message, type = 'error', duration = 5000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, []);
  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  return { toasts, showToast, removeToast };
}
```

2. Implement `handleApiError` to parse backend responses.

```javascript
export const handleApiError = (error) => {
  if (error.response?.data) {
    const { message, fieldErrors } = error.response.data;
    if (fieldErrors) {
      return Object.entries(fieldErrors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
    }
    return message || 'Request failed';
  }
  if (error.request) return 'Network error. Check your connection.';
  return error.message || 'Unexpected error';
};
```

3. Use `showToast(handleApiError(error), 'error')` instead of `alert()` in `PostForm`, login, signup, etc.

### 1.4 Visual Form Validation (Priority: HIGH)  
**Backend dependency:** Backend Improvement 2.2.
- Create `FormError` to show `react-hook-form` errors below each input.

```javascript
function FormError({ error }) {
  if (!error) return null;
  return <span className="text-red-500 text-sm mt-1 block">{error.message}</span>;
}
```

- Enforce min/max lengths in `PostForm`:

```javascript
<Input
  {...register('title', {
    required: 'Title is required',
    minLength: { value: 3, message: 'At least 3 characters' },
    maxLength: { value: 255, message: 'Keep it under 255 characters' },
  })}
/>
```

### 1.5 Real Pagination Controls (Priority: CRITICAL)  
**Backend dependency:** Backend Improvement 1.3.
1. Update `postApi.getPosts(page, size, sortBy, sortDir)` to send query params.
2. Build a tiny `Pagination` component (Previous/pages/Next).
3. Use `useSearchParams` inside `Home.jsx` so the URL remembers the page:

```javascript
const [searchParams, setSearchParams] = useSearchParams();
const currentPage = Number(searchParams.get('page') || 0);
const handlePageChange = (page) => setSearchParams({ page: page.toString() });
```

---

## Stage 2 – Reliable Data & State
_Goal: learn Redux Toolkit and make API calls resilient._

### 2.1 Implement Post Slice (Priority: HIGH)
- Use `createAsyncThunk` for fetch/create/update/delete.
- Store `posts`, `currentPost`, pagination info, and loading/error flags.
- Dispatch `fetchPosts`/`fetchPost` instead of relying entirely on route loaders.

### 2.2 Comment Slice (Priority: HIGH)  
**Backend dependency:** Backend Improvement 1.2.
- Add `commentApi` for `/posts/{id}/comments`.
- Maintain `commentsByPost[postId] = { content, totalPages, loading }`.

### 2.3 Harden Axios Interceptors (Priority: HIGH)  
**Backend dependency:** Backend Improvement 2.1.
- Keep the access token in memory via `setMemoryToken`.
- On `401`, queue failed requests, call `/auth/refresh`, retry them, or logout if refresh fails.
- Attach friendly `error.userMessage` strings for `403/404/5xx`.

### 2.4 Error Boundaries (Priority: HIGH)
- Wrap `<RouterProvider>` with `<ErrorBoundary>`.
- Show a friendly fallback with a reload button if React crashes.

### 2.5 Simple Retry Utility (Priority: MEDIUM)
- Build `retryRequest(requestFn, maxRetries, delay)` and use it around GET calls that might fail due to flaky networks.

---

## Stage 3 – Core UX & Navigation
_Goal: polish everyday interactions once data is reliable._

### 3.1 Upgrade Post Cards (Priority: MEDIUM)
- Show title, author, relative date (`date-fns`), and a short excerpt.
- Switch feeds to a responsive grid instead of fixed widths.

### 3.2 Mobile Layout Improvements (Priority: HIGH)
- Use `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4` for post grids.
- Ensure paddings/typography adapt to mobile.

### 3.3 Mobile Menu Toggle (Priority: MEDIUM)
- Add a `MobileMenu` that collapses nav items behind a hamburger on small screens.

### 3.4 Comment UI (Priority: HIGH)  
**Backend dependency:** Backend Improvement 1.2.
- Build `Comment`, `CommentForm`, and `CommentList`.
- Display edit/delete buttons only when `comment.author.username === currentUser.username`.
- After any mutation, dispatch `fetchComments` again for that page.

### 3.5 Search Flow (Priority: MEDIUM)  
**Backend dependency:** Backend Improvement 3.1.
- `SearchBar` component pushes `?q=term` into the URL.
- `Search.jsx` fetches via `postApi.searchPosts(q)` and reuses the grid.

### 3.6 Filter & Sort UI (Priority: MEDIUM)  
**Backend dependency:** Backend Improvement 3.2.
- Build `FilterBar` with `<Select>` inputs for `sortBy` and `sortDir`.
- Pass selections to `postApi.getPosts`.

---

## Stage 4 – Profiles & Media
_Goal: add social/profile features once core UX feels good._

### 4.1 User Profile + Editing (Priority: MEDIUM)  
**Backend dependency:** Backend Improvements 1.1 & 3.3.
- `userApi.getUserProfile` and `userApi.updateProfile`.
- `UserProfile.jsx` shows avatar, bio, and authored posts.
- `EditProfile.jsx` lets the owner update name, bio, and profile picture URL.

### 4.2 Image Upload Component (Priority: MEDIUM)
**Backend dependency:** Backend media/upload endpoint or Appwrite storage.
- Validate file size, show a preview, upload to storage, return the URL to `PostForm`.

### 4.3 Share Helper (Priority: LOW)
- `sharePost(postId, title)` uses `navigator.share` when available, otherwise copies the URL to the clipboard.

---

## Stage 5 – Architecture & Performance
_Goal: keep the project tidy and fast as it grows._

### 5.1 Page Layout Wrapper (Priority: MEDIUM)
- Create `PageLayout` to standardize page titles and action buttons.

### 5.2 Feature-Based Folders (Priority: LOW)
- Organize components by feature (`components/posts`, `components/comments`, `components/common`, …).

### 5.3 Code Splitting (Priority: MEDIUM)
- `React.lazy` + `Suspense` for major routes to shorten initial load times.

### 5.4 Lazy Image Component (Priority: MEDIUM)
- Build `LazyImage` with skeleton placeholder, `loading="lazy"`, and error fallback.

### 5.5 Virtualized Lists (Priority: LOW)
- Use `react-window` whenever feeds become extremely long or when infinite scroll is enabled.

### 5.6 Accessibility Sweep (Priority: MEDIUM)
- Add `aria-label`s, preserve focus outlines, include skip links, and keep alt text meaningful.

---

## Stage 6 – Testing & Code Quality
_Goal: lock in quality before advanced releases._

### 6.1 ESLint & Prettier (Priority: MEDIUM)
- Enable React hooks plugin and run `npm run lint`.
- Configure Prettier (`.prettierrc`) and optionally `lint-staged` for auto-fixes.

### 6.2 Unit & Component Tests (Priority: MEDIUM)
- Install Vitest + Testing Library.
- Test `PostCard`, `Button`, `Pagination`, etc.

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### 6.3 Integration & API Tests (Priority: MEDIUM)
- Mock `axiosClient` to verify `postApi` and store slices handle success/error paths.

### 6.4 E2E Tests (Priority: LOW)
- Use Playwright/Cypress for “login → create post → verify content” flows.

### 6.5 Optional TypeScript Migration (Priority: LOW)
- Start by typing API helpers and Redux slices, then expand gradually.

---

## Stage 7 – Build & Deployment
_Goal: prep for real releases after mastering testing._

### 7.1 Tune Vite Build (Priority: MEDIUM)
- Add manual Rollup chunks for vendor/editor bundles.
- Configure `server.proxy` to `/api` for local development.

### 7.2 Helpful Scripts (Priority: MEDIUM)
- Update `package.json` with `build:prod`, `lint:fix`, `test:coverage`, etc.

### 7.3 Dockerize the SPA (Priority: LOW)
- Two-stage Dockerfile (Node build → Nginx serve) plus an SPA-friendly `nginx.conf`.

### 7.4 CI/CD Workflow (Priority: LOW)
- GitHub Actions job: `npm ci`, `npm run lint`, `npm run test`, `npm run build`.
- Inject `VITE_BACKEND_URL` via repository secrets.

---

## Stage 8 – Advanced & Nice-to-Have
_Goal: stretch yourself once everything else feels comfortable._

### 8.1 Infinite Scroll (Priority: LOW)
- Replace pagination buttons with `react-infinite-scroll-component`.

### 8.2 Dark Mode Toggle (Priority: LOW)
- `useTheme` hook toggles a `dark` class on `<html>` and remembers preference in `localStorage`.

### 8.3 Draft Autosave (Priority: LOW)
- `useDraft(key, formValues)` stores progress in `localStorage` and restores it later.

### 8.4 Notification Bell (Priority: LOW)  
**Backend dependency:** Backend Improvement 15.
- Poll `/notifications`, show unread badge, and list messages in a dropdown.

---

## Summary & Priority Matrix

| Stage | Focus | Priority Highlights |
|-------|-------|---------------------|
| Stage 1 | Foundations & Feedback | Env vars (Critical), Pagination (Critical), Toast errors (Critical), Loading states (High), Form validation (High) |
| Stage 2 | Reliable Data & State | Post slice (High), Comment slice (High), Axios interceptor (High), Error boundary (High), Retry helper (Medium) |
| Stage 3 | Core UX & Navigation | Mobile layout (High), Comment UI (High), PostCard upgrade (Medium), Search & filters (Medium), Mobile menu (Medium) |
| Stage 4 | Profiles & Media | User profile/edit (Medium), Image upload (Medium), Share helper (Low) |
| Stage 5 | Architecture & Performance | PageLayout (Medium), Code splitting (Medium), Lazy images (Medium), Virtual lists (Low), Accessibility (Medium) |
| Stage 6 | Testing & Quality | ESLint/Prettier (Medium), Unit/component/integration tests (Medium), E2E (Low), TypeScript (Low) |
| Stage 7 | Build & Deployment | Vite build tuning (Medium), Scripts (Medium), Docker (Low), CI/CD (Low) |
| Stage 8 | Advanced & Nice-to-Have | Infinite scroll (Low), Dark mode (Low), Drafts (Low), Notifications (Low) |

**Recommended flow:** finish each stage before the next. Every stage assumes earlier items are complete, so you build confidence step by step.

---

## Backend Dependency Map

| Frontend Task | Required Backend Improvement |
|---------------|-----------------------------|
| Pagination controls | Backend 1.3 – accepts `page/size/sort` params |
| Toast-friendly errors & Axios handling | Backend 2.1 – standardized error schema |
| Form validation UX | Backend 2.2 – DTO validation annotations |
| Comment UI & state | Backend 1.2 – comment CRUD endpoints |
| Search page | Backend 3.1 – `/posts/search` |
| Filter/sort UI | Backend 3.2 – filtering query params |
| User profile/edit | Backend 1.1 & 3.3 – profile endpoints |
| Notifications | Backend 15 – notification service |
| Image upload (if not using Appwrite) | Backend media endpoint or signed URLs |

Always deploy the backend improvement first, then wire up the matching frontend feature in the same stage.

---

*Keep revisiting this roadmap as you cross off tasks. Each stage completed means you leveled up your skills before tackling the next challenge.* 
# Frontend Improvements Documentation
## Aniverse Frontend - Comprehensive Improvement Guide

---

## Table of Contents
1. [Critical Fixes & Bug Fixes](#critical-fixes--bug-fixes)
2. [Error Handling & User Feedback](#error-handling--user-feedback)
3. [State Management Improvements](#state-management-improvements)
4. [API Integration Enhancements](#api-integration-enhancements)
5. [UI/UX Improvements](#uiux-improvements)
6. [Component Architecture](#component-architecture)
7. [Performance Optimization](#performance-optimization)
8. [Accessibility Improvements](#accessibility-improvements)
9. [Responsive Design](#responsive-design)
10. [Feature Implementations](#feature-implementations)
11. [Code Quality & Best Practices](#code-quality--best-practices)
12. [Testing & Quality Assurance](#testing--quality-assurance)
13. [Build & Deployment](#build--deployment)

---

## Critical Fixes & Bug Fixes

### 1.1 Fix Hardcoded Pagination
**Priority:** CRITICAL  
**Backend Dependency:** Backend Improvement 1.3 (Fix Hardcoded Pagination in PostController)

**Issue:**
The `getAllPosts` endpoint in `PostController` uses hardcoded `PageRequest.of(0, 10)`, and the frontend doesn't support pagination parameters.

**Current Code:**
```javascript
// postApi.js
getPosts: async () => {
    const response = await axiosClient.get('/posts');
    return response.data;
}
```

**Solution:**

**1.1.1 Update postApi.js:**
```javascript
const postApi = {
    getPosts: async (page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC') => {
        const response = await axiosClient.get('/posts', {
            params: { page, size, sortBy, sortDir }
        });
        return response.data; // Returns Spring Boot Page object
    },
    // ... other methods
}
```

**1.1.2 Create Pagination Component:**
```javascript
// components/Pagination.jsx
import React from 'react';
import { Button } from './index';

function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(0, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center items-center gap-2 mt-8">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2"
            >
                Previous
            </Button>
            
            {startPage > 0 && (
                <>
                    <Button onClick={() => onPageChange(0)}>1</Button>
                    {startPage > 1 && <span>...</span>}
                </>
            )}
            
            {pages.map(page => (
                <Button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={currentPage === page ? 'bg-blue-600' : ''}
                >
                    {page + 1}
                </Button>
            ))}
            
            {endPage < totalPages - 1 && (
                <>
                    {endPage < totalPages - 2 && <span>...</span>}
                    <Button onClick={() => onPageChange(totalPages - 1)}>
                        {totalPages}
                    </Button>
                </>
            )}
            
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2"
            >
                Next
            </Button>
        </div>
    );
}

export default Pagination;
```

**1.1.3 Update Home.jsx:**
```javascript
import React, { useState, useEffect } from 'react';
import { useLoaderData, useSearchParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import postApi from '../api/postApi';
import { Container, PostCard, Pagination } from '../components';

export const homeLoader = async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '0');
    const size = parseInt(url.searchParams.get('size') || '10');
    
    try {
        return await postApi.getPosts(page, size);
    } catch (err) {
        return { content: [], totalPages: 0, totalElements: 0 };
    }
};

function Home() {
    const data = useLoaderData();
    const [searchParams, setSearchParams] = useSearchParams();
    const authStatus = useSelector((state) => state.auth.status);
    
    const currentPage = parseInt(searchParams.get('page') || '0');
    const posts = data?.content || [];
    const totalPages = data?.totalPages || 0;

    const handlePageChange = (newPage) => {
        setSearchParams({ page: newPage.toString() });
    };

    // ... rest of component
}
```

---

### 1.2 Fix Error Handling in API Calls
**Priority:** CRITICAL  
**Backend Dependency:** Backend Improvement 2.1 (Global Exception Handler)

**Issue:**
Error handling is inconsistent. Some components use `alert()`, others use `console.error()`, and there's no user-friendly error display.

**Current Code:**
```javascript
// PostForm.jsx
catch (error) {
    console.error("Error submitting post:", error);
    alert("Failed to submit post. See console.");
}
```

**Solution:**

**1.2.1 Create Toast Notification System:**
```javascript
// components/Toast.jsx
import React, { useEffect, useState } from 'react';

function Toast({ message, type = 'error', onClose, duration = 5000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColor = {
        error: 'bg-red-500',
        success: 'bg-green-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    }[type];

    return (
        <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-4`}>
            <span>{message}</span>
            <button onClick={onClose} className="text-white hover:text-gray-200">
                ×
            </button>
        </div>
    );
}

// hooks/useToast.js
import { useState, useCallback } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'error', duration = 5000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type, duration }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return { toasts, showToast, removeToast };
}

// components/ToastContainer.jsx
import React from 'react';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
}

export default ToastContainer;
```

**1.2.2 Create Error Handler Utility:**
```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
    // Backend returns standardized error format after Backend Improvement 2.1
    if (error.response?.data) {
        const { errorCode, message, fieldErrors } = error.response.data;
        
        if (fieldErrors) {
            // Validation errors
            const errorMessages = Object.entries(fieldErrors)
                .map(([field, msg]) => `${field}: ${msg}`)
                .join(', ');
            return errorMessages || message;
        }
        
        return message || 'An error occurred';
    }
    
    if (error.request) {
        return 'Network error. Please check your connection.';
    }
    
    return error.message || 'An unexpected error occurred';
};
```

**1.2.3 Update PostForm.jsx:**
```javascript
import { useToast } from '../hooks/useToast';
import { handleApiError } from '../utils/errorHandler';

function PostForm({ post }) {
    const { showToast } = useToast();
    // ... existing code

    const submit = async (data) => {
        try {
            if (post) {
                const dbPost = await postApi.updatePost(post.id, {
                    title: data.title,
                    content: data.content
                });
                if (dbPost) {
                    showToast('Post updated successfully!', 'success');
                    navigate(`/post/${dbPost.id}`);
                }
            } else {
                const dbPost = await postApi.createPost({
                    title: data.title,
                    content: data.content
                });
                if (dbPost) {
                    showToast('Post created successfully!', 'success');
                    navigate(`/post/${dbPost.id}`);
                }
            }
        } catch (error) {
            const errorMessage = handleApiError(error);
            showToast(errorMessage, 'error');
        }
    };
    // ... rest of component
}
```

---

### 1.3 Fix Loading States
**Priority:** HIGH

**Issue:**
No loading indicators during API calls, leading to poor UX.

**Solution:**

**1.3.1 Create Loading Spinner Component:**
```javascript
// components/LoadingSpinner.jsx
import React from 'react';
import { ClipLoader } from 'react-spinners';

function LoadingSpinner({ size = 40, color = '#6E8CFB', fullScreen = false }) {
    const spinner = (
        <div className="flex justify-center items-center">
            <ClipLoader size={size} color={color} />
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
}

export default LoadingSpinner;
```

**1.3.2 Add Loading States to Components:**
```javascript
// pages/Home.jsx
import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

function Home() {
    const [loading, setLoading] = useState(false);
    const [posts, setPosts] = useState([]);
    // ... existing code

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const data = await postApi.getPosts(currentPage, 10);
                setPosts(data.content || []);
            } catch (error) {
                showToast(handleApiError(error), 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [currentPage]);

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    // ... rest of component
}
```

---

## Error Handling & User Feedback

### 2.1 Implement Comprehensive Error Boundaries
**Priority:** HIGH

**Implementation:**

**2.1.1 Create Error Boundary Component:**
```javascript
// components/ErrorBoundary.jsx
import React from 'react';
import { Button } from './index';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // Log to error tracking service (e.g., Sentry)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#3C467B]">
                    <div className="text-center text-white">
                        <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
                        <p className="mb-6">{this.state.error?.message || 'An unexpected error occurred'}</p>
                        <Button onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
```

**2.1.2 Wrap App with Error Boundary:**
```javascript
// main.jsx
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <ErrorBoundary>
                <RouterProvider router={router} />
            </ErrorBoundary>
        </Provider>
    </React.StrictMode>
);
```

---

### 2.2 Improve Form Validation Feedback
**Priority:** HIGH  
**Backend Dependency:** Backend Improvement 2.2 (Add Request Validation)

**Issue:**
Forms use `react-hook-form` but validation errors aren't displayed clearly.

**Solution:**

**2.2.1 Create FormError Component:**
```javascript
// components/FormError.jsx
import React from 'react';

function FormError({ error }) {
    if (!error) return null;
    
    return (
        <span className="text-red-500 text-sm mt-1 block">
            {error.message || 'This field is required'}
        </span>
    );
}

export default FormError;
```

**2.2.2 Update PostForm.jsx:**
```javascript
import FormError from '../components/FormError';

function PostForm({ post }) {
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        defaultValues: {
            title: post?.title || '',
            content: post?.content || '',
        }
    });

    return (
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
                <Input
                    label="Title :"
                    placeholder="Title"
                    className={`mb-4 ${errors.title ? 'border-red-500' : ''}`}
                    {...register("title", { 
                        required: "Title is required",
                        minLength: {
                            value: 3,
                            message: "Title must be at least 3 characters"
                        },
                        maxLength: {
                            value: 255,
                            message: "Title must not exceed 255 characters"
                        }
                    })}
                />
                <FormError error={errors.title} />
                
                <RTE 
                    label="Content :" 
                    name="content" 
                    control={control}
                    rules={{
                        required: "Content is required",
                        minLength: {
                            value: 10,
                            message: "Content must be at least 10 characters"
                        }
                    }}
                />
                <FormError error={errors.content} />
            </div>
            {/* ... rest of form */}
        </form>
    );
}
```

---

## State Management Improvements

### 3.1 Implement Post Slice Properly
**Priority:** HIGH

**Issue:**
`postSlice.js` is completely commented out. Posts are fetched in loaders but not stored in Redux.

**Solution:**

**3.1.1 Implement Post Slice:**
```javascript
// store/slices/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postApi from '../../api/postApi';

export const fetchPosts = createAsyncThunk(
    'posts/fetchPosts',
    async ({ page = 0, size = 10, sortBy = 'createdAt', sortDir = 'DESC' } = {}, { rejectWithValue }) => {
        try {
            const response = await postApi.getPosts(page, size, sortBy, sortDir);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
        }
    }
);

export const fetchPost = createAsyncThunk(
    'posts/fetchPost',
    async (postId, { rejectWithValue }) => {
        try {
            const response = await postApi.getPost(postId);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
        }
    }
);

export const createPost = createAsyncThunk(
    'posts/createPost',
    async (postData, { rejectWithValue }) => {
        try {
            const response = await postApi.createPost(postData);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create post');
        }
    }
);

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await postApi.updatePost(id, data);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update post');
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (postId, { rejectWithValue }) => {
        try {
            await postApi.deletePost(postId);
            return postId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
        }
    }
);

const postSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [],
        currentPost: null,
        totalPages: 0,
        totalElements: 0,
        currentPage: 0,
        loading: false,
        error: null,
        creating: false,
        updating: false,
        deleting: false
    },
    reducers: {
        clearPosts: (state) => {
            state.posts = [];
            state.currentPost = null;
            state.totalPages = 0;
            state.totalElements = 0;
            state.currentPage = 0;
            state.error = null;
        },
        clearCurrentPost: (state) => {
            state.currentPost = null;
        },
        setCurrentPage: (state, action) => {
            state.currentPage = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Fetch Posts
        builder
            .addCase(fetchPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPosts.fulfilled, (state, action) => {
                state.loading = false;
                state.posts = action.payload.content;
                state.totalPages = action.payload.totalPages;
                state.totalElements = action.payload.totalElements;
            })
            .addCase(fetchPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
        
        // Fetch Single Post
        .addCase(fetchPost.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchPost.fulfilled, (state, action) => {
            state.loading = false;
            state.currentPost = action.payload;
        })
        .addCase(fetchPost.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        
        // Create Post
        .addCase(createPost.pending, (state) => {
            state.creating = true;
            state.error = null;
        })
        .addCase(createPost.fulfilled, (state, action) => {
            state.creating = false;
            state.posts.unshift(action.payload);
            state.totalElements += 1;
        })
        .addCase(createPost.rejected, (state, action) => {
            state.creating = false;
            state.error = action.payload;
        })
        
        // Update Post
        .addCase(updatePost.pending, (state) => {
            state.updating = true;
            state.error = null;
        })
        .addCase(updatePost.fulfilled, (state, action) => {
            state.updating = false;
            const index = state.posts.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.posts[index] = action.payload;
            }
            if (state.currentPost?.id === action.payload.id) {
                state.currentPost = action.payload;
            }
        })
        .addCase(updatePost.rejected, (state, action) => {
            state.updating = false;
            state.error = action.payload;
        })
        
        // Delete Post
        .addCase(deletePost.pending, (state) => {
            state.deleting = true;
            state.error = null;
        })
        .addCase(deletePost.fulfilled, (state, action) => {
            state.deleting = false;
            state.posts = state.posts.filter(p => p.id !== action.payload);
            state.totalElements -= 1;
        })
        .addCase(deletePost.rejected, (state, action) => {
            state.deleting = false;
            state.error = action.payload;
        });
    }
});

export const { clearPosts, clearCurrentPost, setCurrentPage } = postSlice.actions;
export default postSlice.reducer;
```

---

### 3.2 Add Comment State Management
**Priority:** HIGH  
**Backend Dependency:** Backend Improvement 1.2 (Implement Comment CRUD Operations)

**Implementation:**

**3.2.1 Create Comment API:**
```javascript
// api/commentApi.js
import axiosClient from "./axiosClient";

const commentApi = {
    getComments: async (postId, page = 0, size = 10) => {
        const response = await axiosClient.get(`/posts/${postId}/comments`, {
            params: { page, size }
        });
        return response.data;
    },

    createComment: async (postId, commentData) => {
        const response = await axiosClient.post(`/posts/${postId}/comments`, commentData);
        return response.data;
    },

    updateComment: async (postId, commentId, commentData) => {
        const response = await axiosClient.put(`/posts/${postId}/comments/${commentId}`, commentData);
        return response.data;
    },

    deleteComment: async (postId, commentId) => {
        await axiosClient.delete(`/posts/${postId}/comments/${commentId}`);
    }
};

export default commentApi;
```

**3.2.2 Create Comment Slice:**
```javascript
// store/slices/commentSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import commentApi from '../../api/commentApi';

export const fetchComments = createAsyncThunk(
    'comments/fetchComments',
    async ({ postId, page = 0, size = 10 }, { rejectWithValue }) => {
        try {
            const response = await commentApi.getComments(postId, page, size);
            return { postId, ...response };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
        }
    }
);

export const createComment = createAsyncThunk(
    'comments/createComment',
    async ({ postId, commentData }, { rejectWithValue }) => {
        try {
            const response = await commentApi.createComment(postId, commentData);
            return { postId, comment: response };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create comment');
        }
    }
);

// ... similar for update and delete

const commentSlice = createSlice({
    name: 'comments',
    initialState: {
        commentsByPost: {}, // { postId: { comments: [], totalPages: 0, ... } }
        loading: false,
        error: null
    },
    reducers: {
        clearComments: (state, action) => {
            if (action.payload) {
                delete state.commentsByPost[action.payload];
            } else {
                state.commentsByPost = {};
            }
        }
    },
    extraReducers: (builder) => {
        // ... implement reducers
    }
});

export default commentSlice.reducer;
```

---

## API Integration Enhancements

### 4.1 Improve Axios Interceptor
**Priority:** HIGH  
**Backend Dependency:** Backend Improvement 2.1 (Global Exception Handler)

**Issue:**
Axios interceptor doesn't handle token refresh or 401 errors properly.

**Solution:**

**4.1.1 Update axiosClient.js:**
```javascript
import axios from 'axios';
import { store } from '../store/store';
import { logout } from '../store/slices/authSlice';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1';

const axiosClient = axios.create({
    baseURL,
    timeout: 10000, // Increased timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true 
});

let memoryToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

export const setMemoryToken = (token) => {
    memoryToken = token;
    if (token) {
        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosClient.defaults.headers.common['Authorization'];
    }
};

// Request interceptor
axiosClient.interceptors.request.use(
    (config) => {
        if (memoryToken) {
            config.headers.Authorization = `Bearer ${memoryToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosClient(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(`${baseURL}/auth/refresh`, {}, {
                    withCredentials: true
                });
                const { token } = response.data;
                setMemoryToken(token);
                processQueue(null, token);
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return axiosClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                store.dispatch(logout());
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle other errors
        if (error.response?.status >= 500) {
            // Server error - show generic message
            error.userMessage = 'Server error. Please try again later.';
        } else if (error.response?.status === 403) {
            error.userMessage = 'You do not have permission to perform this action.';
        } else if (error.response?.status === 404) {
            error.userMessage = 'Resource not found.';
        } else if (!error.response) {
            error.userMessage = 'Network error. Please check your connection.';
        }

        return Promise.reject(error);
    }
);

export default axiosClient;
```

---

### 4.2 Add Request Retry Logic
**Priority:** MEDIUM

**Implementation:**
```javascript
// utils/retryRequest.js
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            if (error.response?.status >= 500) {
                // Only retry on server errors
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                continue;
            }
            throw error;
        }
    }
};
```

---

## UI/UX Improvements

### 5.1 Enhance PostCard Component
**Priority:** MEDIUM

**Current Issue:**
PostCard only shows title. No author info, date, excerpt, or image.

**Solution:**

**5.1.1 Enhanced PostCard:**
```javascript
// components/PostCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

function PostCard({ id, title, content, author, createdAt }) {
    // Truncate content for preview
    const excerpt = content 
        ? content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
        : '';

    const formattedDate = createdAt 
        ? formatDistanceToNow(new Date(createdAt), { addSuffix: true })
        : '';

    return (
        <Link to={`/post/${id}`}>
            <div className='w-full bg-gray-100 text-[#6E8CFB] rounded-xl p-4 min-h-[200px] flex flex-col justify-between hover:shadow-lg transition-shadow'>
                <div>
                    <h2 className='text-xl font-bold mb-2 line-clamp-2'>
                        {title}
                    </h2>
                    {excerpt && (
                        <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                            {excerpt}
                        </p>
                    )}
                </div>
                <div className='flex justify-between items-center text-xs text-gray-500 mt-auto'>
                    {author && (
                        <span className='font-semibold'>
                            {author.username || author.name}
                        </span>
                    )}
                    {formattedDate && (
                        <span>{formattedDate}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default PostCard;
```

**5.1.2 Add date-fns dependency:**
```bash
npm install date-fns
```

---

### 5.2 Implement Comment System UI
**Priority:** HIGH  
**Backend Dependency:** Backend Improvement 1.2 (Comment CRUD Operations)

**Implementation:**

**5.2.1 Create Comment Component:**
```javascript
// components/Comment.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './index';
import commentApi from '../api/commentApi';
import { useToast } from '../hooks/useToast';
import { handleApiError } from '../utils/errorHandler';

function Comment({ comment, postId, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const userData = useSelector((state) => state.auth.userData);
    const { showToast } = useToast();
    
    const isAuthor = userData?.username === comment.author?.username;

    const handleUpdate = async () => {
        try {
            await commentApi.updateComment(postId, comment.id, { content: editContent });
            onUpdate();
            setIsEditing(false);
            showToast('Comment updated successfully', 'success');
        } catch (error) {
            showToast(handleApiError(error), 'error');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await commentApi.deleteComment(postId, comment.id);
                onDelete();
                showToast('Comment deleted successfully', 'success');
            } catch (error) {
                showToast(handleApiError(error), 'error');
            }
        }
    };

    return (
        <div className="border-b border-gray-200 py-4">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="font-semibold">{comment.author?.username}</span>
                    <span className="text-gray-500 text-sm ml-2">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                </div>
                {isAuthor && (
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsEditing(!isEditing)}
                            className="text-xs px-2 py-1"
                        >
                            {isEditing ? 'Cancel' : 'Edit'}
                        </Button>
                        <Button
                            onClick={handleDelete}
                            className="text-xs px-2 py-1 bg-red-500"
                        >
                            Delete
                        </Button>
                    </div>
                )}
            </div>
            {isEditing ? (
                <div>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows="3"
                    />
                    <Button onClick={handleUpdate} className="mt-2">
                        Save
                    </Button>
                </div>
            ) : (
                <p className="text-gray-700">{comment.content}</p>
            )}
        </div>
    );
}

export default Comment;
```

**5.2.2 Create CommentList Component:**
```javascript
// components/CommentList.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchComments } from '../store/slices/commentSlice';
import Comment from './Comment';
import CommentForm from './CommentForm';
import LoadingSpinner from './LoadingSpinner';
import Pagination from './Pagination';

function CommentList({ postId }) {
    const dispatch = useDispatch();
    const { commentsByPost } = useSelector((state) => state.comments);
    const [currentPage, setCurrentPage] = useState(0);
    
    const postComments = commentsByPost[postId] || { content: [], totalPages: 0 };
    const comments = postComments.content || [];
    const loading = postComments.loading || false;

    useEffect(() => {
        dispatch(fetchComments({ postId, page: currentPage, size: 10 }));
    }, [dispatch, postId, currentPage]);

    const handleCommentUpdate = () => {
        dispatch(fetchComments({ postId, page: currentPage, size: 10 }));
    };

    return (
        <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4">Comments</h3>
            <CommentForm postId={postId} onCommentAdded={handleCommentUpdate} />
            
            {loading ? (
                <LoadingSpinner />
            ) : comments.length === 0 ? (
                <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            ) : (
                <>
                    <div className="space-y-4">
                        {comments.map(comment => (
                            <Comment
                                key={comment.id}
                                comment={comment}
                                postId={postId}
                                onUpdate={handleCommentUpdate}
                                onDelete={handleCommentUpdate}
                            />
                        ))}
                    </div>
                    {postComments.totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={postComments.totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default CommentList;
```

**5.2.3 Update Post.jsx:**
```javascript
import CommentList from '../components/CommentList';

function Post() {
    // ... existing code
    
    return post ? (
        <div className="py-8">
            <Container>
                {/* ... existing post content */}
                <CommentList postId={post.id} />
            </Container>
        </div>
    ) : null;
}
```

---

### 5.3 Add Search Functionality
**Priority:** MEDIUM  
**Backend Dependency:** Backend Improvement 3.1 (Add Search Functionality)

**Implementation:**

**5.3.1 Create SearchBar Component:**
```javascript
// components/SearchBar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from './index';

function SearchBar({ placeholder = "Search posts..." }) {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-md">
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
            />
            <Button type="submit">Search</Button>
        </form>
    );
}

export default SearchBar;
```

**5.3.2 Create Search Page:**
```javascript
// pages/Search.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, PostCard, LoadingSpinner } from '../components';
import postApi from '../api/postApi';

function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) {
            setLoading(true);
            postApi.searchPosts(query)
                .then(data => {
                    setPosts(data.content || []);
                })
                .catch(error => {
                    console.error('Search error:', error);
                })
                .finally(() => setLoading(false));
        }
    }, [query]);

    return (
        <div className="py-8">
            <Container>
                <h1 className="text-3xl font-bold mb-4">
                    Search Results{query && ` for "${query}"`}
                </h1>
                {loading ? (
                    <LoadingSpinner />
                ) : posts.length === 0 ? (
                    <p>No posts found matching your search.</p>
                ) : (
                    <div className="flex flex-wrap">
                        {posts.map(post => (
                            <div key={post.id} className="p-2 w-1/4">
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default Search;
```

**5.3.3 Update postApi.js:**
```javascript
searchPosts: async (query, page = 0, size = 10) => {
    const response = await axiosClient.get('/posts/search', {
        params: { q: query, page, size }
    });
    return response.data;
}
```

---

### 5.4 Implement User Profile Page
**Priority:** MEDIUM  
**Backend Dependency:** Backend Improvement 1.1 (Fix getUserProfile) & 3.3 (User Profile Update)

**Implementation:**

**5.4.1 Create UserProfile Page:**
```javascript
// pages/UserProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Button, LoadingSpinner } from '../components';
import userApi from '../api/userApi';
import postApi from '../api/postApi';
import PostCard from '../components/PostCard';

function UserProfile() {
    const { username } = useParams();
    const currentUser = useSelector((state) => state.auth.userData);
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const isOwnProfile = currentUser?.username === username;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileData, postsData] = await Promise.all([
                    userApi.getUserProfile(username),
                    postApi.getPostsByUser(username)
                ]);
                setProfile(profileData);
                setPosts(postsData.content || []);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) return <LoadingSpinner fullScreen />;
    if (!profile) return <div>User not found</div>;

    return (
        <div className="py-8">
            <Container>
                <div className="bg-white rounded-lg p-6 mb-6">
                    <div className="flex items-center gap-6">
                        {profile.profilePic && (
                            <img
                                src={profile.profilePic}
                                alt={profile.username}
                                className="w-24 h-24 rounded-full"
                            />
                        )}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold">{profile.name || profile.username}</h1>
                            <p className="text-gray-500">@{profile.username}</p>
                            {profile.bio && <p className="mt-2">{profile.bio}</p>}
                        </div>
                        {isOwnProfile && (
                            <Link to={`/profile/${username}/edit`}>
                                <Button>Edit Profile</Button>
                            </Link>
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">Posts</h2>
                {posts.length === 0 ? (
                    <p>No posts yet.</p>
                ) : (
                    <div className="flex flex-wrap">
                        {posts.map(post => (
                            <div key={post.id} className="p-2 w-1/4">
                                <PostCard {...post} />
                            </div>
                        ))}
                    </div>
                )}
            </Container>
        </div>
    );
}

export default UserProfile;
```

**5.4.2 Create EditProfile Page:**
```javascript
// pages/EditProfile.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Input, Button, FormError } from '../components';
import { useToast } from '../hooks/useToast';
import { handleApiError } from '../utils/errorHandler';
import userApi from '../api/userApi';

function EditProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        try {
            await userApi.updateProfile(username, data);
            showToast('Profile updated successfully', 'success');
            navigate(`/profile/${username}`);
        } catch (error) {
            showToast(handleApiError(error), 'error');
        }
    };

    return (
        <div className="py-8">
            <Container>
                <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
                <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
                    <Input
                        label="Name"
                        {...register('name', { maxLength: 50 })}
                    />
                    <FormError error={errors.name} />

                    <Input
                        label="Bio"
                        type="textarea"
                        rows="4"
                        {...register('bio', { maxLength: 500 })}
                    />
                    <FormError error={errors.bio} />

                    <Input
                        label="Profile Picture URL"
                        type="url"
                        {...register('profilePic')}
                    />
                    <FormError error={errors.profilePic} />

                    <Button type="submit" className="mt-4">
                        Save Changes
                    </Button>
                </form>
            </Container>
        </div>
    );
}

export default EditProfile;
```

**5.4.3 Create userApi.js:**
```javascript
// api/userApi.js
import axiosClient from "./axiosClient";

const userApi = {
    getUserProfile: async (username) => {
        const response = await axiosClient.get(`/users/${username}`);
        return response.data;
    },

    updateProfile: async (username, data) => {
        const response = await axiosClient.put(`/users/${username}`, data);
        return response.data;
    }
};

export default userApi;
```

---

## Component Architecture

### 6.1 Create Reusable Layout Components
**Priority:** MEDIUM

**Implementation:**

**6.1.1 Create PageLayout Component:**
```javascript
// components/layouts/PageLayout.jsx
import React from 'react';
import { Container } from '../index';

function PageLayout({ title, children, actions }) {
    return (
        <div className="py-8">
            <Container>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    {actions && <div className="flex gap-2">{actions}</div>}
                </div>
                {children}
            </Container>
        </div>
    );
}

export default PageLayout;
```

---

### 6.2 Improve Component Organization
**Priority:** LOW

**Recommendation:**
Organize components by feature:
```
components/
  auth/
    Login.jsx
    SignUp.jsx
  posts/
    PostCard.jsx
    PostForm.jsx
    PostList.jsx
  comments/
    Comment.jsx
    CommentList.jsx
    CommentForm.jsx
  common/
    Button.jsx
    Input.jsx
    LoadingSpinner.jsx
```

---

## Performance Optimization

### 7.1 Implement Code Splitting
**Priority:** MEDIUM

**Implementation:**

**7.1.1 Lazy Load Routes:**
```javascript
// main.jsx
import { lazy, Suspense } from 'react';
import LoadingSpinner from './components/LoadingSpinner';

const Home = lazy(() => import('./pages/Home'));
const AllPosts = lazy(() => import('./pages/AllPosts'));
const Post = lazy(() => import('./pages/Post'));

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path='/' element={<App />}>
            <Route 
                path='/' 
                element={
                    <Suspense fallback={<LoadingSpinner fullScreen />}>
                        <Home />
                    </Suspense>
                } 
                loader={homeLoader} 
            />
            {/* ... other routes */}
        </Route>
    )
);
```

---

### 7.2 Implement Virtual Scrolling for Large Lists
**Priority:** LOW

**Implementation:**
Use `react-window` for large post lists:
```bash
npm install react-window
```

---

### 7.3 Optimize Image Loading
**Priority:** MEDIUM

**Implementation:**
```javascript
// components/LazyImage.jsx
import React, { useState } from 'react';

function LazyImage({ src, alt, className, placeholder }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {!loaded && !error && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            {error ? (
                <div className="bg-gray-200 flex items-center justify-center">
                    {placeholder || 'Image'}
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                    onLoad={() => setLoaded(true)}
                    onError={() => setError(true)}
                    loading="lazy"
                />
            )}
        </div>
    );
}

export default LazyImage;
```

---

## Accessibility Improvements

### 8.1 Add ARIA Labels
**Priority:** MEDIUM

**Implementation:**
```javascript
// Update Button component
<button
    className={...}
    type={type}
    aria-label={ariaLabel || children}
    {...props}
>
    {children}
</button>
```

---

### 8.2 Improve Keyboard Navigation
**Priority:** MEDIUM

**Implementation:**
- Add focus management
- Ensure all interactive elements are keyboard accessible
- Add skip links

---

### 8.3 Add Screen Reader Support
**Priority:** LOW

**Implementation:**
- Add proper semantic HTML
- Use ARIA roles where needed
- Add descriptive alt text for images

---

## Responsive Design

### 9.1 Improve Mobile Layout
**Priority:** HIGH

**Issue:**
PostCard uses fixed `w-1/4` which doesn't work well on mobile.

**Solution:**
```javascript
// PostCard grid
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {posts.map(post => (
        <PostCard key={post.id} {...post} />
    ))}
</div>
```

---

### 9.2 Add Mobile Menu
**Priority:** MEDIUM

**Implementation:**
```javascript
// components/MobileMenu.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function MobileMenu({ navItems }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)}>
                ☰
            </button>
            {isOpen && (
                <nav className="absolute top-full left-0 right-0 bg-white shadow-lg">
                    {navItems.map(item => (
                        <Link key={item.slug} to={item.slug}>
                            {item.name}
                        </Link>
                    ))}
                </nav>
            )}
        </div>
    );
}
```

---

## Feature Implementations

### 10.1 Add Filtering and Sorting UI
**Priority:** MEDIUM  
**Backend Dependency:** Backend Improvement 3.2 (Add Filtering and Sorting)

**Implementation:**

**10.1.1 Create FilterBar Component:**
```javascript
// components/FilterBar.jsx
import React from 'react';
import { Select } from './index';

function FilterBar({ onFilterChange, filters }) {
    return (
        <div className="flex gap-4 mb-6">
            <Select
                label="Sort By"
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value })}
            >
                <option value="createdAt">Date</option>
                <option value="title">Title</option>
            </Select>
            <Select
                label="Order"
                value={filters.sortDir}
                onChange={(e) => onFilterChange({ ...filters, sortDir: e.target.value })}
            >
                <option value="DESC">Newest First</option>
                <option value="ASC">Oldest First</option>
            </Select>
        </div>
    );
}

export default FilterBar;
```

---

### 10.2 Implement Infinite Scroll
**Priority:** LOW

**Implementation:**
Use `react-infinite-scroll-component`:
```bash
npm install react-infinite-scroll-component
```

---

### 10.3 Add Dark Mode
**Priority:** LOW

**Implementation:**
```javascript
// hooks/useTheme.js
import { useState, useEffect } from 'react';

export function useTheme() {
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') || 'light'
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
}
```

---

## Code Quality & Best Practices

### 11.1 Add ESLint Configuration
**Priority:** MEDIUM

**Current Status:**
ESLint is configured but may need rules update.

**Recommendation:**
Add stricter rules and fix existing issues.

---

### 11.2 Add Prettier for Code Formatting
**Priority:** LOW

**Implementation:**
```bash
npm install --save-dev prettier
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

### 11.3 Add TypeScript (Optional)
**Priority:** LOW

**Consideration:**
Gradually migrate to TypeScript for better type safety.

---

## Testing & Quality Assurance

### 12.1 Add Unit Tests
**Priority:** MEDIUM

**Implementation:**
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Example Test:**
```javascript
// components/__tests__/PostCard.test.jsx
import { render, screen } from '@testing-library/react';
import PostCard from '../PostCard';

describe('PostCard', () => {
    it('renders post title', () => {
        render(<PostCard id={1} title="Test Post" />);
        expect(screen.getByText('Test Post')).toBeInTheDocument();
    });
});
```

---

### 12.2 Add E2E Testing
**Priority:** LOW

**Implementation:**
Use Playwright or Cypress for end-to-end testing:

```bash
npm install --save-dev @playwright/test
```

**Example Test:**
```javascript
// e2e/post-creation.spec.js
import { test, expect } from '@playwright/test';

test('user can create a post', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await page.goto('/add-post');
    await page.fill('[name="title"]', 'Test Post');
    await page.fill('[name="content"]', 'Test content');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/\/post\/\d+/);
    await expect(page.locator('h1')).toContainText('Test Post');
});
```

---

### 12.3 Add Component Testing
**Priority:** MEDIUM

**Implementation:**
Test individual components in isolation:

```javascript
// components/__tests__/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

describe('Button', () => {
    it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        
        fireEvent.click(screen.getByText('Click me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    
    it('renders with custom className', () => {
        render(<Button className="custom-class">Test</Button>);
        expect(screen.getByText('Test')).toHaveClass('custom-class');
    });
});
```

---

### 12.4 Add Integration Tests for API Calls
**Priority:** MEDIUM

**Implementation:**
Mock API calls and test component behavior:

```javascript
// __tests__/api/postApi.test.js
import { vi } from 'vitest';
import postApi from '../../api/postApi';
import axiosClient from '../../api/axiosClient';

vi.mock('../../api/axiosClient');

describe('postApi', () => {
    it('fetches posts with pagination', async () => {
        const mockData = { content: [], totalPages: 1 };
        axiosClient.get.mockResolvedValue({ data: mockData });
        
        const result = await postApi.getPosts(0, 10);
        
        expect(axiosClient.get).toHaveBeenCalledWith('/posts', {
            params: { page: 0, size: 10, sortBy: 'createdAt', sortDir: 'DESC' }
        });
        expect(result).toEqual(mockData);
    });
});
```

---

## Build & Deployment

### 13.1 Optimize Build Configuration
**Priority:** MEDIUM

**Implementation:**

**13.1.1 Update vite.config.js:**
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    redux: ['@reduxjs/toolkit', 'react-redux'],
                    editor: ['@tinymce/tinymce-react', 'tinymce']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true
            }
        }
    }
});
```

---

### 13.2 Add Environment Variable Management
**Priority:** HIGH

**Issue:**
Backend URL is hardcoded with fallback. Should use environment variables properly.

**Solution:**

**13.2.1 Create .env.example:**
```env
VITE_BACKEND_URL=http://localhost:8080/api/v1
VITE_APP_NAME=Aniverse
VITE_APPWRITE_URL=
VITE_APPWRITE_PROJECT_ID=
```

**13.2.2 Update axiosClient.js:**
```javascript
const baseURL = import.meta.env.VITE_BACKEND_URL;
if (!baseURL) {
    throw new Error('VITE_BACKEND_URL environment variable is not set');
}
```

**13.2.3 Create Environment Config:**
```javascript
// config/env.js
export const config = {
    apiUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api/v1',
    appName: import.meta.env.VITE_APP_NAME || 'Aniverse',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
};
```

---

### 13.3 Add Build Scripts
**Priority:** MEDIUM

**Update package.json:**
```json
{
    "scripts": {
        "dev": "vite",
        "build": "vite build",
        "build:prod": "vite build --mode production",
        "preview": "vite preview",
        "lint": "eslint .",
        "lint:fix": "eslint . --fix",
        "test": "vitest",
        "test:ui": "vitest --ui",
        "test:coverage": "vitest --coverage"
    }
}
```

---

### 13.4 Add Docker Configuration
**Priority:** LOW  
**Backend Dependency:** Backend Improvement 35 (Create Docker Configuration)

**Implementation:**

**13.4.1 Create Dockerfile:**
```dockerfile
# Frontend/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**13.4.2 Create nginx.conf:**
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

### 13.5 Add CI/CD Pipeline
**Priority:** LOW

**Implementation:**

**13.5.1 Create .github/workflows/frontend.yml:**
```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'Frontend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'Frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./Frontend
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test
      
      - name: Build
        run: npm run build
        env:
          VITE_BACKEND_URL: ${{ secrets.VITE_BACKEND_URL }}
```

---

## Additional Feature Implementations

### 14.1 Add Image Upload Functionality
**Priority:** MEDIUM

**Backend Dependency:** Backend needs image upload endpoint or use external service (Appwrite)

**Implementation:**

**14.1.1 Create ImageUpload Component:**
```javascript
// components/ImageUpload.jsx
import React, { useState } from 'react';
import { useToast } from '../hooks/useToast';

function ImageUpload({ onUpload, maxSize = 5 * 1024 * 1024 }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const { showToast } = useToast();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > maxSize) {
            showToast('File size exceeds maximum limit', 'error');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload to Appwrite or backend
        setUploading(true);
        try {
            // Implement upload logic
            const imageUrl = await uploadToAppwrite(file);
            onUpload(imageUrl);
            showToast('Image uploaded successfully', 'success');
        } catch (error) {
            showToast('Failed to upload image', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
            />
            {preview && (
                <img src={preview} alt="Preview" className="mt-2 max-w-xs" />
            )}
        </div>
    );
}

export default ImageUpload;
```

---

### 14.2 Add Post Preview Feature
**Priority:** LOW

**Implementation:**
Add a preview mode in PostForm before submitting:

```javascript
// components/PostForm.jsx
const [previewMode, setPreviewMode] = useState(false);

// Add preview button
<Button
    type="button"
    onClick={() => setPreviewMode(!previewMode)}
>
    {previewMode ? 'Edit' : 'Preview'}
</Button>

// Show preview
{previewMode && (
    <div className="preview">
        <h1>{watch('title')}</h1>
        <div dangerouslySetInnerHTML={{ __html: watch('content') }} />
    </div>
)}
```

---

### 14.3 Add Post Drafts
**Priority:** LOW  
**Backend Dependency:** Backend needs draft support

**Implementation:**
Save drafts to localStorage or backend:

```javascript
// hooks/useDraft.js
import { useEffect } from 'react';

export function useDraft(key, formData) {
    // Load draft on mount
    useEffect(() => {
        const draft = localStorage.getItem(key);
        if (draft) {
            // Restore form data
        }
    }, [key]);

    // Save draft on change
    useEffect(() => {
        if (formData) {
            localStorage.setItem(key, JSON.stringify(formData));
        }
    }, [key, formData]);
}
```

---

### 14.4 Add Share Functionality
**Priority:** LOW

**Implementation:**
```javascript
// utils/share.js
export const sharePost = async (postId, title) => {
    const url = `${window.location.origin}/post/${postId}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title,
                url
            });
        } catch (error) {
            // User cancelled or error occurred
        }
    } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
    }
};
```

---

### 14.5 Add Notification System
**Priority:** LOW  
**Backend Dependency:** Backend Improvement 15 (Build Notifications System)

**Implementation:**

**14.5.1 Create Notification Component:**
```javascript
// components/NotificationBell.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications } from '../store/slices/notificationSlice';

function NotificationBell() {
    const dispatch = useDispatch();
    const { notifications, unreadCount } = useSelector(state => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
        // Poll for new notifications
        const interval = setInterval(() => {
            dispatch(fetchNotifications());
        }, 30000); // Every 30 seconds

        return () => clearInterval(interval);
    }, [dispatch]);

    return (
        <div className="relative">
            <button className="relative">
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
        </div>
    );
}

export default NotificationBell;
```

---

## Summary & Priority Matrix

### Critical (Do First):
1. Fix Hardcoded Pagination (1.1)
2. Fix Error Handling in API Calls (1.2)
3. Fix Loading States (1.3)
4. Implement Post Slice Properly (3.1)
5. Add Environment Variable Management (13.2)

### High Priority:
6. Implement Comprehensive Error Boundaries (2.1)
7. Improve Form Validation Feedback (2.2)
8. Add Comment State Management (3.2)
9. Improve Axios Interceptor (4.1)
10. Implement Comment System UI (5.2)
11. Improve Mobile Layout (9.1)

### Medium Priority:
12. Enhance PostCard Component (5.1)
13. Add Search Functionality (5.3)
14. Implement User Profile Page (5.4)
15. Add Filtering and Sorting UI (10.1)
16. Implement Code Splitting (7.1)
17. Optimize Image Loading (7.3)
18. Add Unit Tests (12.1)
19. Optimize Build Configuration (13.1)

### Low Priority:
20. Implement Infinite Scroll (10.2)
21. Add Dark Mode (10.3)
22. Add E2E Testing (12.2)
23. Add Image Upload Functionality (14.1)
24. Add Post Drafts (14.3)
25. Add Notification System (14.5)

---

## Implementation Timeline Recommendation

**Week 1-2: Critical Fixes**
- Fix pagination
- Implement error handling and toast notifications
- Add loading states
- Implement Post slice
- Set up environment variables

**Week 3-4: High Priority Features**
- Add error boundaries
- Improve form validation
- Implement comment system (after backend)
- Improve axios interceptor
- Make mobile responsive

**Week 5-6: Medium Priority**
- Enhance PostCard
- Add search functionality (after backend)
- Implement user profile pages (after backend)
- Add filtering UI (after backend)
- Optimize performance

**Week 7+: Low Priority**
- Additional features
- Testing
- Advanced optimizations
- CI/CD setup

---

## Backend Dependencies Summary

**Frontend improvements that require backend work first:**

1. **Comment System (5.2, 3.2)** → Backend 1.2 (Comment CRUD)
2. **Search Functionality (5.3)** → Backend 3.1 (Search)
3. **User Profile (5.4)** → Backend 1.1 (Fix getUserProfile) & 3.3 (Profile Update)
4. **Filtering/Sorting (10.1)** → Backend 3.2 (Filtering and Sorting)
5. **Error Handling (1.2, 4.1)** → Backend 2.1 (Global Exception Handler)
6. **Form Validation (2.2)** → Backend 2.2 (Request Validation)
7. **Pagination (1.1)** → Backend 1.3 (Fix Hardcoded Pagination)
8. **Notifications (14.5)** → Backend 15 (Notifications System)

**Recommended order:**
1. Implement backend improvements first
2. Then implement corresponding frontend features
3. This ensures API contracts are stable before frontend development

---

*This document should be updated as improvements are implemented. Always check backend dependencies before starting frontend work.* 