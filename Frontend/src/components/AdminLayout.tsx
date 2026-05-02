import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store/hooks'

export default function AdminLayout({ children, authentication = true }: { Children: React.ReactNode, authentication: boolean }) {

    const navigate = useNavigate()
    const authStatus = useAppSelector((state) => state.auth.status)
    const authLoading = useAppSelector((state) => state.auth.loading)
    const userRole = useAppSelector((state) => state.auth.userData?.role)

    useEffect(() => {
        if (authentication && (authStatus !== true || userRole !== 'ADMIN')) {
            navigate("/login")
        }

    }, [authStatus, navigate, authentication, userRole])

    return authLoading ? <h1>Loading...</h1> : <>{children}</>
}