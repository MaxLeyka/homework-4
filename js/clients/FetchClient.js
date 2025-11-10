class FetchClient {
    async request(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();

            console.log('Fetch Response:', {
                url,
                options,
                status: response.status,
                data
            });

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Fetch Error:', error);
            throw error;
        }
    }

    async get(url) {
        return this.request(url);
    }

    async post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async patch(url, data) {
        return this.request(url, {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }
}