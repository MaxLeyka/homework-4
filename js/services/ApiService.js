class ApiService {
    constructor(client) {
        this.client = client;
    }

    setClient(client) {
        this.client = client;
    }

    async getAllTasks(filters = {}) {
        const params = new URLSearchParams();

        if (filters.name_like) params.append('name_like', filters.name_like);
        if (filters.isCompleted !== undefined) params.append('isCompleted', filters.isCompleted);
        if (filters.isImportant !== undefined) params.append('isImportant', filters.isImportant);

        const url = params.toString() ? `${CONFIG.BASE_URL}?${params}` : CONFIG.BASE_URL;
        return this.client.get(url);
    }

    async getTaskById(id) {
        return this.client.get(`${CONFIG.BASE_URL}/${id}`);
    }

    async createTask(taskData) {
        return this.client.post(CONFIG.BASE_URL, taskData);
    }

    async updateTask(id, taskData) {
        return this.client.patch(`${CONFIG.BASE_URL}/${id}`, taskData);
    }

    async deleteTask(id) {
        return this.client.delete(`${CONFIG.BASE_URL}/${id}`);
    }
}