class XhrClient {
    async get(url) {
        return this.request('GET', url);
    }

    async post(url, data) {
        return this.request('POST', url, data);
    }

    async patch(url, data) {
        return this.request('PATCH', url, data);
    }

    async delete(url) {
        return this.request('DELETE', url);
    }

    request(method, url, data = null) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = function() {
                let responseData;
                try {
                    responseData = JSON.parse(xhr.responseText);
                } catch (e) {
                    responseData = xhr.responseText;
                }

                console.log('XHR Response:', {
                    url,
                    method,
                    status: xhr.status,
                    data: responseData
                });

                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(responseData);
                } else {
                    reject(new Error(responseData.error || `HTTP error! status: ${xhr.status}`));
                }
            };

            xhr.onerror = function() {
                console.error('XHR Error:', {
                    url,
                    method,
                    status: xhr.status
                });
                reject(new Error('Network error'));
            };

            xhr.send(data ? JSON.stringify(data) : null);
        });
    }
}