/*function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();
    if (taskText === "") return;

    let li = document.createElement("li");
    let span = document.createElement("span");
    span.textContent = taskText;
    span.onclick = function () {
        this.classList.toggle("completed");
    };

    let deleteBtn = document.createElement("button");
    deleteBtn.textContent = "delete";
    deleteBtn.onclick = function () {
        li.remove();
    };

    li.appendChild(span);
    li.appendChild(deleteBtn);
    document.getElementById("taskList").appendChild(li);
    taskInput.value = "";
}*/
// 日期格式化函式
// 原始功能強化版
class Task {
    constructor(title, description, dueDate, priority) {
        this.id = Date.now();
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.completed = false;
    }
}

class Project {
    constructor(name) {
        this.name = name;
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
    }

    getSortedTasks() {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return [...this.tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    }
}

let projects = {};
let currentProjectName = "";

function saveToLocalStorage() {
    const data = {
        projects: Object.fromEntries(
            Object.entries(projects).map(([name, project]) => [
                name,
                {
                    name: project.name,
                    tasks: project.tasks
                }
            ])
        ),
        currentProjectName
    };
    localStorage.setItem("todoData", JSON.stringify(data));
}

function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem("todoData"));
    if (!data) return;

    projects = {};
    for (const name in data.projects) {
        const projectData = data.projects[name];
        const project = new Project(projectData.name);
        project.tasks = projectData.tasks;
        projects[name] = project;
    }
    currentProjectName = data.currentProjectName || "";
}

function updateCurrentProjectDisplay() {
    const nameEl = document.getElementById("currentProjectName");
    nameEl.textContent = currentProjectName ? `Current Project: ${currentProjectName}` : "No Project Selected";
}

function switchProject(name) {
    currentProjectName = name;
    renderProjectSelector();
    renderTasks();
    updateCurrentProjectDisplay();
    saveToLocalStorage();
}

function createProject() {
    const name = prompt("Enter project name:");
    if (!name || projects[name]) return;
    projects[name] = new Project(name);
    switchProject(name);
}

function renameProject() {
    if (!currentProjectName) return;
    const newName = prompt("Enter new project name:", currentProjectName);
    if (!newName || projects[newName]) return;
    projects[newName] = projects[currentProjectName];
    projects[newName].name = newName;
    delete projects[currentProjectName];
    switchProject(newName);
}

function deleteProject() {
    if (!currentProjectName) return;
    if (!confirm(`Delete project '${currentProjectName}'?`)) return;
    delete projects[currentProjectName];
    currentProjectName = "";
    renderProjectSelector();
    renderTasks();
    updateCurrentProjectDisplay();
    saveToLocalStorage();
}

function addTask() {
    if (!currentProjectName) return alert("Please select a project first");

    const title = document.getElementById("titleInput").value.trim();
    const description = document.getElementById("descInput").value.trim();
    const dueDate = document.getElementById("dueInput").value;
    const priority = document.getElementById("priorityInput").value;
    if (!title) return;

    const task = new Task(title, description, dueDate, priority);
    projects[currentProjectName].addTask(task);

    document.getElementById("titleInput").value = "";
    document.getElementById("descInput").value = "";
    document.getElementById("dueInput").value = "";
    document.getElementById("priorityInput").value = "Medium";

    renderTasks();
    saveToLocalStorage();
}

function renderProjectSelector() {
    const select = document.getElementById("projectDropdown");
    select.innerHTML = "";
    for (const name in projects) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }
    select.value = currentProjectName;
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
    if (!currentProjectName || !projects[currentProjectName]) return;
    const project = projects[currentProjectName];
    project.getSortedTasks().forEach(task => {
        const li = document.createElement("li");
        li.className = `priority-${task.priority.toLowerCase()}`;

        const title = document.createElement("span");
        title.textContent = task.title;
        title.className = task.completed ? "completed" : "";
        title.onclick = () => {
            task.completed = !task.completed;
            renderTasks();
            saveToLocalStorage();
        };

        const desc = document.createElement("div");
        desc.textContent = task.description;

        const due = document.createElement("div");
        due.textContent = `Due: ${task.dueDate}`;

        const pri = document.createElement("div");
        pri.textContent = `Priority: ${task.priority}`;

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.onclick = () => {
            project.deleteTask(task.id);
            renderTasks();
            saveToLocalStorage();
        };

        li.appendChild(title);
        li.appendChild(desc);
        li.appendChild(due);
        li.appendChild(pri);
        li.appendChild(del);
        list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadFromLocalStorage();
    renderProjectSelector();
    renderTasks();
    updateCurrentProjectDisplay();
    document.getElementById("projectDropdown").onchange = (e) => switchProject(e.target.value);
});
