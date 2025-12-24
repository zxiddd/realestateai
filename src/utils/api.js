/**
 * API Configuration
 * Uses environment variable in production, localhost in development
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Fetch wrapper with authentication
 */
export const apiFetch = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    return response;
};

/**
 * API methods
 */
export const api = {
    get: (endpoint) => apiFetch(endpoint),

    post: (endpoint, data) => apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
    }),

    patch: (endpoint, data) => apiFetch(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(data),
    }),

    delete: (endpoint) => apiFetch(endpoint, {
        method: 'DELETE',
    }),

    // For file uploads (FormData)
    upload: (endpoint, formData) => {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        return fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
        });
    },
};

export default api;
