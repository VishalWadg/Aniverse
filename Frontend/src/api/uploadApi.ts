import axiosClient from "./axiosClient";

// 1. Add TypeScript Interface for the Cloudinary Response
export interface CloudinaryUploadResponse {
    secure_url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    [key: string]: any; // Catch-all for other Cloudinary properties
}

/**
 * Core helper function that handles both File objects and remote URL strings.
 */
const performCloudinaryUpload = async (fileOrUrl: File | string): Promise<CloudinaryUploadResponse> => {
    try {
        // 1. Get the secure signature from Spring Boot
        const sigResponse = await axiosClient.get('/uploads/signature');
        const { signature, timestamp, folder, apiKey, cloudName } = sigResponse.data;

        // 2. Build the FormData payload
        const formData = new FormData();
        formData.append('file', fileOrUrl);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        // 3. Upload directly to Cloudinary
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
        
        // Note: Using fetch instead of axiosClient is GREAT here, as it prevents 
        // your backend JWT interceptors from accidentally being sent to Cloudinary.
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload image to Cloudinary');
        }

        return await uploadResponse.json();
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
}

/**
 * Uploads a physical file to Cloudinary
 */
export const uploadImageToCloudinary = (file: File) : Promise<CloudinaryUploadResponse> => {
    return performCloudinaryUpload(file);
}

/**
 * Tells Cloudinary to fetch an image from a public URL and save it to your account
 */
export const uploadImageUrlToCloudinary = (imageUrl: string) : Promise<CloudinaryUploadResponse> => {
    return performCloudinaryUpload(imageUrl);
}

/**
 * Deletes an image from Cloudinary via your Spring Boot backend
 */
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
    try {
        // Calls: DELETE /api/v1/uploads?publicId=YOUR_ID
        // Returns 204 No Content, so we don't need to return response.data
        await axiosClient.delete('/uploads', { params: { publicId } });
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
        throw error;
    }
}