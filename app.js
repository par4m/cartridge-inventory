
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const express = require('express');
const path = require('path');

const app = express();

app.use(express.json()); // Add this line to parse JSON requests

let db;

(async () => {
    db = await open({
        filename: 'database.db',
        driver: sqlite3.Database
    });

    app.use(express.static(path.join(__dirname, 'public')));

    app.get('/api/cartridge-issued', async (req, res) => {
        try {
            const rows = await db.all('SELECT * FROM employee');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/cartridge-purchased', async (req, res) => {
        try {
            const rows = await db.all('SELECT * FROM receipts');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/printers', async (req, res) => {
        try {
            const rows = await db.all('SELECT * FROM printers');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/cartridges', async (req, res) => {
        try {
            const rows = await db.all('SELECT * FROM cartridges');
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.post('/api/add-cartridge', async (req, res) => {
        try {
            const { name, printer_id, cost, vendor, yield, quantity } = req.body;

            // Check if a cartridge with the same name already exists
            const existingCartridge = await db.get('SELECT * FROM cartridges WHERE name = ?', [name]);

            if (existingCartridge) {
                // If the cartridge exists, update its quantity
                const newQuantity = existingCartridge.quantity + quantity;
                await db.run('UPDATE cartridges SET quantity = ? WHERE name = ?', [newQuantity, name]);
                res.json({ message: 'Cartridge quantity updated successfully' });

                // Add entry to receipts table
                const receiptQuery = `
                    INSERT INTO receipts (cid, receipt_name, cost, quantity, date)
                    VALUES (?, ?, ?, ?, datetime('now'))
                `;
                await db.run(receiptQuery, [existingCartridge.cid, name, cost, quantity]);
            } else {
                // If the cartridge doesn't exist, insert a new entry
                const query = `
                    INSERT INTO cartridges (name, printer_id, cost, vendor, pageYield, quantity, date)
                    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                `;
                const result = await db.run(query, [name, printer_id, cost, vendor, yield, quantity]);
                const newCartridgeId = result.lastID;
                res.json({ message: 'Cartridge added successfully' });

                // Add entry to receipts table
                const receiptQuery = `
                    INSERT INTO receipts (cid, receipt_name, cost, quantity, date)
                    VALUES (?, ?, ?, ?, datetime('now'))
                `;
                await db.run(receiptQuery, [newCartridgeId, name, cost, quantity]);
            }
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    app.get('/api/employee', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM employee');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})();
