import conf from "../conf/conf";
import axiosClient from "./axiosClient";

/**
 * Uploads a file to Cloudinary using a secure signature from the Spring Boot backend.
 * Returns the full Cloudinary response object.
 */

export const uploadImageToCloudinary = async (file: File) => {
    try {
        // 1. Get the secure signature from Spring Boot
        const sigResponse = await axiosClient.get('/uploads/signature');
        const { signature, timestamp, folder } = sigResponse.data;
        const cloudName = conf.cloudinaryCloudName;
        const apiKey = conf.cloudinaryApiKey;

        // 2. Build the FormData payload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        // 3. Upload directly to Cloudinary

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadReponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        });

        if (!uploadReponse.ok) {
            throw new Error('Failed to upload image to Cloudinary');
        }

        return await uploadReponse.json();
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
}

/**
 * Tells Cloudinary to fetch an image from a public URL and save it to your account.
 */

export const uploadImageUrlToCloudinary = async (imageUrl: string) => {
    try {
        const sigResponse = await axiosClient.get('/uploads/signature');
        const { signature, timestamp, folder } = sigResponse.data;

        const cloudName = conf.cloudinaryCloudName;
        const apiKey = conf.cloudinaryApiKey;

        const formData = new FormData();
        formData.append('file', imageUrl);
        formData.append('api_key', apiKey);
        formData.append('timestamp', timestamp);
        formData.append('signature', signature);
        formData.append('folder', folder);

        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        })

        if (!uploadResponse.ok) {
            throw new Error('Failed to fetch and upload remote image');
        }

        return await uploadResponse.json();
    } catch (error) {
        console.error("Cloudinary URL Upload Error:", error);
        throw error;
    }
}