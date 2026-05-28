import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import authApi from '../api/authApi'
import { setMemoryTokenNExpiry } from '../api/axiosClient'
import useToasts from '../hooks/useToasts'
import { useAppDispatch } from '../store/hooks'
import { login as authLogin } from '../store/index'
import { AuthField, AuthScene } from './auth/AuthScene'

type LoginFormValues = {
  username: string
  password: string
}

function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const toasts = useToasts()
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>()

  const login = async (data: LoginFormValues) => {
    setError('')

    try {
      const response = await toasts.promise(authApi.login(data), {
        loading: 'Logging in...',
        success: 'Logged in successfully!',
        error: 'Failed to log in',
      })

      if (response) {
        const userData = response.user
        setMemoryTokenNExpiry(response.token)

        if (userData) {
          dispatch(authLogin({ userData }))
        }

        navigate('/')
      }
    } catch (requestError: any) {
      const errorMessage =
        requestError.response?.data?.message || requestError.message || 'Login failed'
      setError(errorMessage)
    }
  }

  return (
    <div className='bg-background mt-0'>
    <AuthScene
      title="Log In"
      description="Log in to continue to Aniverse."
      promptLabel="Don't have an account?"
      promptActionLabel="Sign Up"
      promptActionTo="/signup"
      watermarkTop=""
      watermarkBottom=""
      error={error}
    >
      <form onSubmit={handleSubmit(login)} className="space-y-6">
        <AuthField
          label="Username"
          placeholder="Enter your username"
          autoComplete="username"
          {...register('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters long',
            },
          })}
          error={errors.username?.message}
        />

        <AuthField
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          helperLabel="Forgot Password?"
          helperHref="mailto:support@aniverse.com?subject=Password%20Recovery"
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
          className="h-control-h w-full rounded-control bg-primary text-sm font-black uppercase tracking-[0.08em] text-on-primary hover:bg-primary/90"
        >
          {isSubmitting ? 'Logging In...' : 'Log In'}
        </Button>
      </form>
    </AuthScene>
    </div>
  )
}

export default Login
