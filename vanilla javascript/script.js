const liveTimeEl = document.getElementById('live-time');
const greetingEl = document.getElementById('greeting');
const dateBelowEl = document.getElementById('date-below');

const timerDisplay = document.getElementById('timer-display');
const startBtn = document.getElementById('timer-start');
const stopBtn = document.getElementById('timer-stop');
const resetBtn = document.getElementById('timer-reset');

const taskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');

const linkNameInput = document.getElementById('link-name');
const linkUrlInput = document.getElementById('link-url');
const addLinkBtn = document.getElementById('add-link-btn');
const linkList = document.getElementById('link-list');

let timerInterval = null;
let timerRunning = false;
const TOTAL_SECONDS = 25 * 60; // 25 menit
let currentSeconds = TOTAL_SECONDS;

function updateTimerDisplay() {
    const mins = Math.floor(currentSeconds / 60);
    const secs = currentSeconds % 60;
    timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    if (currentSeconds <= 0) {
        // Jika sudah 00:00, reset dulu (atau mulai dari 25:00? kita reset otomatis)
        currentSeconds = TOTAL_SECONDS;
        updateTimerDisplay();
    }
    timerRunning = true;
    timerInterval = setInterval(() => {
        if (currentSeconds <= 0) {
            // Waktu habis
            clearInterval(timerInterval);
            timerInterval = null;
            timerRunning = false;
            return;
        }
        currentSeconds--;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerRunning = false;
    }
}

function resetTimer() {
    stopTimer();
    currentSeconds = TOTAL_SECONDS;
    updateTimerDisplay();
}

// Event listener timer
startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// Inisialisasi tampilan timer
updateTimerDisplay();

function updateGreeting() {
    const now = new Date();
    const hours = now.getHours();
    let greeting = '';
    if (hours >= 5 && hours < 12) {
        greeting = 'Good Morning';
    } else if (hours >= 12 && hours < 18) {
        greeting = 'Good Afternoon';
    } else {
        greeting = 'Good Evening';
    }
    greetingEl.textContent = greeting;
}

function updateDateTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = now.toLocaleDateString('en-US', optionsDate);
    liveTimeEl.textContent = `${timeString} ${dateString}`;

    // Tanggal di bawah greeting
    dateBelowEl.textContent = dateString;

    // Perbarui greeting setiap detik juga (agar berubah sesuai jam)
    updateGreeting();
}

updateDateTime();
setInterval(updateDateTime, 1000);

let tasks = [];

function loadTasksFromLocalStorage() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
    } else {
        // Data default jika kosong
        tasks = [
            { id: Date.now() - 1, text: 'Inbox', completed: false },
            { id: Date.now() - 2, text: 'Drafts', completed: false }
        ];
    }
    renderTasks();
}

function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const span = document.createElement('span');
        span.className = `task-text ${task.completed ? 'completed' : ''}`;
        span.textContent = task.text;

        const editBtn = document.createElement('button');
        editBtn.className = 'task-edit';
        editBtn.innerHTML = '✎'; // atau 'Edit'
        editBtn.addEventListener('click', () => editTask(task.id));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete';
        deleteBtn.innerHTML = '🗑'; // atau 'Delete'
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });
}

function addTask() {
    const text = taskInput.value.trim();
    if (text === '') return;
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };
    tasks.push(newTask);
    saveTasksToLocalStorage();
    renderTasks();
    taskInput.value = '';
}


function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasksToLocalStorage();
        renderTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasksToLocalStorage();
    renderTasks();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasksToLocalStorage();
        renderTasks(); // re-render agar coretan berubah
    }
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

let links = [];

function loadLinksFromLocalStorage() {
    const stored = localStorage.getItem('quickLinks');
    if (stored) {
        links = JSON.parse(stored);
    } else {
        // Data default
        links = [
            { id: Date.now() - 3, name: 'List views', url: 'https://www.google.com' },
            { id: Date.now() - 4, name: 'Workflow', url: 'https://www.github.com' },
            { id: Date.now() - 5, name: 'Calendar', url: 'https://calendar.google.com' },
            { id: Date.now() - 6, name: 'Tasks', url: 'https://todoist.com' }
        ];
    }
    renderLinks();
}

function saveLinksToLocalStorage() {
    localStorage.setItem('quickLinks', JSON.stringify(links));
}

function renderLinks() {
    linkList.innerHTML = '';
    links.forEach(link => {
        const li = document.createElement('li');
        li.className = 'link-item';
        li.dataset.id = link.id;

        // Tautan
        const a = document.createElement('a');
        a.href = link.url;
        a.target = '_blank'; // buka tab baru
        a.rel = 'noopener noreferrer';
        a.textContent = link.name;

        // Tombol hapus
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'link-delete';
        deleteBtn.innerHTML = '🗑';
        deleteBtn.addEventListener('click', () => deleteLink(link.id));

        li.appendChild(a);
        li.appendChild(deleteBtn);
        linkList.appendChild(li);
    });
}

function addLink() {
    const name = linkNameInput.value.trim();
    const url = linkUrlInput.value.trim();
    if (name === '' || url === '') return;
    // Validasi URL sederhana
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = 'https://' + url;
    }
    const newLink = {
        id: Date.now(),
        name: name,
        url: fullUrl
    };
    links.push(newLink);
    saveLinksToLocalStorage();
    renderLinks();
    linkNameInput.value = '';
    linkUrlInput.value = '';
}

function deleteLink(id) {
    links = links.filter(l => l.id !== id);
    saveLinksToLocalStorage();
    renderLinks();
}

addLinkBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addLink();
});
linkNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addLink();
});

loadTasksFromLocalStorage();
loadLinksFromLocalStorage();