// Verificar autenticación antes de mostrar el chatbot
chrome.storage.local.get(['authenticated'], (result) => {
    if (!result.authenticated) {
        window.location.href = 'login.html';
    }
});

// Resto del código del chatbot

const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector("#send-btn");
const chatbox = document.querySelector(".chatbox");
const settingsBtn = document.querySelector("#settings-btn");
const webBtn = document.querySelector("#web-btn");
const backToMenuBtn = document.querySelector("#back-to-menu");

backToMenuBtn.addEventListener('click', () => {
    window.location.href = 'sidepanel.html';
});

let userMessage;
const API_KEY = "xxx";
const inputInitHeight = chatInput.scrollHeight;

const createChatli = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", className);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

const generateResponse = (incomingChatLi) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = incomingChatLi.querySelector("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [
                {role: "system", content: "Sos un profesional de ciberseguridad listo para resolver consultas. Exclusivamente vas a responder preguntas sobre ciberseguridad. Si te preguntan otra cosa que no sea sobre seguridad responderás con el siguiente mensaje: 'No soy capaz de responder esa pregunta.'"},
                {role: "user", content: userMessage}
            ]
        })
    };

    fetch(API_URL, requestOptions)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            messageElement.textContent = data.choices[0].message.content;
        })
        .catch((error) => {
            console.log(error);
            messageElement.textContent = "error";
        })
        .finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    chatbox.appendChild(createChatli(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    setTimeout(() => {
        const incomingChatLi = createChatli("Thinking...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);

// Obtener el ID de la extensión usando chrome.runtime.id
const extensionId = chrome.runtime.id;

// Añadir funcionalidad de redirección a los botones settings y web
settingsBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: `chrome-extension://${extensionId}/settings.html` });
});

webBtn.addEventListener("click", function() {
    chrome.tabs.create({ url: 'https://www.youtube.com' });
});
