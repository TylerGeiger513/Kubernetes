// authHandler.js

import { api } from './api'; // Adjust the path if needed

/**
 * Checks if a user exists based on the provided email.
 * Expects the backend to return an object like { exists: true/false }.
 *
 * @param {string} email - The user's email address.
 * @returns {Promise<Object>} The API response data.
 */
export const checkUserExists = async (email) => {
    try {
        // pass { email: email } as the json body of the request
        const response = await api.post('/auth/exists', { email: email });
        return response.data;
    } catch (error) {
        console.error('Error checking if user exists:', error);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const signup = async (userInfo) => {
    try {
        const response = await api.post('/auth/signup', userInfo);
        return response.data;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};