import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login as authLogin } from '../store/index' // Ensure this path is correct
import authApi from '../api/authApi'
import useToasts from '../hooks/useToasts'
import { Button, Input, Logo } from './index'
import { setMemoryTokenNExpiry } from '../api/axiosClient'

type LoginFormValues = {
    username: string;
    password: string;
};

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toasts = useToasts();
    const { 
        register, 
        handleSubmit, 
        formState: { errors } // <--- This holds validation errors (e.g., errors.password)
    } = useForm<LoginFormValues>();
    const [error, setError] = useState('');

    const login = async (data) => {
        setError('');
        try {
            // data = { username: "...", password: "..." }
            const response = await toasts.promise(
                authApi.login(data),
                {
                    loading: "Logging in...",
                    success: "Logged in successfully!",
                    error: "Failed to log in"
                }
            );
            
            if (response) {
                // The response contains { token, user, expiresIn } based on our backend DTO
                // The interceptor handles the token, so we just need the user data for Redux
                const userData = response.user;
                console.log(userData);
                setMemoryTokenNExpiry(response.token);
                if (userData) {
                    dispatch(authLogin({ userData }));
                }
                navigate('/');
            }
        } catch (error) {
            // Better error message handling
            const errorMessage = error.response?.data?.message || error.message || "Login failed";
            setError(errorMessage);
        }
    }

    return (
        <div className='flex items-center justify-center w-full'>
            <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
                <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign in to your account</h2>
                <p className="mt-2 text-center text-base text-black/60">
                    Don&apos;t have any account?&nbsp;
                    <Link
                        to="/signup"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign Up
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}
                
                <form onSubmit={handleSubmit(login)} className='mt-8'>
                    <div className="space-y-5">
                        {/* Changed from Email to Username to match backend DTO */}
                        <Input
                            label='Username: '
                            placeholder="Enter your username"
                            type='text'
                            {...register('username', {
                                required: true,
                                minLength: 3
                            })}
                        />
                        <Input
                            label="Password: "
                            type="password"
                            placeholder="Enter your password"
                            {...register("password", {
                                required: "Password is required",
                                minLength: {
                                    value: 8,
                                    message: "Password must be at least 8 characters long" // <-- Message added
                                }
                            })}
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        <Button type='submit' className='w-full'>
                            Sign in
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Login
