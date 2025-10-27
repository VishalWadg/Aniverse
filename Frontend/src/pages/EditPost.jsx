import React, {useState, useEffect} from 'react'
import { useNavigate, useParams} from 'react-router-dom'
import { Container, PostForm} from '../components'
import appwriteService from '../Appwrite/config'

function EditPost() {
    const [post, setPost] = useState(null)
    const {slug} = useParams() 
    const navigate = useNavigate()

    useEffect(() => {
        if(slug){
            appwriteService.getPost(slug).then((post) => {
                if(post){
                    setPost(post)
                }
            })
            
        }else{
            navigate('/') // Redirect to home if no slug is provided
        }
    }, [slug, navigate]) 
    return post ? (
        <div className='py-8'>
            <Container>
                <PostForm post = {post}/> {/* Pass the post data as a prop to PostForm */}
            </Container>
        </div>
    ):null
}

export default EditPost