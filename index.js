const loginSection = document.getElementById('login-section');
const adminDashboard = document.getElementById('admin-dashboard');
const employeeDashboard = document.getElementById('employee-dashboard');
const loginForm = document.getElementById('login-form');
const workhoursForm = document.getElementById('workhours-form');
const logoutButton = document.getElementById('logout-button');
const logoutEmployeeButton = document.getElementById('logout-employee-button');
const loginError = document.getElementById('login-error');

const users = [
    { username: 'admin', password: 'admin', role: 'admin' },
    { username: 'employee1', password: 'emp1', role: 'employee' },
    { username: 'employee2', password: 'emp2', role: 'employee' },
];

let employeesData = JSON.parse(localStorage.getItem('employeesData')) || [];
let employeesHours = JSON.parse(localStorage.getItem('employeesHours')) || {};

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        loginSection.classList.add('hidden');
        if (user.role === 'admin') {
            adminDashboard.classList.remove('hidden');
            populateAdminDashboard();
        } else if (user.role === 'employee') {
            employeeDashboard.classList.remove('hidden');
            populateEmployeeDashboard(username);
        }
    } else {
        loginError.style.display = 'block';
    }
});

function populateAdminDashboard() {
    const employeeTableBody = document.getElementById('employee-table').querySelector('tbody');
    employeeTableBody.innerHTML = '';
    Object.keys(employeesHours).forEach(employeeName => {
        employeesHours[employeeName].forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employeeName}</td>
                <td>${entry.date}</td>
                <td>${entry.hours} hours</td>
                <td>${entry.paid ? 'Paid' : 'Unpaid'}</td>
                <td>
                    <button class="edit-button" data-employee="${employeeName}" data-index="${index}">Edit</button>
                    <button class="delete-button" data-employee="${employeeName}" data-index="${index}">Delete</button>
                </td>
            `;
            employeeTableBody.appendChild(row);
        });
    });

    const editButtons = document.querySelectorAll('.edit-button');
    const deleteButtons = document.querySelectorAll('.delete-button');

    editButtons.forEach(button => {
        button.addEventListener('click', handleEditClick);
    });

    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const employeeName = e.target.getAttribute('data-employee');
            const index = e.target.getAttribute('data-index');
            employeesHours[employeeName].splice(index, 1);
            if (employeesHours[employeeName].length === 0) {
                delete employeesHours[employeeName];
            }
            localStorage.setItem('employeesHours', JSON.stringify(employeesHours));
            populateAdminDashboard();
        });
    });
}

function handleEditClick(e) {
    const employeeName = e.target.getAttribute('data-employee');
    const index = e.target.getAttribute('data-index');
    const entry = employeesHours[employeeName][index];

    // Populate the form with the selected entry's data
    document.getElementById('employee-name').value = employeeName;
    document.getElementById('hours-worked').value = entry.hours;
    document.getElementById('work-date').value = entry.date;

    // Set the form's data-editing attribute to identify it's an edit
    workhoursForm.setAttribute('data-editing', JSON.stringify({ employeeName, index }));
}

workhoursForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const employeeName = document.getElementById('employee-name').value;
    const hoursWorked = document.getElementById('hours-worked').value;
    const workDate = document.getElementById('work-date').value;

    if (employeeName && hoursWorked && workDate) {
        const editingData = workhoursForm.getAttribute('data-editing');
        if (editingData) {
            const { employeeName: oldEmployeeName, index } = JSON.parse(editingData);
            employeesHours[oldEmployeeName][index] = {
                date: workDate,
                hours: hoursWorked,
                paid: false,
            };
            workhoursForm.removeAttribute('data-editing');
        } else {
            if (!employeesHours[employeeName]) {
                employeesHours[employeeName] = [];
            }
            employeesHours[employeeName].push({
                date: workDate,
                hours: hoursWorked,
                paid: false,
            });
        }
        localStorage.setItem('employeesHours', JSON.stringify(employeesHours));
        populateAdminDashboard();
        populateEmployeeDashboard(employeeName); // Update the employee's dashboard immediately
    }
});

function populateEmployeeDashboard(employeeName) {
    const workHoursTableBody = document.getElementById('work-hours-table').querySelector('tbody');
    workHoursTableBody.innerHTML = '';
    if (employeesHours[employeeName]) {
        employeesHours[employeeName].forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${entry.date}</td>
                <td>${entry.hours} hours</td>
                <td><button class="edit-button" data-employee="${employeeName}" data-index="${index}">Edit</button></td>
                <td><button class="delete-button" data-employee="${employeeName}" data-index="${index}">Delete</button></td>
            `;
            workHoursTableBody.appendChild(row);
        });
    }
    // Enable scrolling when there are too many entries
    const workHoursTable = document.getElementById('work-hours-table');
    workHoursTable.style.maxHeight = '300px'; // Adjust height as needed
    workHoursTable.style.overflowY = 'auto';
}

logoutButton.addEventListener('click', () => {
    adminDashboard.classList.add('hidden');
    loginSection.classList.remove('hidden');
});

logoutEmployeeButton.addEventListener('click', () => {
    employeeDashboard.classList.add('hidden');
    loginSection.classList.remove('hidden');
});
