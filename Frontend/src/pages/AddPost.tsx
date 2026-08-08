import React from 'react'
import { PostForm, Container } from '../components'
function AddPost() {
    return (
        <div className='min-h-screen w-full bg-[var(--editor-bg)] text-[var(--editor-text)] transition-colors duration-200 py-4'>
            <Container className="w-full max-w-full px-2 sm:px-6">
                <PostForm/>
            </Container>
        </div>
    )
}

export default AddPost