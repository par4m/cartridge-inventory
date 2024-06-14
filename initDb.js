const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE IF NOT EXISTS cartridges (
        cid INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        printer_id INTEGER NOT NULL,
        cost REAL NOT NULL,
        vendor TEXT NOT NULL,
        pageYield INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        date TEXT DEFAULT (datetime('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS employee (
        empid INTEGER,
        empname TEXT,
        cid INTEGER,
        quantity INTEGER,
        date TEXT,
        department TEXT,
        FOREIGN KEY (cid) REFERENCES cartridges (cid)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS printer_receipts (
        rid INTEGER PRIMARY KEY AUTOINCREMENT,
        pid INTEGER,
        cost REAL,
        quantity INTEGER,
        date TEXT,
        FOREIGN KEY (pid) REFERENCES printers (pid)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS printers (
        pid INTEGER PRIMARY KEY AUTOINCREMENT,
        pname TEXT NOT NULL,
        cost REAL NOT NULL,
        vendor TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        drum TEXT NOT NULL,
        date TEXT DEFAULT (date('now'))
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS receipts (
        rid INTEGER PRIMARY KEY AUTOINCREMENT,
        cid INTEGER,
        receipt_name TEXT,
        cost REAL,
        quantity INTEGER,
        date TEXT,
        FOREIGN KEY (cid) REFERENCES cartridges (cid)
    )`);

    // Insert data
    db.run(`INSERT INTO printers (pname, cost, vendor, quantity, drum, date) VALUES
        ('Brother DCP-T520W', 15000.00, 'XYZ Pvt Ltd', 10, 'Separate', '2024-05-28'),
        ('HP LaserJet Pro', 25000.00, 'ABC Pvt Ltd', 15, 'Integrated', '2024-05-28'),
        ('Epson EcoTank L3110', 14000.00, 'Croma', 20, 'Separate', '2024-05-29')`);

    db.run(`INSERT INTO cartridges (name, printer_id, cost, vendor, pageYield, quantity, date) VALUES
        ('TN-2420', 1, 5000.00, 'XYZ Pvt Ltd', 3000, 5, '2024-05-27 18:30:00'),
        ('HP 88A', 2, 4500.00, 'ABC Pvt Ltd', 1500, 10, '2024-05-27 18:30:00'),
        ('Epson 003', 3, 750.00, 'Croma', 6000, 25, '2024-05-27 18:30:00'),
        ('Brother LC39', 1, 1500.00, 'XYZ Pvt Ltd', 1500, 30, '2024-05-28 18:30:00')`);

    db.run(`INSERT INTO employee (empid, empname, cid, quantity, date, department) VALUES
        (101, 'Amit Sharma', 2, 1, '2024-05-29', 'Sales'),
        (102, 'Ravi Kumar', 3, 1, '2024-05-29', 'Marketing'),
        (103, 'Sonal Patel', 2, 1, '2024-05-29', 'HR'),
        (104, 'Neha Singh', 3, 2, '2024-05-29', 'Finance')`);

    db.run(`INSERT INTO printer_receipts (pid, cost, quantity, date) VALUES
        (1, 15000.00, 5, '2024-05-28'),
        (2, 25000.00, 3, '2024-05-28'),
        (3, 14000.00, 2, '2024-05-28')`);

    db.run(`INSERT INTO receipts (cid, receipt_name, cost, quantity, date) VALUES
        (1, 'TN-2420', 5000.00, 2, '2024-05-28'),
        (2, 'HP 88A', 4500.00, 3, '2024-05-28')`);
});

db.close();
