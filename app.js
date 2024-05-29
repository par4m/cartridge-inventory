const express = require('express');
const mysql = require('mysql');
const path = require('path');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Create MySQL database connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'param',
    password: 'p5041',
    database: 'test'
});

// Connect to MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

// Endpoint to fetch all printers
app.get('/api/printers', (req, res) => {
    connection.query('SELECT * FROM printers', (err, results) => {
        if (err) {
            console.error('Error fetching printers: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to add a new printer
app.post('/api/printers', (req, res) => {
    const { pname, cost, vendor, quantity, drum } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    connection.query('INSERT INTO printers (pname, cost, vendor, quantity, drum, date) VALUES (?, ?, ?, ?, ?, ?)', [pname, cost, vendor, quantity, drum, date], (err, results) => {
        if (err) {
            console.error('Error adding printer: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(201).json({ message: 'Printer added successfully' });
        }
    });
});

// Endpoint to update the quantity of a printer
app.put('/api/printers/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    connection.query('UPDATE printers SET quantity = ? WHERE pid = ?', [quantity, id], (err, results) => {
        if (err) {
            console.error('Error updating quantity: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Quantity updated successfully' });
        }
    });
});

// Endpoint to fetch all cartridges with printer names
app.get('/api/cartridges', (req, res) => {
    const query = `
        SELECT c.cid, c.name AS cartridge_name, c.cost, c.vendor, c.yield, c.quantity, c.date, p.pname AS printer_name 
        FROM cartridges c
        JOIN printers p ON c.printer_id = p.pid
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching cartridges: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to add a new cartridge
app.post('/api/cartridges', (req, res) => {
    const { name, printer_id, cost, vendor, yield, quantity } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    connection.query('INSERT INTO cartridges (name, printer_id, cost, vendor, yield, quantity, date) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, printer_id, cost, vendor, yield, quantity, date], (err, results) => {
        if (err) {
            console.error('Error adding cartridge: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(201).json({ message: 'Cartridge added successfully' });
        }
    });
});

// Endpoint to update the quantity of a cartridge
app.put('/api/cartridges/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    connection.query('UPDATE cartridges SET quantity = ? WHERE cid = ?', [quantity, id], (err, results) => {
        if (err) {
            console.error('Error updating quantity: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Quantity updated successfully' });
        }
    });
});

// Endpoint to fetch all receipts
app.get('/api/receipts', (req, res) => {
    const query = `
        SELECT r.rid, r.receipt_name, r.cost, r.quantity, r.date, c.name AS cartridge_name 
        FROM receipts r
        JOIN cartridges c ON r.cid = c.cid
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching receipts: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to add a new receipt and update cartridge quantity
app.post('/api/receipts', (req, res) => {
    const { cid, cost, quantity } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    // Fetch cartridge name for the given cid and update the quantity
    connection.query('SELECT name, quantity FROM cartridges WHERE cid = ?', [cid], (err, results) => {
        if (err) {
            console.error('Error fetching cartridge: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const receipt_name = results[0].name;
            const newQuantity = results[0].quantity + parseInt(quantity, 10);

            connection.beginTransaction((err) => {
                if (err) {
                    console.error('Error starting transaction: ' + err.stack);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    // Insert the new receipt
                    connection.query('INSERT INTO receipts (cid, receipt_name, cost, quantity, date) VALUES (?, ?, ?, ?, ?)', 
                    [cid, receipt_name, cost, quantity, date], (err, results) => {
                        if (err) {
                            return connection.rollback(() => {
                                console.error('Error adding receipt: ' + err.stack);
                                res.status(500).json({ error: 'Internal Server Error' });
                            });
                        }

                        // Update the cartridge quantity
                        connection.query('UPDATE cartridges SET quantity = ? WHERE cid = ?', [newQuantity, cid], (err, results) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error('Error updating cartridge quantity: ' + err.stack);
                                    res.status(500).json({ error: 'Internal Server Error' });
                                });
                            }

                            connection.commit((err) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        console.error('Error committing transaction: ' + err.stack);
                                        res.status(500).json({ error: 'Internal Server Error' });
                                    });
                                }

                                res.status(201).json({ message: 'Receipt added and cartridge quantity updated successfully' });
                            });
                        });
                    });
                }
            });
        }
    });
});

