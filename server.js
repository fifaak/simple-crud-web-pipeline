const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./db.sqlite');
const cors = require('cors');
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Create items table if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");
});

// Routes
app.get('/items', (req, res) => {
    db.all("SELECT * FROM items", (err, rows) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(rows);
        }
    });
});

app.post('/items', (req, res) => {
    const name = req.body.name;
    db.run("INSERT INTO items (name) VALUES (?)", [name], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).json({ id: this.lastID, name });
        }
    });
});

app.put('/items/:id', (req, res) => {
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

app.delete('/items/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM items WHERE id = ?", [id], function(err) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(204).send();
        }
    });
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
