const BASE_URL = 'http://localhost:5000';

let expensesData = []; 
let username = '';
let chartInstance = null; 

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    
    e.preventDefault();

    const username = document.getElementById('registerUsername').value;
    
    const password = document.getElementById('registerPassword').value;

    const res = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (res.ok) alert('Registered successfully!');
    else alert('Registration failed');
});




document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('loginUsername').value; // Fetch username
    const password = document.getElementById('loginPassword').value; // Fetch password

    const res = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
        document.getElementById('auth').style.display = 'none'; // Hide login/register section
        document.getElementById('app').style.display = 'block'; // Show app dashboard
        alert('Login successful');

       
        document.getElementById('username').textContent = username;

        
        fetchExpenses();
    } else {
        alert('Login failed');
    }
});



document.getElementById('logoutButton').addEventListener('click', () => {
    fetch(`${BASE_URL}/api/logout`, {
        method: 'POST',
        credentials: 'same-origin',
    }).then(() => {
        document.getElementById('auth').style.display = 'block';
        document.getElementById('app').style.display = 'none';
        alert('Logged out');
    });
});


document.getElementById('expenseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = document.getElementById('description').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const date = document.getElementById('date').value;

    const res = await fetch(`${BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description, amount, date }),
    });

    if (res.ok) {
        alert('Expense added successfully!');
        fetchExpenses(); 
    } else {
        alert('Failed to add expense');
    }

    
    document.getElementById('description').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('date').value = '';
});


document.getElementById('generateForm').addEventListener('submit', async (e) => {
    
    e.preventDefault();
    
    const startDate = document.getElementById('startDate').value;
    
    const endDate = document.getElementById('endDate').value;

    const res = await fetch(`${BASE_URL}/api/expenses?startDate=${startDate}&endDate=${endDate}`);
    expensesData = await res.json();

    generateChart(expensesData);


    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
});



async function fetchExpenses() {
    const res = await fetch(`${BASE_URL}/api/expenses`);
    const expenses = await res.json();

   
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = ''; 
    expenses.forEach((expense) => {
        const li = document.createElement('li');
        li.innerHTML = `${expense.description} - ${expense.amount} - ${expense.date}
                        <button onclick="deleteExpense('${expense._id}')">Delete</button>
                        <button onclick="updateExpense('${expense._id}')">Update</button>`;
        expenseList.appendChild(li);
    });
}

document.getElementById('viewAllExpensesButton').addEventListener('click', () => {
    const expenseList = document.getElementById('expenseList');
    expenseList.style.display = expenseList.style.display === 'block' ? 'none' : 'block'; // Toggle the visibility of the expense list
});

async function deleteExpense(id) {
    const res = await fetch(`${BASE_URL}/api/expenses/${id}`, { method: 'DELETE' });
    if (res.ok) {
        alert('Expense deleted successfully!');
        fetchExpenses(); 
    } else {
        alert('Failed to delete expense');
    }
}

async function updateExpense(id) {
    const newDescription = prompt('Enter new description:');
    const newAmount = prompt('Enter new amount:');
    const newDate = prompt('Enter new date (YYYY-MM-DD):');

    const res = await fetch(`${BASE_URL}/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newDescription, amount: newAmount, date: newDate }),
    });

    if (res.ok) {
        alert('Expense updated successfully!');
        fetchExpenses(); 
    } else {
        alert('Failed to update expense');
    }
}


function generateChart(data) {
    
    if (chartInstance) {
        chartInstance.destroy(); 
    }

    const labels = data.map((expense) => `${expense.description} - ${new Date(expense.date).toLocaleDateString()}`);
    const expenses = data.map((expense) => expense.amount);
    const backgroundColors = data.map(() => getRandomColor()); // Assign random color for each expense

    const ctx = document.getElementById('expenseChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: expenses,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1,
            }],
        },
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
