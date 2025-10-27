import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'


function Protected({children, authentication=true}) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const authStatus = useSelector(state => state.auth.status)

    useEffect(() => {
        if(authentication && authStatus !== authentication){ // if authentication is true and authStatus is false then navigate to login page
            navigate('/login')
        }else if(!authentication && authStatus !== authentication){ // if authentication is false and authStatus is true then navigate to home page
            navigate('/')  // navigate to home page
        }
        setLoading(false) // if both conditions are false then set loading to false and show the children components which is passed as props
    }, [authStatus, navigate, authentication])

    return loading ? <h1>Loading...</h1> : <>{children}</> // if loading is true then show loading else show children components which is passed as props
}

export default Protected