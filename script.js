// script.js

document.addEventListener("DOMContentLoaded", function () {
    loadSettings();

    // Close modal when clicking outside of it
    window.onclick = function (event) {
        const modal = document.getElementById("settingsModal");
        if (event.target === modal) {
            closeSettings();
        }
    }
});

function openSettings() {
    document.getElementById("settingsModal").style.display = "block";
}

function closeSettings() {
    document.getElementById("settingsModal").style.display = "none";
}

function saveSettings() {
    const enableIntro = document.getElementById("enableIntro").checked;
    localStorage.setItem("enableIntro", enableIntro);
    showNotification("Les paramètres ont été enregistrés.");
}

function loadSettings() {
    const enableIntro = localStorage.getItem("enableIntro") === 'true';
    document.getElementById("enableIntro").checked = enableIntro;
}

function launchApp(app) {
    const enableIntro = localStorage.getItem("enableIntro") === 'true';
    if (enableIntro) {
        window.location.href = app;
    } else {
        window.location.href = `${app}/app.html`;
    }
}

function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}
