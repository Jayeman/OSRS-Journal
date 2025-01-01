const express = require('express');
const mysql = require('mysql2');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const port = 5500;

// MySQL connection using mysql2
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL user
    password: 'Codingmaster2024?', // Your MySQL password
    database: 'accounts' // Your database name
});

connection.connect();

// Set up SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // To parse form data

// Serve static files from the 'extra_pages' folder
app.use(express.static(__dirname + '/extra_pages'));

// Function to generate verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Route to serve the create account page
app.post('/create-account', (req, res) => {
    res.sendFile(__dirname + '/../extra_pages/accounts/create.html');
});

app.post('/create-account', (req, res) => {
    console.log("Form submission received", req.body);  // Add this to check if the form data is coming through

    const { first_name, last_name, email, confirm_email, password, confirm_password } = req.body;

    // Validate email and password
    if (email !== confirm_email) {
        return res.status(400).send('The email addresses do not match');
    }

    if (password !== confirm_password) {
        return res.status(400).send('The passwords do not match');
    }

    // Hash the password for secure storage
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Error hashing password');
        }

        // Check if the email already exists in the database
        connection.query('SELECT * FROM user WHERE email = ?', [email], (err, results) => {
            if (err) {
                return res.status(500).send('Database error');
            }

            if (results.length > 0) {
                return res.status(400).send('This email already exists, try logging in');
            }

            // Generate verification token
            const token = generateVerificationToken();

            // Send verification email
            const msg = {
                to: email,
                from: 'your-email@example.com', // Your verified SendGrid email
                subject: 'Account Verification',
                text: `Hello ${first_name}, please verify your account by clicking on the link: http://localhost:5500/verify?token=${token}`,
                html: `<p>Hello ${first_name}, please verify your account by clicking on the link:</p><a href="http://localhost:5500/verify?token=${token}">Verify Account</a>`
            };

            sgMail.send(msg).then(() => {
                console.log('Verification email sent');
            }).catch((error) => {
                console.error('Error sending email:', error);
                return res.status(500).send('Error sending verification email');
            });

            // Save user info to the database with the verification token
            const query = 'INSERT INTO user (first_name, last_name, email, password_hash, verification_token) VALUES (?, ?, ?, ?, ?)';
            connection.query(query, [first_name, last_name, email, hashedPassword, token], (err, result) => {
                if (err) {
                    return res.status(500).send('Error saving user');
                }
                res.status(200).send('Account created! Please check your email to verify your account.');
            });
        });
    });
});

// Route to handle email verification
app.get('/verify', (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).send('Invalid token');
    }

    // Verify token in database
    connection.query('SELECT * FROM user WHERE verification_token = ?', [token], (err, results) => {
        if (err) {
            return res.status(500).send('Database error');
        }

        if (results.length === 0) {
            return res.status(400).send('Invalid or expired token');
        }

        // Mark the user as verified
        const user = results[0];
        connection.query('UPDATE user SET verified = 1, verification_token = NULL WHERE id = ?', [user.id], (err, result) => {
            if (err) {
                return res.status(500).send('Error updating user');
            }
            res.redirect('/index.html'); // Redirect to the homepage after successful verification
        });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
