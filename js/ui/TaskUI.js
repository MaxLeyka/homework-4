class TaskUI {
    constructor(apiService) {
        this.apiService = apiService;
    }

    async init() {
        this.bindEvents();
        await this.loadTasks();
    }

    bindEvents() {
        document.getElementById('engineSelector').addEventListener('change', () => this.updateEngine());
        this.bindModalEvents();
    }

    bindModalEvents() {
        const createModal = document.getElementById('createTaskModal');
        const editModal = document.getElementById('editTaskModal');
        const createCloseBtn = createModal.querySelector('.close');
        const editCloseBtn = editModal.querySelector('.close');
        const createForm = document.getElementById('createTaskForm');
        const editForm = document.getElementById('editTaskForm');

        createCloseBtn.addEventListener('click', () => this.closeCreateModal());
        editCloseBtn.addEventListener('click', () => this.closeEditModal());

        createModal.addEventListener('click', (e) => {
            if (e.target === createModal) this.closeCreateModal();
        });

        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) this.closeEditModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeCreateModal();
                this.closeEditModal();
            }
        });

        createForm.addEventListener('submit', (e) => this.handleCreateTask(e));
        editForm.addEventListener('submit', (e) => this.handleEditTask(e));
    }

    openCreateModal() {
        const modal = document.getElementById('createTaskModal');
        modal.style.display = 'block';
        this.clearCreateForm();
        document.getElementById('modalTaskName').focus();
    }

    closeCreateModal() {
        const modal = document.getElementById('createTaskModal');
        modal.style.display = 'none';
    }

    openEditModal(task) {
        const modal = document.getElementById('editTaskModal');
        document.getElementById('editTaskId').value = task.id;
        document.getElementById('editTaskName').value = task.name;
        document.getElementById('editTaskInfo').value = task.info || '';
        document.getElementById('editTaskImportant').checked = task.isImportant;
        document.getElementById('editTaskCompleted').checked = task.isCompleted;
        modal.style.display = 'block';
        document.getElementById('editTaskName').focus();
    }

    closeEditModal() {
        const modal = document.getElementById('editTaskModal');
        modal.style.display = 'none';
    }

    clearCreateForm() {
        document.getElementById('modalTaskName').value = '';
        document.getElementById('modalTaskInfo').value = '';
        document.getElementById('modalTaskImportant').checked = false;
        document.getElementById('modalTaskCompleted').checked = false;
    }

    async handleCreateTask(event) {
        event.preventDefault();

        const name = document.getElementById('modalTaskName').value.trim();
        const info = document.getElementById('modalTaskInfo').value.trim();
        const isImportant = document.getElementById('modalTaskImportant').checked;
        const isCompleted = document.getElementById('modalTaskCompleted').checked;

        if (!name) {
            alert('Пожалуйста, введите название задачи');
            document.getElementById('modalTaskName').focus();
            return;
        }

        try {
            const newTask = await this.apiService.createTask({
                name,
                info: info || 'Нет описания',
                isImportant,
                isCompleted
            });

            console.log('Задача создана:', newTask);
            this.closeCreateModal();
            showNotification('Задача успешно создана!', 'success');
            await this.loadTasks();
        } catch (error) {
            console.error('Ошибка при создании задачи:', error);
            showNotification('Ошибка при создании задачи: ' + error.message, 'error');
        }
    }

    async handleEditTask(event) {
        event.preventDefault();

        const id = document.getElementById('editTaskId').value;
        const name = document.getElementById('editTaskName').value.trim();
        const info = document.getElementById('editTaskInfo').value.trim();
        const isImportant = document.getElementById('editTaskImportant').checked;
        const isCompleted = document.getElementById('editTaskCompleted').checked;

        if (!name) {
            alert('Пожалуйста, введите название задачи');
            document.getElementById('editTaskName').focus();
            return;
        }

        try {
            const updatedTask = await this.apiService.updateTask(id, {
                name,
                info: info || 'Нет описания',
                isImportant,
                isCompleted
            });

            console.log('Задача обновлена:', updatedTask);
            this.closeEditModal();
            showNotification('Задача успешно обновлена!', 'success');
            await this.loadTasks();
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            showNotification('Ошибка при обновлении задачи: ' + error.message, 'error');
        }
    }

    getSelectedEngine() {
        const selector = document.getElementById('engineSelector');
        return selector.value;
    }

    updateEngine() {
        const engineType = this.getSelectedEngine();
        const client = engineType === 'fetch' ? this.fetchClient : this.xhrClient;
        this.apiService.setClient(client);
        console.log(`Клиент изменен на: ${engineType}`);
        showNotification(`Клиент изменен на: ${engineType}`, 'info');
    }

    setClients(fetchClient, xhrClient) {
        this.fetchClient = fetchClient;
        this.xhrClient = xhrClient;
    }

    async loadTasks() {
        try {
            const filters = {
                name_like: document.getElementById('nameFilter').value || undefined,
                isCompleted: document.getElementById('completedFilter').value || undefined,
                isImportant: document.getElementById('importantFilter').value || undefined
            };

            const tasks = await this.apiService.getAllTasks(filters);
            this.displayTasks(tasks);
        } catch (error) {
            console.error('Ошибка при загрузке задач:', error);
            showNotification('Ошибка при загрузке задач: ' + error.message, 'error');
        }
    }

    async getTaskById() {
        const id = document.getElementById('taskId').value;
        if (!id) {
            showNotification('Введите ID задачи', 'error');
            return;
        }

        try {
            const task = await this.apiService.getTaskById(id);
            this.displayTasks([task]);
            showNotification(`Задача с ID ${id} найдена`, 'success');
        } catch (error) {
            console.error('Ошибка при получении задачи:', error);
            showNotification('Ошибка при получении задачи: ' + error.message, 'error');
        }
    }

    async updateTask(id, updates) {
        try {
            const updatedTask = await this.apiService.updateTask(id, updates);
            console.log('Задача обновлена:', updatedTask);
            showNotification('Задача обновлена', 'success');
            await this.loadTasks();
        } catch (error) {
            console.error('Ошибка при обновлении задачи:', error);
            showNotification('Ошибка при обновлении задачи: ' + error.message, 'error');
        }
    }

    async deleteTask(id) {
        if (!confirm('Вы уверены, что хотите удалить задачу?')) {
            return;
        }

        try {
            await this.apiService.deleteTask(id);
            console.log('Задача удалена:', id);
            showNotification('Задача удалена', 'success');
            await this.loadTasks();
        } catch (error) {
            console.error('Ошибка при удалении задачи:', error);
            showNotification('Ошибка при удалении задачи: ' + error.message, 'error');
        }
    }

    displayTasks(tasks) {
        const tasksList = document.getElementById('tasksList');

        if (!tasks || tasks.length === 0) {
            tasksList.innerHTML = '<p>Задачи не найдены</p>';
            return;
        }

        tasksList.innerHTML = tasks.map(task => `
            <div class="task-item">
                <h3>
                    ${task.isImportant ? '[ВАЖНАЯ] ' : ''}
                    ${task.isCompleted ? '[✓] ' : ''}
                    ${task.name}
                </h3>
                <p>${task.info || 'Нет описания'}</p>
                <p><strong>ID:</strong> ${task.id}</p>
                <div class="task-actions">
                    <button onclick="taskUI.updateTask(${task.id}, {isCompleted: ${!task.isCompleted}})">
                        ${task.isCompleted ? 'Отменить выполнение' : 'Выполнить'}
                    </button>
                    <button onclick="taskUI.updateTask(${task.id}, {isImportant: ${!task.isImportant}})">
                        ${task.isImportant ? 'Снять важность' : 'Сделать важной'}
                    </button>
                    <button onclick="taskUI.openEditModal(${JSON.stringify(task).replace(/"/g, '&quot;')})">
                        Редактировать
                    </button>
                    <button onclick="taskUI.deleteTask(${task.id})" style="color: red;">
                        Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }
}