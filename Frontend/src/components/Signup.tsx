import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import authApi from '../api/authApi'
import useToasts from '../hooks/useToasts'
import { AuthField, AuthScene } from './auth/AuthScene'

type SignupFormValues = {
  name: string
  username: string
  email: string
  password: string
}

function Signup() {
  const navigate = useNavigate()
  const toasts = useToasts()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>()

  const create = async (data: SignupFormValues) => {
    setError('')

    try {
      const newUser = await toasts.promise(authApi.createAccount(data), {
        loading: 'Creating account...',
        success: 'Account created successfully!',
        error: 'Failed to create account',
      })

      if (newUser) {
        navigate('/login')
      }
    } catch (requestError: any) {
      const errorMessage =
        requestError.response?.data?.message || requestError.message || 'Signup failed'
      setError(errorMessage)
    }
  }

  return (
    <div className='min-h-screen bg-black flex items-center justify-center'>
    <AuthScene
      title="Sign Up"
      description="Create an account to continue to Aniverse."
      promptLabel="Already have an account?"
      promptActionLabel="Log In"
      promptActionTo="/login"
      watermarkTop=""
      watermarkBottom=""
      layout="split"
      error={error}
    >
      <form onSubmit={handleSubmit(create)} className="space-y-6">
        <AuthField
          label="Full Name"
          placeholder="Enter your name"
          autoComplete="name"
          {...register('name', {
            required: 'Full name is required',
          })}
          error={errors.name?.message}
        />

        <AuthField
          label="Username"
          placeholder="Choose a username"
          autoComplete="username"
          {...register('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters long',
            },
            maxLength: {
              value: 50,
              message: 'Username must be 50 characters or fewer',
            },
          })}
          error={errors.username?.message}
        />

        <AuthField
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email', {
            required: 'Email is required',
            validate: {
              matchPattern: (value) =>
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                'Email address must be valid',
            },
          })}
          error={errors.email?.message}
        />

        <AuthField
          label="Password"
          type="password"
          placeholder="Minimum 8 characters"
          autoComplete="new-password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters long',
            },
          })}
          error={errors.password?.message}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-14 w-full rounded-none bg-[#ff1018] text-base font-black uppercase tracking-[0.08em] text-white hover:bg-[#ff2b31]"
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </AuthScene>
    </div>
  )
}

export default Signup
