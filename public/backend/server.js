const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, '../public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shetty@14',   
    database: 'DB'
});

db.connect((err) => {
    if (err) throw err;
    console.log('✅ Connected to MySQL');
});




app.get('/', (req, res) => {
    res.render('index'); 
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});


app.get('/donors', (req, res) => {
    db.query('SELECT * FROM DONOR', (err, results) => {
        if (err) return res.status(500).send(err);
        res.render('donors', { donors: results });
    });
});

app.post('/donors/add', (req, res) => {
    const { donor_name, donor_age, donor_contact } = req.body;
    const donor_id = 'D' + Date.now(); // auto ID
    db.query(
        'INSERT INTO DONOR (DONOR_ID, DONOR_NAME, DONOR_AGE, DONOR_CONTACT) VALUES (?, ?, ?, ?)',
        [donor_id, donor_name, donor_age, donor_contact],
        (err) => {
            if (err) return res.status(500).send(err);
            res.redirect('/donors');
        }
    );
});

app.post('/donors/delete/:id', (req, res) => {
    db.query('DELETE FROM DONOR WHERE DONOR_ID = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/donors');
    });
});


app.get('/blood', (req, res) => {
    const getBloodQuery = `
        SELECT B.BLOOD_ID, B.BLOOD_GROUP, B.DONATION_DATE, 
               B.QUANTITY_OF_BLOOD, D.DONOR_ID, D.DONOR_NAME
        FROM BLOOD B
        LEFT JOIN DONOR D ON B.DONOR_ID = D.DONOR_ID
    `;

    const getDonorsQuery = `SELECT DONOR_ID, DONOR_NAME FROM DONOR`;

    db.query(getDonorsQuery, (err, donorResults) => {
        if (err) {
            console.error('Error fetching donors:', err);
            return res.status(500).send(err);
        }

        db.query(getBloodQuery, (err, bloodResults) => {
            if (err) {
                console.error('Error fetching blood data:', err);
                return res.status(500).send(err);
            }

            res.render('blood', {
                donors: donorResults || [],
                blood: bloodResults || []
            });
        });
    });
});


app.post('/blood/add', (req, res) => {
    const { blood_id, blood_group, donation_date, quantity_of_blood, donor_id } = req.body;

    db.query(
        `INSERT INTO BLOOD (BLOOD_ID, BLOOD_GROUP, DONATION_DATE, QUANTITY_OF_BLOOD, DONOR_ID)
         VALUES (?, ?, ?, ?, ?)`,
        [blood_id, blood_group, donation_date, quantity_of_blood, donor_id],
        (err) => {
            if (err) {
                console.error('Error inserting blood record:', err);
                return res.status(500).send(err);
            }
            res.redirect('/blood');
        }
    );
});


app.post('/blood/delete/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM BLOOD WHERE BLOOD_ID = ?', [id], (err) => {
        if (err) {
            console.error('Error deleting blood record:', err);
            return res.status(500).send(err);
        }
        res.redirect('/blood');
    });
});


app.get('/hospitals', (req, res) => {
    db.query('SELECT * FROM HOSPITAL', (err, results) => {
        if (err) return res.status(500).send(err);
        res.render('hospitals', { hospitals: results });
    });
});

app.post('/hospitals/add', (req, res) => {
    const { hospital_name, hospital_address } = req.body;
    const hospital_id = 'H' + Date.now();
    db.query(
        'INSERT INTO HOSPITAL (HOSPITAL_ID, HOSPITAL_NAME, HOSPITAL_ADDRESS) VALUES (?, ?, ?)',
        [hospital_id, hospital_name, hospital_address],
        (err) => {
            if (err) return res.status(500).send(err);
            res.redirect('/hospitals');
        }
    );
});

app.post('/hospitals/delete/:id', (req, res) => {
    db.query('DELETE FROM HOSPITAL WHERE HOSPITAL_ID = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/hospitals');
    });
});


app.get('/patients', (req, res) => {
    db.query('SELECT * FROM PATIENT', (err, results) => {
        if (err) return res.status(500).send(err);
        res.render('patients', { patients: results });
    });
});

app.post('/patients/add', (req, res) => {
    const { patient_name, patient_contact, patient_age, requested_blood_group, hospital_id } = req.body;
    const patient_id = 'P' + Date.now();
    db.query(
        'INSERT INTO PATIENT (PATIENT_ID, PATIENT_NAME, PATIENT_CONTACT, PATIENT_AGE, REQUESTED_BLOOD_GROUP, HOSPITAL_ID) VALUES (?, ?, ?, ?, ?, ?)',
        [patient_id, patient_name, patient_contact, patient_age, requested_blood_group, hospital_id],
        (err) => {
            if (err) return res.status(500).send(err);
            res.redirect('/patients');
        }
    );
});

