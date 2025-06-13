// js/api.js
const API_URL = '/api';

async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.error || 'Ocorreu um erro na requisição.');
        }
        return responseData;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error.message);
        throw error;
    }
}

const api = {
    checkHealth: () => apiRequest('/health'),
    getStock: () => apiRequest('/stock'),
    getItems: () => apiRequest('/items'),
    getTransactions: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return apiRequest(`/transactions?${params.toString()}`);
    },
    getFinancialSummary: () => apiRequest('/financial-summary'),
    postTransaction: (data) => apiRequest('/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    postItem: (data) => apiRequest('/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    updateItem: (id, data) => apiRequest(`/items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
};
