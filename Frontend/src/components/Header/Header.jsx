import React, { useRef } from 'react'
import {LogoutBtn, Logo, Container} from '../index'
import { Link, useNavigate} from 'react-router-dom';
import { useSelector } from 'react-redux'; 

function Header() {
  const authStatus = useSelector((state) => state.auth.status);
  const navigate = useNavigate();
  const ref = useRef(null);
  const navItems = [
    {
      name: 'Home',
      slug: "/",
      active: true
    }, 
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    {
      name: "All Posts",
      slug: "/all-posts",
      active: authStatus,
    },
    {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
    },
  ]
  return (
    <header className='py-3 shadow bg-[#50589C] flex'>
      <Container className='flex'>
        <nav className='flex-1 w-min'>
          <div className='mr-4'>
            <Link to='/' className='w-min block'>
              <Logo width='110px'/>
            </Link>
          </div>
        </nav>
        <ul className='flex ml-auto items-center'>
          {navItems.map((item) => 
            item.active ?
            (
              <li key={item.name}>
                <button 
                  onClick={() => navigate(item.slug)}
                  className='inline-block px-6 py-2 duration-200 hover:text-[#e5e6ff] hover:bg-[#6E8CFB] rounded-full'
                >
                  {item.name}
                </button>
              </li>
            ) : null
           
          )}
          { authStatus && (
            <li>
              <LogoutBtn/>
            </li>
          )}
        </ul>

      </Container>
    </header>
  )
}

export default Header;