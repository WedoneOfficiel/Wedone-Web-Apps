// Sélectionner les éléments du DOM
const folderInput = document.getElementById("folder-input");
const addFolder = document.getElementById("add-folder");
const folderContainer = document.getElementById("folder-container");
const taskInput = document.getElementById("task-input");
const addTask = document.getElementById("add-task");
const taskList = document.getElementById("task-list");
const exportBtn = document.getElementById("export");
const importBtn = document.getElementById("import");
const importFile = document.getElementById("import-file");

const folderModal = document.getElementById("folder-modal");
const folderModalInput = document.getElementById("folder-modal-input");
const saveFolderModal = document.getElementById("save-folder-modal");
const closeFolderModal = document.getElementById("close-folder-modal");

const taskModal = document.getElementById("task-modal");
const taskModalInput = document.getElementById("task-modal-input");
const saveTaskModal = document.getElementById("save-task-modal");
const closeTaskModal = document.getElementById("close-task-modal");

const folderContextMenu = document.getElementById('folder-context-menu');
const taskContextMenu = document.getElementById('task-context-menu');
let currentFolder = null;
let currentTask = null;

// Créer un objet pour stocker les données de la to do list
let data = {
    folders: [],
    selectedFolder: null
};

// Fonction pour afficher le menu contextuel
function showContextMenu(menu, x, y) {
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';
}

// Masquer les menus contextuels quand on clique ailleurs
window.addEventListener('click', () => {
    folderContextMenu.style.display = 'none';
    taskContextMenu.style.display = 'none';
});

// Ajouter des écouteurs d'événements pour les clics droits sur les dossiers
folderContainer.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (event.target.closest('.folder')) {
        currentFolder = event.target.closest('.folder').querySelector('span').textContent;
        showContextMenu(folderContextMenu, event.pageX, event.pageY);
    }
});

// Écouteur d'événement pour le bouton d'enregistrement de la modal de dossier
saveFolderModal.addEventListener('click', () => {
    editFolderInList(currentFolder, folderModalInput.value);
    folderModal.style.display = 'none';
});

// Écouteur d'événement pour le bouton d'enregistrement de la modal de tâche
saveTaskModal.addEventListener('click', () => {
    editTaskInList(currentTask, taskModalInput.value);
    taskModal.style.display = 'none';
});

// Ajouter des écouteurs d'événements pour les clics droits sur les tâches
taskList.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (event.target.closest('li')) {
        currentTask = event.target.closest('li').querySelector('span').textContent;
        showContextMenu(taskContextMenu, event.pageX, event.pageY);
    }
});

// Ajouter des écouteurs d'événements pour les options du menu contextuel des dossiers
document.getElementById('edit-folder').addEventListener('click', () => {
    openFolderModal(currentFolder);
});

document.getElementById('delete-folder').addEventListener('click', () => {
    removeFolderFromList(currentFolder);
});

// Ajouter des écouteurs d'événements pour les options du menu contextuel des tâches
document.getElementById('edit-task').addEventListener('click', () => {
    openTaskModal(currentTask);
});

document.getElementById('delete-task').addEventListener('click', () => {
    removeTaskFromList(currentTask);
});

// Fonctions pour ouvrir les modales avec les valeurs actuelles
// Fonctions pour ouvrir les modales avec les valeurs actuelles
function openFolderModal(folderName) {
    folderModalInput.value = folderName;
    folderModal.style.display = 'block';

    // Supprimez les écouteurs d'événements sur le bouton d'enregistrement
    saveFolderModal.onclick = null;

    // Ajoutez un écouteur d'événement pour détecter la touche "Entrée" dans la fenêtre modale
    folderModal.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            saveFolderModal.click(); // Simule un clic sur le bouton d'enregistrement
        }
    });

    closeFolderModal.onclick = () => {
        folderModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === folderModal) {
            folderModal.style.display = 'none';
        }
    };
}

function openTaskModal(taskName) {
    taskModalInput.value = taskName;
    taskModal.style.display = 'block';

    // Supprimez les écouteurs d'événements sur le bouton d'enregistrement
    saveTaskModal.onclick = null;

    // Ajoutez un écouteur d'événement pour détecter la touche "Entrée" dans la fenêtre modale
    taskModal.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            saveTaskModal.click(); // Simule un clic sur le bouton d'enregistrement
        }
    });

    closeTaskModal.onclick = () => {
        taskModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === taskModal) {
            taskModal.style.display = 'none';
        }
    };
}

// Ajoutez un écouteur d'événement pour détecter la touche "Entrée" dans la fenêtre modale
folderModal.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        saveFolderModal.click(); // Simule un clic sur le bouton d'enregistrement
    }
});

// Ajoutez un écouteur d'événement pour détecter la touche "Entrée" dans la fenêtre modale
taskModal.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        saveTaskModal.click(); // Simule un clic sur le bouton d'enregistrement
    }
});


