document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    registerForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(registerForm);
        const username = formData.get('username');
        const password = formData.get('password');

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to register user');
            }
            window.location.href = '/login.html'; // Redirect to login page
        })
        .catch(error => {
            // Display error message on the HTML page
            errorMessage.textContent = error.message;
        });
    });
});
