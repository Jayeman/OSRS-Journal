document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5500/extra_pages/accounts/login.html', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
            alert('Login successful!');
            // Redirect to account page or another section
            window.location.href = 'account.html';
        } else {
            document.getElementById('errorMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }

    alert('Received email:', email);
    alert('Received password:', password);

    
});
