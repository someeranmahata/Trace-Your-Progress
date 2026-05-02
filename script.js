let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
function updateProfileStats() {

    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("totalTasks").innerText = total;
    document.getElementById("completedTasks").innerText = completed;
    document.getElementById("completionPercent").innerText = percent + "%";
}
function updateDashboard() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const data = getMonthlyTaskCount(year, month);

    updateCharts(data);
    generateMonths();
    updateProfileStats();   
}
/* ADD TASK */
function addTask() {
    const date = document.getElementById("dateInput").value;
    const name = document.getElementById("taskName").value.trim();

    if (!date || !name) return;

    tasks.push({
        date: date,
        name: name,
        completed: false
    });

    document.getElementById("taskName").value = "";

    saveTasks();
    renderTasks();
    updateDashboard();
}

function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
    renderTasks();
    updateDashboard();
}

function renderTasks() {

    const selectedDate = document.getElementById("dateInput").value;
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    if (!selectedDate) {
        taskList.innerHTML = "Select a date to view tasks";
        return;
    }

    const filteredTasks = tasks.filter(task => task.date === selectedDate);

    if (filteredTasks.length === 0) {
        taskList.innerHTML = "No tasks added for this date";
        return;
    }

    filteredTasks.forEach(task => {

        const index = tasks.indexOf(task);

        taskList.innerHTML += `
            <div class="task-item">
                <input type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${index})">

                <span style="margin-left:8px; flex:1;">
                    ${task.name}
                </span>

                <button onclick="deleteTask(${index})"
                        style="background:#8b0000; border:1px solid #ff4d4d; padding:2px 6px;">
                    ✕
                </button>
            </div>
        `;
    });
}
function deleteTask(index) {

    if (!confirm("Delete this task?")) return;

    tasks.splice(index, 1);

    saveTasks();
    renderTasks();
    updateDashboard();
}


function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getMonthlyTaskCount(year, month) {
    const days = getDaysInMonth(year, month);
    let data = new Array(days).fill(0);

    tasks.forEach(task => {
        const d = new Date(task.date);
        if (d.getFullYear() === year && d.getMonth() === month && task.completed) {
            data[d.getDate() - 1]++;
        }
    });

    return data;
}

function getMonthlyPercentage(year, month, day) {
    const dayTasks = tasks.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === year &&
               d.getMonth() === month &&
               d.getDate() === day;
    });

    if (dayTasks.length === 0) return 0;

    const completed = dayTasks.filter(t => t.completed).length;
    return Math.round((completed / dayTasks.length) * 100);
}

/* CHARTS */

Chart.defaults.color = "#c9d1d9";
Chart.defaults.borderColor = "#30363d";

const barChart = new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: { labels: [], datasets: [{
        label: "Tasks Completed",
        data: [],
        backgroundColor: "#26a641"
    }]},
    options: { responsive: true, maintainAspectRatio: false }
});

const lineChart = new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: { 
        labels: [], 
        datasets: [{
            label: "Tasks Completed",
            data: [],
            borderColor: "#39d353",
            tension: 0.3,
            fill: false
        }]
    },
    options: { 
        responsive: true, 
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                min: 0,
                ticks: {
                    precision: 0   
                }
            }
        }
    }
});

function updateCharts(data) {
    const labels = data.map((_, i) => i + 1);

    barChart.data.labels = labels;
    barChart.data.datasets[0].data = data;
    barChart.update();

    lineChart.data.labels = labels;
    lineChart.data.datasets[0].data = data;
    lineChart.update();
}


function generateMonths() {

    const container = document.getElementById("allMonths");
    container.innerHTML = "";

    const year = new Date().getFullYear();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun",
                        "Jul","Aug","Sep","Oct","Nov","Dec"];

    for (let m = 0; m < 12; m++) {

        const days = getDaysInMonth(year, m);
        let html = `<div class="month"><b>${monthNames[m]}</b><table><tr>`;

        for (let d = 1; d <= days; d++) {

            const percent = getMonthlyPercentage(year, m, d);
            let cls = "";

            if (percent > 0 && percent < 25) cls = "green1";
            else if (percent >= 25 && percent < 50) cls = "green2";
            else if (percent >= 50 && percent < 75) cls = "green3";
            else if (percent >= 75) cls = "green4";

            html += `<td class="${cls}"></td>`;

            if (d % 7 === 0) html += "</tr><tr>";
        }

        html += "</tr></table></div>";
        container.innerHTML += html;
    }
}


function resetData() {

    if (!confirm("Are you sure you want to reset everything?")) return;

    tasks = [];
    localStorage.removeItem("tasks");

    document.getElementById("taskList").innerHTML = "Select a date to view tasks";
    document.getElementById("taskName").value = "";
    document.getElementById("dateInput").value = "";

    updateDashboard();
}


function updateDashboard() {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    const data = getMonthlyTaskCount(year, month);

    updateCharts(data);
    generateMonths();
}
function copyYesterdayTasks() {

    const selectedDate = document.getElementById("dateInput").value;

    if (!selectedDate) {
        alert("Please select today's date first.");
        return;
    }

    const today = new Date(selectedDate);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const yesterdayTasks = tasks.filter(t => t.date === yesterdayStr);

    if (yesterdayTasks.length === 0) {
        alert("No tasks found for yesterday.");
        return;
    }

    const todayTasks = tasks.filter(t => t.date === selectedDate);

    yesterdayTasks.forEach(task => {

        const alreadyExists = todayTasks.some(t => t.name === task.name);

        if (!alreadyExists) {
            tasks.push({
                date: selectedDate,
                name: task.name,
                completed: false   
            });
        }
    });

    saveTasks();
    renderTasks();
    updateDashboard();
}
function changeDate(direction) {

    const dateInput = document.getElementById("dateInput");

    if (!dateInput.value) {
        dateInput.value = new Date().toISOString().split("T")[0];
    }

    const currentDate = new Date(dateInput.value);
    currentDate.setDate(currentDate.getDate() + direction);

    dateInput.value = currentDate.toISOString().split("T")[0];

    renderTasks();
}
document.getElementById("dateInput").value =
    new Date().toISOString().split("T")[0];

renderTasks();

updateDashboard();

document.getElementById("dateInput").addEventListener("change", renderTasks);