// Endpoint to fetch all receipts for printers
app.get('/api/printer-receipts', (req, res) => {
    const query = `
        SELECT pr.rid, pr.pid, pr.cost, pr.quantity, pr.date, p.pname AS printer_name
        FROM printer_receipts pr
        JOIN printers p ON pr.pid = p.pid
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching printer receipts: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to add a new printer receipt
app.post('/api/printer-receipts', (req, res) => {
    const { pid, cost, quantity } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    connection.beginTransaction(err => {
        if (err) { throw err; }

        // Insert new receipt
        connection.query('INSERT INTO printer_receipts (pid, cost, quantity, date) VALUES (?, ?, ?, ?)', [pid, cost, quantity, date], (err, results) => {
            if (err) {
                return connection.rollback(() => {
                    console.error('Error adding printer receipt: ' + err.stack);
                    res.status(500).json({ error: 'Internal Server Error' });
                });
            }

            // Update printer quantity
            connection.query('UPDATE printers SET quantity = quantity + ? WHERE pid = ?', [quantity, pid], (err, results) => {
                if (err) {
                    return connection.rollback(() => {
                        console.error('Error updating printer quantity: ' + err.stack);
                        res.status(500).json({ error: 'Internal Server Error' });
                    });
                }

                connection.commit(err => {
                    if (err) {
                        return connection.rollback(() => {
                            console.error('Error committing transaction: ' + err.stack);
                            res.status(500).json({ error: 'Internal Server Error' });
                        });
                    }
                    res.status(201).json({ message: 'Printer receipt added and printer quantity updated successfully' });
                });
            });
        });
    });
});

// Endpoint to fetch all issued toners
app.get('/api/issued-toners', (req, res) => {
    const query = `
        SELECT it.empid, it.empname, it.quantity, it.date, c.name AS cartridge_name
        FROM employee it
        JOIN cartridges c ON it.cid = c.cid
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching issued toners: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to issue a toner to an employee
app.post('/api/issue-toner', (req, res) => {
    const { empid, empname, cid, quantity } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    // Fetch cartridge quantity to ensure there is enough stock
    connection.query('SELECT quantity FROM cartridges WHERE cid = ?', [cid], (err, results) => {
        if (err) {
            console.error('Error fetching cartridge quantity: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const availableQuantity = results[0].quantity;

            if (availableQuantity < quantity) {
                res.status(400).json({ error: 'Not enough stock available' });
            } else {
                const newQuantity = availableQuantity - quantity;

                connection.beginTransaction(err => {
                    if (err) {
                        console.error('Error starting transaction: ' + err.stack);
                        res.status(500).json({ error: 'Internal Server Error' });
                    } else {
                        // Insert the issue record
                        connection.query('INSERT INTO employee (empid, empname, cid, quantity, date) VALUES (?, ?, ?, ?, ?)', 
                        [empid, empname, cid, quantity, date], (err, results) => {
                            if (err) {
                                return connection.rollback(() => {
                                    console.error('Error issuing toner: ' + err.stack);
                                    res.status(500).json({ error: 'Internal Server Error' });
                                });
                            }

                            // Update the cartridge quantity
                            connection.query('UPDATE cartridges SET quantity = ? WHERE cid = ?', [newQuantity, cid], (err, results) => {
                                if (err) {
                                    return connection.rollback(() => {
                                        console.error('Error updating cartridge quantity: ' + err.stack);
                                        res.status(500).json({ error: 'Internal Server Error' });
                                    });
                                }

                                connection.commit(err => {
                                    if (err) {
                                        return connection.rollback(() => {
                                            console.error('Error committing transaction: ' + err.stack);
                                            res.status(500).json({ error: 'Internal Server Error' });
                                        });
                                    }

                                    res.status(201).json({ message: 'Toner issued to employee and cartridge quantity updated successfully' });
                                });
                            });
                        });
                    }
                });
            }
        }
    });
});


// Endpoint to update the quantity of a printer
app.put('/api/printers/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    connection.query('UPDATE printers SET quantity = ? WHERE pid = ?', [quantity, id], (err, results) => {
        if (err) {
            console.error('Error updating quantity: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Quantity updated successfully' });
        }
    });
});


// Endpoint to update the quantity of a cartridge
app.put('/api/cartridges/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    connection.query('UPDATE cartridges SET quantity = ? WHERE cid = ?', [quantity, id], (err, results) => {
        if (err) {
            console.error('Error updating quantity: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Quantity updated successfully' });
        }
    });
});



// Endpoint to fetch all printers
app.get('/api/printers', (req, res) => {
    connection.query('SELECT * FROM printers', (err, results) => {
        if (err) {
            console.error('Error fetching printers: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to add a new printer
app.post('/api/printers', (req, res) => {
    const { pname, cost, vendor, quantity, drum } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    connection.query('INSERT INTO printers (pname, cost, vendor, quantity, drum, date) VALUES (?, ?, ?, ?, ?, ?)', [pname, cost, vendor, quantity, drum, date], (err, results) => {
        if (err) {
            console.error('Error adding printer: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(201).json({ message: 'Printer added successfully' });
        }
    });
});

// Endpoint to update the quantity of a printer
app.put('/api/printers/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    connection.query('UPDATE printers SET quantity = ? WHERE pid = ?', [quantity, id], (err, results) => {
        if (err) {
            console.error('Error updating printer quantity: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Printer quantity updated successfully' });
        }
    });
});

// Endpoint to fetch all cartridges with printer names
app.get('/api/cartridges', (req, res) => {
    const query = `
        SELECT c.cid, c.name AS cartridge_name, c.cost, c.vendor, c.yield, c.quantity, c.date, p.pname AS printer_name 
        FROM cartridges c
        JOIN printers p ON c.printer_id = p.pid
    `;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching cartridges: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to add a new cartridge
app.post('/api/cartridges', (req, res) => {
    const { name, printer_id, cost, vendor, yield, quantity } = req.body;
    const date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format

    connection.query('INSERT INTO cartridges (name, printer_id, cost, vendor, yield, quantity, date) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, printer_id, cost, vendor, yield, quantity, date], (err, results) => {
        if (err) {
            console.error('Error adding cartridge: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(201).json({ message: 'Cartridge added successfully' });
        }
    });
});

// Endpoint to update the quantity of a cartridge
app.put('/api/cartridges/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;

    connection.query('UPDATE cartridges SET quantity = ? WHERE cid = ?', [quantity, id], (err, results) => {
        if (err) {
            console.error('Error updating cartridge quantity: ' + err.stack);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Cartridge quantity updated successfully' });
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
