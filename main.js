    document.addEventListener('DOMContentLoaded', async function() {
        const fetchClient = new FetchClient();
        const xhrClient = new XhrClient();

        const apiService = new ApiService(fetchClient);

        window.taskUI = new TaskUI(apiService);
        window.taskUI.setClients(fetchClient, xhrClient);

        await window.taskUI.init();

        console.log('Приложение инициализировано');
    });