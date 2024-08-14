document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    try {
        const bodyContent = {
            email: username,
            password: pass
        }
        const response = await fetch('http://localhost:4000/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyContent),
        });
        const data = await response.json();


        if (data.loginUser) {
            // Store the token in local storage
            chrome.storage.local.set({ token: data.loginUser, authenticated: true, user: data.loginUser.user }, () => {
                // Send a message to the service worker indicating successful authentication
                chrome.runtime.sendMessage({ action: 'authenticated' }, () => {
                    // Redirect to the chatbot after the message is sent
                    window.location.href = 'sidepanel.html';
                });
            });
        } else {
            document.getElementById('error-message').textContent = "Autenticación fallida";
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message').textContent = 'Autenticación fallida';
    }
});
