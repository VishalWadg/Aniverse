import conf from "../conf/conf";
import { Client, Account, ID } from "appwrite";

export class AuthService {
    // Using private class fields (#) for encapsulation (Modern JS)
    #client = new Client();
    #account;

    constructor() {
        this.#client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        
        this.#account = new Account(this.#client);
    }

    async createAccount({ email, password, name }) {
        try {
            // LATEST: Using object-based arguments instead of positional ones.
            const userAccount = await this.#account.create({
                userId: ID.unique(), 
                email,
                password,
                name: name || 'User',
            });

            if (userAccount) {
                return this.login({ email, password }); 
            } else {
                return userAccount; 
            }
        } catch (error) {
            console.error("Appwrite Service :: createAccount :: error", error);
            throw error;
        }
    }

    async login({ email, password }) {
        try {
            // LATEST: Using object-based arguments for createEmailPasswordSession.
            return await this.#account.createEmailPasswordSession({
                email,
                password,
            });
        } catch (error) {
            console.error("Appwrite Service :: login :: error", error);
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            return await this.#account.get();
        } catch (error) {
            if (error.code === 401) {
                // Return null when a session is not found (guest user)
                return null; 
            } else {
                console.error(`Appwrite Service :: getCurrentUser :: error`, error);
                return null;
            }
        }
    }

    async logOut() {
        try {
            await this.#account.deleteSessions();
            return true; 
        } catch (error) {
            console.error(`Appwrite Service :: logOut :: error`, error);
            return false; 
        }
    }
}

const authService = new AuthService();
export default authService;