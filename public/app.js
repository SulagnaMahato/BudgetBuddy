document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display user name and data
    fetchUserData();

    // Fetch and display transactions
    fetchTransactions();

    // Event listeners for buttons
    document.getElementById('credit-button').addEventListener('click', () => handleTransaction('credit'));
    document.getElementById('debit-button').addEventListener('click', () => handleTransaction('debit'));
    document.getElementById('search-button').addEventListener('click', searchTransactions);
    document.getElementById('transaction-form').addEventListener('submit', addTransaction);

    // Profile picture click event
    document.getElementById("profile-picture").addEventListener("click", showProfileModal);
});

// Fetch user data from API
async function fetchUserData() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch('/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        // Update local storage and DOM with user data
        localStorage.setItem('name', data.name);
        localStorage.setItem('username', data.username);
        localStorage.setItem('profilePicture', data.profilePicture);

        document.getElementById('user-name').textContent = data.name;
        if (data.profilePicture) {
            document.getElementById('profile-picture').src = data.profilePicture;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Error loading user information.');
    }
}

// Logout functionality
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html'; // Redirect to login page after logout
}

// Show Profile Modal
function showProfileModal() {
    // Fetch the user details from local storage
    const name = localStorage.getItem('name');
    const username = localStorage.getItem('username');
    const profilePicture = localStorage.getItem('profilePicture'); // Fetching profile picture

    // Populate modal with user details
    document.getElementById("modal-name").textContent = name ? name : 'Name not available';
    document.getElementById("modal-username").textContent = username ? username : 'Username not available';
    
    // Update the profile picture in the modal
    const profileImg = document.getElementById("modal-profile-picture");
    if (profilePicture) {
        profileImg.src = profilePicture;
        profileImg.alt = 'Profile Picture';
    } else {
        profileImg.src = 'default-profile.jpg'; // Optional: A default image if no profile picture is available
        profileImg.alt = 'Default Profile Picture';
    }

    // Show the modal
    document.getElementById("profile-modal").style.display = "block";
    window.onclick = function(event) {
        const modal = document.getElementById('profile-modal');
        const profilePicture = document.getElementById('profile-picture');
        
        // Close the modal if the click is outside the modal or profile picture
        if (event.target !== modal && !modal.contains(event.target) && event.target !== profilePicture) {
            modal.style.display = 'none';
        }
    };
}

// Fetch transactions from API
function fetchTransactions() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    fetch('/api/transactions', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(transactions => {
        updateTransactionList(transactions);
        updateTotalBalance(transactions); // Update total balance, credit, and expense
    })
    .catch(error => {
        console.error('Error fetching transactions:', error);
    });
}

// Update transaction list
function updateTransactionList(transactions) {
    const transactionList = document.getElementById('transaction-list');
    transactionList.innerHTML = ''; // Clear existing transactions

    // Sort transactions by date in descending order
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    transactions.forEach(transaction => {
        const row = document.createElement('tr');
        const amountClass = transaction.amount > 0 ? 'credit' : 'debit';
        const type = transaction.amount > 0 ? 'Credit' : 'Expense';
        const displayAmount = transaction.amount > 0 ? 
            `₹${transaction.amount.toFixed(0)}` : 
            `₹${Math.abs(transaction.amount).toFixed(2)}`;

        row.innerHTML = `
            <td>${new Date(transaction.date).toLocaleDateString()}</td>
            <td>${transaction.description}</td>
            <td>${type}</td>
            <td class="${amountClass}">${displayAmount}</td>
        `;
        transactionList.appendChild(row);
    });
}

// Update total balance and transactions
function updateTotalBalance(transactions) {
    let totalBalance = 0;
    let totalCredits = 0;
    let totalExpenses = 0;

    transactions.forEach(transaction => {
        totalBalance += transaction.amount;
        if (transaction.amount > 0) {
            totalCredits += transaction.amount;
        } else {
            totalExpenses += Math.abs(transaction.amount);
        }
    });

    document.getElementById('total-balance').textContent = totalBalance.toFixed(0);
    document.getElementById('total-credit').textContent = `₹${totalCredits.toFixed(0)}`;
    document.getElementById('total-expense').textContent = `₹${totalExpenses.toFixed(0)}`;


    // Change the color of the total balance if it's negative
    const totalBalanceElement = document.getElementById('total-balance');
    if (totalBalance < 0) {
        totalBalanceElement.style.color = 'red';  // Turn red if negative
    } else {
        totalBalanceElement.style.color = 'black';  // Turn black if positive or zero
    }
}

// Handle adding transactions
function handleTransaction(type) {
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    if (isNaN(amount) || !description || !date) {
        alert('Please fill all fields correctly!');
        return;
    }

    const transaction = {
        amount: type === 'credit' ? amount : -amount,
        description: description,
        date: date
    };

    // Call function to save transaction
    addTransaction(transaction);
}

// Add transaction to API
function addTransaction(transaction) {
    const token = localStorage.getItem('token');
    
    fetch('/api/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transaction)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to add transaction');
        }
        return response.json();
    })
    .then(() => {
        // Fetch and display transactions again
        fetchTransactions();
        // Clear form fields
        document.getElementById('transaction-form').reset();
    })
    .catch(error => {
        console.error('Error adding transaction:', error);
    });
}

// Search transactions by date
function searchTransactions() {
    const date = document.getElementById('search-date').value;
    if (!date) {
        alert('Please select a date to search!');
        return;
    }

    const token = localStorage.getItem('token');
    
    fetch(`/api/transactions?date=${date}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(transactions => {
        updateTransactionList(transactions);
    })
    .catch(error => {
        console.error('Error searching transactions:', error);
    });
}


