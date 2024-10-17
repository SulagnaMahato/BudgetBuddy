// Function to add the transaction and send it to the backend
async function addTransaction() {
    const inputField = document.getElementById('userInput');
    const userInput = inputField.value;

    if (userInput === '') return;

    // Display the input in the 'Last Transaction' section
    document.getElementById('displayInput').innerText = userInput;

    // Send transaction to backend
    const response = await fetch('http://localhost:3000/api/transaction', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: userInput })
    });

    // Check if transaction was saved successfully
    if (response.ok) {
        console.log('Transaction saved');
    } else {
        console.error('Error saving transaction');
    }

    // Clear input field
    inputField.value = '';

    // Reload the transaction history
    loadTransactionHistory();
}

// Function to load the transaction history
async function loadTransactionHistory() {
    const response = await fetch('http://localhost:3000/api/transactions');
    const transactions = await response.json();
    const transactionHistory = document.getElementById('transactionHistory');
    transactionHistory.innerHTML = '';
    transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = `${transaction.content} (Added on ${new Date(transaction.createdAt).toLocaleString()})`;
        transactionHistory.appendChild(li);
    });
}
window.onload = loadTransactionHistory;
