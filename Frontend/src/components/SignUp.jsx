import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { login as authLogin } from '../store/index'
import authApi from '../api/authApi'
import { Button, Input, Logo } from './index'
import useToasts from '../hooks/useToasts'

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const toasts = useToasts();
    const dispatch = useDispatch()
    const { 
        register, 
        handleSubmit, 
        formState: { errors } // <--- This holds validation errors (e.g., errors.password)
    } = useForm();
    const create = async (data) => {
        setError("")
        try {
            // data = { name, username, email, password }
            // Register returns UserDto (usually)
            const newUser = await toasts.promise(
                authApi.createAccount(data),
                {
                    loading: "Creating account...",
                    success: "Account created successfully!",
                    error: "Failed to create account"
                }
            );
            
            if (newUser) {
                // After registration, auto-login or redirect to login page.
                // Assuming we want to auto-login, we need the user to be authenticated.
                // Option A: If register API returns a Token + User, dispatch login immediately.
                // Option B: If register only returns User, redirect to login.
                
                // For better UX, let's assume Option B or simple redirect for now
                navigate("/login"); 
            }
        } catch (error) {
            // Better error message handling from Axios response
            const errorMessage = error.response?.data?.message || error.message || "Signup failed";
            setError(errorMessage);
        }
    }

    return (
        <div className="flex items-center justify-center">
            <div className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}>
                <div className="mb-2 flex justify-center">
                    <span className="inline-block w-full max-w-[100px]">
                        <Logo width="100%" />
                    </span>
                </div>
                <h2 className="text-center text-2xl font-bold leading-tight">Sign up to create account</h2>
                <p className="mt-2 text-center text-base text-black/60">
                    Already have an account?&nbsp;
                    <Link
                        to="/login"
                        className="font-medium text-primary transition-all duration-200 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>
                {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

                <form onSubmit={handleSubmit(create)}>
                    <div className='space-y-5'>
                        <Input
                            label="Full Name: "
                            placeholder="Enter your full name"
                            {...register("name", {
                                required: true,
                            })}
                        />
                        
                        {/* Added Username field as it is required by backend DTO */}
                        <Input
                            label="Username: "
                            placeholder="Choose a unique username"
                            {...register("username", {
                                required: true,
                                minLength: 3,
                                maxLength: 50
                            })}
                        />

                        <Input
                            label="Email: "
                            placeholder="Enter your email"
                            type="email"
                            {...register("email", {
                                required: true,
                                validate: {
                                    matchPatern: (value) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                        "Email address must be a valid address",
                                }
                            })}
                        />
                        
                        <Input
                            label="Password: "
                            type="password"
                            placeholder="Enter your password"
                            {...register("password", {
                                required: true,
                                minLength: 8 // Added minLength matching backend
                            })}
                        />
                        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        
                        <Button type='submit' className="w-full">
                            Create Account
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup