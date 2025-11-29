import React from 'react'
import { Link } from 'react-router-dom'

function PostCard({ id, title }) {
  return (
    <Link to={`/post/${id}`}>
        <div className='w-full bg-gray-100 text-[#6E8CFB] rounded-xl p-4 min-h-[150px] flex flex-col justify-center'>
            {/* Image removed for now as backend doesn't support it.
               You can add a placeholder icon here if you want.
            */}
            
            <h2 className='text-xl font-bold text-center'>
                {title}
            </h2>
        </div>
    </Link>
  )
}

export default PostCard