app.post('/patients/delete/:id', (req, res) => {
    db.query('DELETE FROM PATIENT WHERE PATIENT_ID = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/patients');
    });
});


app.get('/bloodbank', (req, res) => {
    const getBloodBankQuery = `
        SELECT b.BLOOD_STOCK_ID, b.AVAILABLE_BLOOD_GROUP, b.QUANTITY, 
               b.EXPIRY_DATE, b.COLLECTION_DATE, 
               d.BLOOD_ID, d.BLOOD_GROUP, d.DONATION_DATE
        FROM BLOOD_BANK b
        JOIN BLOOD d ON b.BLOOD_ID = d.BLOOD_ID
    `;

    const getBloodQuery = `SELECT BLOOD_ID, BLOOD_GROUP FROM BLOOD`;

    db.query(getBloodQuery, (err, bloodResults) => {
        if (err) {
            console.error('Error fetching blood units:', err);
            return res.status(500).send(err);
        }

        db.query(getBloodBankQuery, (err, bankResults) => {
            if (err) {
                console.error('Error fetching blood bank data:', err);
                return res.status(500).send(err);
            }

            
            res.render('bloodbank', {
                blood: bloodResults || [],
                bloodbank: bankResults || []
            });
        });
    });
});
app.post('/bloodbank/add', (req, res) => {
    const { blood_id, quantity, collection_date, expiry_date } = req.body;
    const blood_stock_id = 'BS' + Date.now(); 

    if (!blood_id || !quantity || !expiry_date) {
        return res.status(400).send("Blood ID, Quantity, and Expiry Date are required.");
    }

    
    db.query('SELECT BLOOD_GROUP FROM BLOOD WHERE BLOOD_ID = ?', [blood_id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(400).send("Invalid BLOOD_ID");

        const blood_group = results[0].BLOOD_GROUP;

        
        const insertQuery = `
            INSERT INTO BLOOD_BANK 
            (BLOOD_STOCK_ID, BLOOD_ID, AVAILABLE_BLOOD_GROUP, QUANTITY, EXPIRY_DATE, COLLECTION_DATE)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(
            insertQuery,
            [blood_stock_id, blood_id, blood_group, quantity, expiry_date, collection_date],
            (err) => {
                if (err) return res.status(500).send(err);
                res.redirect('/bloodbank');
            }
        );
    });
});




app.get('/orders', (req, res) => {
    const ordersQuery = `
        SELECT o.BLOOD_STOCK_ID, o.HOSPITAL_ID, o.ORDER_DATE, o.ORDER_QUANTITY,
               h.HOSPITAL_NAME, b.AVAILABLE_BLOOD_GROUP
        FROM ORDERS o
        JOIN HOSPITAL h ON o.HOSPITAL_ID = h.HOSPITAL_ID
        JOIN BLOOD_BANK b ON o.BLOOD_STOCK_ID = b.BLOOD_STOCK_ID
    `;

    const bloodbankQuery = `SELECT BLOOD_STOCK_ID, AVAILABLE_BLOOD_GROUP FROM BLOOD_BANK`;
    const hospitalsQuery = `SELECT HOSPITAL_ID, HOSPITAL_NAME FROM HOSPITAL`;

    db.query(ordersQuery, (err, orders) => {
        if (err) return res.status(500).send(err);

        db.query(bloodbankQuery, (err, bloodbank) => {
            if (err) return res.status(500).send(err);

            db.query(hospitalsQuery, (err, hospitals) => {
                if (err) return res.status(500).send(err);

                
                res.render('orders', {
                    orders: orders || [],
                    bloodbank: bloodbank || [],
                    hospitals: hospitals || []
                });
            });
        });
    });
});


app.post('/orders/add', (req, res) => {
    const { blood_stock_id, hospital_id, order_date, order_quantity } = req.body;
    const insertQuery = `
        INSERT INTO ORDERS (BLOOD_STOCK_ID, HOSPITAL_ID, ORDER_DATE, ORDER_QUANTITY)
        VALUES (?, ?, ?, ?)
    `;
    db.query(insertQuery, [blood_stock_id, hospital_id, order_date, order_quantity], (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/orders');
    });
});


app.post('/orders/delete/:blood_stock_id/:hospital_id/:order_date', (req, res) => {
    const { blood_stock_id, hospital_id, order_date } = req.params;
    const deleteQuery = `
        DELETE FROM ORDERS
        WHERE BLOOD_STOCK_ID = ? AND HOSPITAL_ID = ? AND ORDER_DATE = ?
    `;
    db.query(deleteQuery, [blood_stock_id, hospital_id, order_date], (err) => {
        if (err) return res.status(500).send(err);
        res.redirect('/orders');
    });
});



app.listen(5000, () => {
    console.log('🚀 Server running at http://localhost:5000');
});