// Fonctions pour sauvegarder les données
function saveData() {
    localStorage.setItem('wedone-data', JSON.stringify(data));
}

// Créer une fonction pour charger les données depuis le localStorage
function loadData() {
    let storedData = localStorage.getItem("wedone-data");
    if (storedData) {
        data = JSON.parse(storedData);
        renderFolders();
        renderTasks();
    }
}

// Fonction pour afficher les dossiers avec animation
function renderFolders() {
    folderContainer.innerHTML = "";
    data.folders.forEach(folder => {
        let folderElement = document.createElement("div");
        folderElement.className = "folder";
        if (data.selectedFolder === folder.name) {
            folderElement.classList.add("selected");
        }
        folderElement.innerHTML = `<i class="fas fa-folder"></i><span>${folder.name}</span>`;
        folderElement.addEventListener("click", () => selectFolder(folder.name));
        folderContainer.appendChild(folderElement);
    });
    folderContainer.classList.add("loaded");
    setTimeout(() => {
        folderContainer.classList.remove("loaded");
    }, 500);
}

// Fonction pour afficher les tâches avec animation
function renderTasks() {
    taskList.innerHTML = "";
    if (data.selectedFolder) {
        let folder = data.folders.find(folder => folder.name === data.selectedFolder);
        if (folder) {
            folder.tasks.forEach(task => {
                let taskElement = document.createElement("li");
                taskElement.className = task.done ? "done" : "";
                taskElement.innerHTML = `
                    <input type="checkbox" ${task.done ? "checked" : ""}>
                    <span>${task.name}</span>
                    <i class="fas fa-trash-alt"></i>
                `;
                taskElement.querySelector("input").addEventListener("change", () => toggleTaskStatus(task.name));
                taskElement.querySelector("i").addEventListener("click", () => removeTaskFromList(task.name));
                taskList.appendChild(taskElement);
            });
        }
    }
    taskList.classList.add("loaded");
    setTimeout(() => {
        taskList.classList.remove("loaded");
    }, 500);
}

// Fonction pour changer le statut d'une tâche
function toggleTaskStatus(name) {
    if (name && data.selectedFolder) {
        let folder = data.folders.find(folder => folder.name === data.selectedFolder);
        let task = folder.tasks.find(task => task.name === name);
        if (task) {
            task.done = !task.done;
            saveData();
            renderTasks();
        }
    }
}

// Créer une fonction pour ajouter un dossier
function addFolderToList(name) {
    if (name && !data.folders.some(folder => folder.name === name)) {
        let folder = {
            name: name,
            tasks: []
        };
        data.folders.push(folder);
        saveData();
        renderFolders();
    }
}

// Créer une fonction pour supprimer un dossier
function removeFolderFromList(name) {
    data.folders = data.folders.filter(folder => folder.name !== name);
    if (data.selectedFolder === name) {
        data.selectedFolder = null;
    }
    saveData();
    renderFolders();
    renderTasks();
}

// Créer une fonction pour modifier un dossier
function editFolderInList(oldName, newName) {
    if (newName && !data.folders.some(folder => folder.name === newName)) {
        let index = data.folders.findIndex(folder => folder.name === oldName);
        if (index !== -1) {
            data.folders[index].name = newName;
            if (data.selectedFolder === oldName) {
                data.selectedFolder = newName;
            }
            saveData();
            renderFolders();
            renderTasks();
        }
    }
}

// Créer une fonction pour sélectionner un dossier
function selectFolder(name) {
    if (data.selectedFolder === name) {
        data.selectedFolder = null;
    } else {
        data.selectedFolder = name;
    }
    saveData();
    renderFolders();
    renderTasks();
}

// Créer une fonction pour ajouter une tâche
function addTaskToList(name) {
    if (name && data.selectedFolder) {
        let folder = data.folders.find(folder => folder.name === data.selectedFolder);
        if (folder && !folder.tasks.some(task => task.name === name)) {
            let task = {
                name: name,
                done: false
            };
            folder.tasks.push(task);
            saveData();
            renderTasks();
        }
    }
}

// Créer une fonction pour supprimer une tâche
function removeTaskFromList(name) {
    if (name && data.selectedFolder) {
        let folder = data.folders.find(folder => folder.name === data.selectedFolder);
        let index = folder.tasks.findIndex(task => task.name === name);
        if (index !== -1) {
            folder.tasks.splice(index, 1);
            saveData();
            renderTasks();
        }
    }
}

// Créer une fonction pour modifier une tâche
function editTaskInList(oldName, newName) {
    if (newName && data.selectedFolder) {
        let folder = data.folders.find(folder => folder.name === data.selectedFolder);
        let index = folder.tasks.findIndex(task => task.name === oldName);
        if (index !== -1 && !folder.tasks.some(task => task.name === newName)) {
            folder.tasks[index].name = newName;
            saveData();
            renderTasks();
        }
    }
}

