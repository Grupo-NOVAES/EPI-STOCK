const API_URL = '/api';

export const api = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);
            const responseData = await response.json().catch(() => null);
            if (!response.ok) throw new Error(responseData?.error || 'Ocorreu um erro na requisição.');
            return responseData;
        } catch (error) {
            console.error(`API Error on ${endpoint}:`, error.message);
            throw error;
        }
    },
    getHealth: () => api.request('/health'),
    getStock: () => api.request('/stock'),
    getItems: () => api.request('/items'),
    // *** FUNÇÃO ATUALIZADA ***
    getFinancialSummary: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return api.request(`/financial-summary?${params.toString()}`);
    },
    getTransactions: (filters = {}) => {
        const params = new URLSearchParams(filters);
        return api.request(`/transactions?${params.toString()}`);
    },
    postTransaction: (data) => api.request('/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    postItem: (data) => api.request('/items', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
    updateItem: (id, data) => api.request(`/items/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
};
