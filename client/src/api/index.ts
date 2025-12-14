export const api = {
    baseUrl: 'http://localhost:5000', // Update if deployed

    async request(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    },

    get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
};
