document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the form elements
    const name = document.getElementById('signup-name').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const photo = document.getElementById('signup-photo').files[0]; // Get the selected profile picture file

    // Create a FormData object to handle the form data and file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('profile-picture', photo); // Append the file to the form data

    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            body: formData // Send the formData object which includes both text and file data
        });

        if (!response.ok) {
            throw new Error('Error signing up');
        }

        alert('Signup successful! Please login.');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message);
    }
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Error logging in');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('name', data.name);
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
});
