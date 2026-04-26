import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

export default function AuthLayout({ children, authentication = true }) {

    const navigate = useNavigate()
    const authStatus = useAppSelector((state) => state.auth.status)
    const authLoading = useAppSelector((state) => state.auth.loading) // Global loading state
    useEffect(() => {
        // Case 1: Route requires Auth (true), but User is NOT logged in.
        // Redirect to Login.
        if (authentication && authStatus !== true) {
            navigate("/login")
        }
        // Case 2: Route requires NO Auth (false) (like Login/Signup pages), 
        // but User IS logged in. Redirect to Home.
        else if (!authentication && authStatus === true) {
            navigate("/")
        }

        // If neither case matches, allow access.
    }, [authStatus, navigate, authentication])

    // While checking, show a spinner or loading text
    return authLoading ? <h1>Loading...</h1> : <>{children}</>
}
