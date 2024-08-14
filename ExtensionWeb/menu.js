// Verificar autenticación antes de mostrar el menú
chrome.storage.local.get(['authenticated'], (result) => {
    if (!result.authenticated) {
        window.location.href = 'login.html';
    }
});

document.getElementById('view-reports').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/reportes' });
});

document.getElementById('open-chatbot').addEventListener('click', () => {
    window.location.href = 'sidepanel-chatbot.html';
});

document.getElementById('view-profile').addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000/perfil' });
});

document.getElementById('open-settings').addEventListener('click', () => {
    chrome.windows.create({
        url: 'settings.html',
        type: 'popup',
        width: 600,
        height: 400
    });
});

document.getElementById('logout').addEventListener('click', () => {
    chrome.storage.local.set({ authenticated: false }, () => {
        window.location.href = 'login.html';
    });
});
