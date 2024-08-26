const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./db.sqlite');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: true
}));

// Create items table if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");
});

// Middleware to check if the user is authenticated and has admin access
function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send('Access Denied');
    }
}

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        return res.redirect('/login.html');
    }
}

// Routes
app.get('/items', isAuthenticated, (req, res) => {
    db.all("SELECT * FROM items", (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

app.post('/items', isAdmin, (req, res) => {
    const name = req.body.name;
    db.run("INSERT INTO items (name) VALUES (?)", [name], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).json({ id: this.lastID, name });
        }
    });
});

app.put('/items/:id', isAdmin, (req, res) => {
    const id = req.params.id;
    const name = req.body.name;
    db.run("UPDATE items SET name = ? WHERE id = ?", [name, id], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json({ id, name });
        }
    });
});

app.delete('/items/:id', isAdmin, (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM items WHERE id = ?", [id], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(204).send();
        }
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin') {
        req.session.user = { role: 'admin' };
        res.json({ success: true, redirect: '/index.html' });
    } else if (username === 'test' && password === 'test') {
        req.session.user = { role: 'user' };
        res.json({ success: true, redirect: '/user.html' });
    } else {
        res.json({ success: false, message: 'Invalid username or password' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login.html');
    });
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