// Fonction pour exporter les données en JSON
exportBtn.addEventListener("click", () => {
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
});

// Fonction pour importer les données depuis un fichier JSON
importBtn.addEventListener("click", () => {
    importFile.click();
});

importFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                data = JSON.parse(e.target.result);
                saveData();
                renderFolders();
                renderTasks();
            } catch (error) {
                alert("Erreur lors de l'importation du fichier. Assurez-vous que le fichier est au format JSON correct.");
            }
        };
        reader.readAsText(file);
    }
});

// Écouteur d'événement pour le bouton d'ajout de dossier
addFolder.addEventListener("click", () => {
    addFolderToList(folderInput.value);
    folderInput.value = "";
});

// Écouteur d'événement pour le bouton d'ajout de tâche
addTask.addEventListener("click", () => {
    addTaskToList(taskInput.value);
    taskInput.value = "";
});

// Ajouter des écouteurs d'événements pour les touches "Entrée"
folderInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addFolderToList(folderInput.value);
        folderInput.value = "";
    }
});

taskInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addTaskToList(taskInput.value);
        taskInput.value = "";
    }
});

function showNotification(message, type = 'success') {
    const notificationContainer = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type === 'error' ? 'notification-error' : 'notification-success'}`;
    notification.innerText = message;

    const scrollPosition = window.pageYOffset; // Sauvegarde de la position de défilement actuelle

    notificationContainer.appendChild(notification);

    // Vérifier si la notification a été ajoutée en haut ou en bas de la page
    const addedAtTop = notification.getBoundingClientRect().top < window.innerHeight / 2;

    setTimeout(() => {
        notificationContainer.removeChild(notification);

        // Réajuster la position de défilement après la suppression de la notification
        if (addedAtTop) {
            window.scrollTo(0, scrollPosition - notification.offsetHeight); // Pour les notifications ajoutées en haut
        } else {
            window.scrollTo(0, scrollPosition); // Pour les notifications ajoutées en bas
        }
    }, 3000);
}

// Utiliser showNotification pour les notifications de création/modification/erreur
function addFolderToList(name) {
    if (name && !data.folders.some(folder => folder.name === name)) {
        let folder = {
            name: name,
            tasks: []
        };
        data.folders.push(folder);
        saveData();
        renderFolders();
        showNotification("Dossier créé avec succès !");
    } else {
        showNotification("Le nom du dossier existe déjà ou est invalide.", "error");
    }
}
function addTaskToList(name) {
    if (!data.selectedFolder) {
        showNotification("Veuillez sélectionner un dossier avant d'ajouter une tâche.", "error");
        return;
    }

    let folder = data.folders.find(folder => folder.name === data.selectedFolder);
    if (!folder) {
        showNotification("Le dossier sélectionné est introuvable.", "error");
        return;
    }

    if (!name.trim()) {
        showNotification("Le nom de la tâche ne peut pas être vide.", "error");
        return;
    }

    if (folder.tasks.some(task => task.name === name)) {
        showNotification("Le nom de la tâche existe déjà.", "error");
        return;
    }

    let task = {
        name: name,
        done: false
    };

    folder.tasks.push(task);
    saveData();
    renderTasks();
    showNotification("Tâche créée avec succès !");
}
function addTaskToList(name) {
    if (!data.selectedFolder) {
        showNotification("Veuillez sélectionner un dossier avant d'ajouter une tâche.", "error");
        return;
    }

    let folder = data.folders.find(folder => folder.name === data.selectedFolder);
    if (!folder) {
        showNotification("Le dossier sélectionné est introuvable.", "error");
        return;
    }

    if (!name.trim()) {
        showNotification("Le nom de la tâche ne peut pas être vide.", "error");
        return;
    }

    if (folder.tasks.some(task => task.name === name)) {
        showNotification("Le nom de la tâche existe déjà.", "error");
        return;
    }

    let task = {
        name: name,
        done: false
    };

    folder.tasks.push(task);
    saveData();
    renderTasks();
    showNotification("Tâche créée avec succès !");
}



function removeFolderFromList(name) {
    data.folders = data.folders.filter(folder => folder.name !== name);
    if (data.selectedFolder === name) {
        data.selectedFolder = null;
    }
    saveData();
    renderFolders();
    renderTasks();
    showNotification("Dossier supprimé avec succès !");
}

function removeTaskFromList(name) {
    if (name && data.selectedFolder) {
        let folder = data.folders.find(folder => folder.name === data.selectedFolder);
        let index = folder.tasks.findIndex(task => task.name === name);
        if (index !== -1) {
            folder.tasks.splice(index, 1);
            saveData();
            renderTasks();
            showNotification("Tâche supprimée avec succès !");
        } else {
            showNotification("Erreur lors de la suppression de la tâche.", "error");
        }
    }
}

// Charger les données depuis le localStorage
loadData();
