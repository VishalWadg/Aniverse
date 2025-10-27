import { useId } from "react"; // 💡 Note: useId is a React Hook and isn't needed here.
import conf from "../conf/conf";
// Renamed Databases to TablesDB for the latest Appwrite terminology
import { Client, ID, TablesDB, Storage, Query } from "appwrite";

// Note: If you are using an older SDK version (before v18/v19),
// you may need to use 'Databases' instead of 'TablesDB'.

export class Service {
    // 1. Encapsulation: Use private fields for core dependencies
    #client = new Client();
    #tablesDB; // Renamed from databases
    #storage; // Renamed from bucket

    constructor() {
        this.#client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);

        this.#tablesDB = new TablesDB(this.#client); // Use new TablesDB service
        this.#storage = new Storage(this.#client);
    }

    // --- CRUD Operations (Table/Row Terminology) ---

    async createPost({ Title, slug, Content, FeaturedImage, Status, UserId, permissions }) {
        try {
            // LATEST: Use object-based arguments for createRow
            return await this.#tablesDB.createRow({
                databaseId: conf.appwriteDataBaseId,
                tableId: conf.appwriteCollectionId, // Note: collectionId is now tableId
                rowId: slug,
                data: {
                    Title,
                    Content,
                    FeaturedImage,
                    Status,
                    UserId
                },
                // permissions: permissions || [] // Optional: Include permissions if needed
            });
        } catch (error) {
            console.error(`Appwrite service :: createPost :: error`, error);
            throw error;
        }
    }

    async updatePost(slug, { Title, Content, FeaturedImage, Status }) {
        try {
            // LATEST: Use object-based arguments for updateRow
            return await this.#tablesDB.updateRow({
                databaseId: conf.appwriteDataBaseId,
                tableId: conf.appwriteCollectionId, // Note: collectionId is now tableId
                rowId: slug,
                data: {
                    Title,
                    Content,
                    FeaturedImage,
                    Status
                }
            });
        } catch (error) {
            console.error(`Appwrite service :: updatePost :: error`, error);
            throw error;
        }
    }

    async deletePost(slug) {
        try {
            // LATEST: Use object-based arguments for deleteRow
            await this.#tablesDB.deleteRow({
                databaseId: conf.appwriteDataBaseId,
                tableId: conf.appwriteCollectionId, // Note: collectionId is now tableId
                rowId: slug,
            });
            return true;
        } catch (error) {
            console.error(`Appwrite service :: deletePost :: error`, error);
            return false;
        }
    }

    async getPost(slug) {
        try {
            // LATEST: Use object-based arguments for getRow
            return await this.#tablesDB.getRow({
                databaseId: conf.appwriteDataBaseId,
                tableId: conf.appwriteCollectionId, // Note: collectionId is now tableId
                rowId: slug,
            });
        } catch (error) {
            console.error(`Appwrite service :: getPost :: error`, error);
            return false;
        }
    }

    async getPosts(queries = [Query.equal("Status", "active")]) {
        try {
            // Appwrite method returns { rows: [...], total: N }
            return await this.#tablesDB.listRows({
                databaseId: conf.appwriteDataBaseId,
                tableId: conf.appwriteCollectionId,
                queries,
            });
        } catch (error) {
            console.error(`Appwrite service :: getPosts :: error`, error);
            // CRITICAL: Return a safe, empty object on error, 
            // NOT false or undefined.
            return { rows: [], total: 0 }; 
        }
    }

    // --- File Storage Services ---

    async uploadFile(file) {
        try {
            // LATEST: Use object-based arguments for createFile
            // The method should return the file object, not just true, for utility
            return await this.#storage.createFile({
                bucketId: conf.appwriteBucketId,
                fileId: ID.unique(),
                file,
            });
        } catch (error) {
            console.error(`Appwrite service :: uploadFile :: error`, error);
            return false;
        }
    }

    async deleteFile(fileId) {
        try {
            // LATEST: Use object-based arguments for deleteFile
            await this.#storage.deleteFile({
                bucketId: conf.appwriteBucketId,
                fileId,
            });
            return true;
        } catch (error) {
            console.error(`Appwrite service :: deleteFile :: error`, error);
            return false;
        }
    }

    getFilePreview(fileId) {
       try {
        // Change the SDK method from getFilePreview to getFileView
            return this.#storage.getFileView(
                { 
                bucketId: conf.appwriteBucketId,
                fileId,
                }
            );
        } catch (error) {
            console.error(`Appwrite service :: getFilePreview :: error ${error}`);
            return ''; // Return an empty string or null on failure
        }
    }
}

const service = new Service();
export default service;