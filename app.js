//Authors: Su Youn Jeon and Xinrui Hou
// Citation for the following code is modified from the template Github repository for CS 340:
//https://github.com/osu-cs340-ecampus/nodejs-starter-app/tree/main/ (Code & comments were copied)
// Handle bar helper function is cited seperately from StackOverflow:
// https://stackoverflow.com/questions/15411833/using-moment-js-to-convert-date-to-string-mm-dd-yyyy 
// Date: Nov, 15th, 2023

// App.js

/*
    SETUP
*/
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
PORT        = 46686;                 // Set a port number at the top so it's easy to change in the future

// Database
var db = require('./database/db-connector')

// app.js
const { engine } = require('express-handlebars');
const moment = require('moment');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({ // Create an instance of the handlebars engine to process templates
    extname: ".hbs",
    // helper function to convert time format as "YYYY-MM-DD"
    helpers: {
        formatDate: function (dateString) {   
            return moment(dateString).format('YYYY-MM-DD');
        }
    }
})); // Create an instance of the handlebars engine to process templates


app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

/*
    ROUTES
*/
app.get('/', function(req, res)
    {
        res.render('index');                    
    });                                         

app.get('/index', function(req, res)
    {
        res.render('index');                
    });  

app.get('/categories', function(req, res)                 // This is the basic syntax for what is called a 'route'
    {
        // Define our query
        let queryCategorySelect = "SELECT categoryID, categoryName FROM Categories;";
        
        // Execute the query and render the template with the results
        db.pool.query(queryCategorySelect, function(error, rows, fields) {
            if (error) {
                // Handle the error
                console.error(error);
                res.sendStatus(500); // Internal Server Error
            } else {
                // Render the 'categories' template with the data retrieved from the database
                res.render('categories', { data: rows });
            }
        });                                                    
    });       

// show products (updated to respond Peer review 5 for projecting Category Name rather than ID)
app.get('/products', function(req, res)                 // This is the basic syntax for what is called a 'route'
    {
       // Define our query
        let queryProductSelect = `SELECT Products.productID, Products.productName, Products.unitPrice, 
                                        Categories.categoryName as categoryName 
                                        FROM Products 
                                        LEFT JOIN Categories 
                                        ON Products.categoryID = Categories.categoryID`;
        let query2 = `SELECT * FROM Categories`;

        // Execute the query and render the template with the results
        db.pool.query(queryProductSelect, function(error, rows, fields) {
            if (error) {
                console.error(error);
                return res.sendStatus(500); // Exit the function after sending a response
            }
            let Products = rows;
            db.pool.query(query2, (error, rows, fields) => {
                if (error) {
                    console.error(error);
                    return res.sendStatus(500); // Exit the function after sending a response
                }
                
                let Categories = rows;
                return res.render('products', {data: Products, Categories: Categories});
            });
        });
                                          
    });  

// show customers
app.get('/customers', function(req, res)  {               // This is the basic syntax for what is called a 'route'
    // Define our query
    let queryCustomerSelect = "SELECT customerID, customerType, firstName, lastName, email FROM Customers;";
    
    // Execute the query and render the template with the results
    db.pool.query(queryCustomerSelect, function(error, rows, fields) {
        if (error) {
            // Handle the error
            console.error(error);
            res.sendStatus(500); // Internal Server Error
        } else {
            // Render the 'customers' template with the data retrieved from the database
            res.render('customers', { data: rows });
        }
    });
});

// show employees
app.get('/employees', function(req, res) {
    // Define our query
    let queryEmployeeSelect = `
        SELECT 
            Employees.employeeID, 
            Employees.firstName, 
            Employees.lastName, 
            Employees.email, 
            Employees.position, 
            Customers.customerType
        FROM Employees
        LEFT JOIN Customers ON Employees.customerID = Customers.customerID;
    `;
    
    // Execute the query and render the template with the results
    db.pool.query(queryEmployeeSelect, function(error, rows, fields) {
        if (error) {
            // Handle the error
            console.error("Error fetching employees with customer type:", error);
            res.sendStatus(500); // Internal Server Error
        } else {
            // Render the 'employees' template with the data retrieved from the database
            res.render('employees', { data: rows });
        }
    });
});


// show transaction
app.get('/transactions', function(req, res) {
    // This query joins the Transactions table with Customers and Employees to get emails instead of IDs
    let query = `
        SELECT 
            Transactions.transactionID, 
            Customers.email AS customerEmail, 
            Employees.email AS employeeEmail, 
            Transactions.purchaseDate, 
            Transactions.totalAmount
        FROM Transactions
        LEFT JOIN Customers ON Transactions.customerID = Customers.customerID
        LEFT JOIN Employees ON Transactions.employeeID = Employees.employeeID;`;
    
    let query2 = `SELECT * FROM Customers`
    let query3 = `SELECT * FROM Employees`  

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.error(error);
            res.sendStatus(500); // Internal Server Error
        } else {
            let Transactions = rows;
            db.pool.query(query2, (error, rows, fields) => {
            
                // Save the Customers
                let Customers = rows;

                db.pool.query(query3, (error, rows, fields) => {
            
                    // Save the planets
                    let Employees = rows;
                    return res.render('transactions', {data: Transactions, Customers: Customers, Employees: Employees});
                });
            });
        };
    });
});

// show transaction detail
app.get('/itemsInTransaction', function(req, res) {
    // Query to fetch details of each item in a transaction
    let queryItemsInTransaction = `
    SELECT 
        ItemsInTransaction.itemID, 
        Transactions.transactionID, 
        Customers.email,
        Transactions.purchaseDate,
        Products.productName, 
        ItemsInTransaction.quantity, 
        ItemsInTransaction.amount
    FROM ItemsInTransaction
    LEFT JOIN Transactions ON ItemsInTransaction.transactionID = Transactions.transactionID
    LEFT JOIN Customers ON Transactions.customerID = Customers.customerID
    LEFT JOIN Products ON ItemsInTransaction.productID = Products.productID;

    `;

    // Query to fetch all products, transactions and customers
    let queryAllProducts = `SELECT * FROM Products`;
    let queryAllTransactions = `SELECT * FROM Transactions`;
    let queryAllCustomers = `SELECT * FROM Customers`;

    // Execute the first query
    db.pool.query(queryItemsInTransaction, function(error, itemsInTransactionResults) {
        if (error) {
            console.error("Error fetching items in transaction:", error);
            return res.sendStatus(500); // Internal Server Error
        }

        // Execute the second query
        db.pool.query(queryAllProducts, function(error, productsResults) {
            if (error) {
                console.error("Error fetching products:", error);
                return res.sendStatus(500); // Internal Server Error
            }

            // Execute the third query
            db.pool.query(queryAllTransactions, function(error, transactionsResults) {
                if (error) {
                    console.error("Error fetching transactions:", error);
                    return res.sendStatus(500); // Internal Server Error
                }

                // Execute the fourth query
                db.pool.query(queryAllCustomers, function(error, customersResults) {
                    if (error) {
                        console.error("Error fetching customers:", error);
                        return res.sendStatus(500);
                    }

                    // Render the page with the fetched data
                     res.render('itemsInTransaction', {
                        data: itemsInTransactionResults,
                        Products: productsResults,
                        Transactions: transactionsResults,
                        Customers: customersResults
                    });
                });
            });
        });
    });
});


/* =============================== POST ===============================*/

app.post('/add-category', function(req, res) {
    let data = req.body;
    
    // Ensure category name is present and not empty
    let categoryName = data.categoryName;

    if (!categoryName) {
        return res.status(400).send('Category name cannot be null or empty.');
    }

    // Parameterized query to prevent SQL injection
    let queryCategoriesInsert = 'INSERT INTO Categories (categoryName) VALUES (?);';
    let queryParams = [categoryName];
    
    db.pool.query(queryCategoriesInsert, queryParams, function(error, results, fields) {
        if (error) {
            // Send 400 Bad Request if there is an error
            console.error(error);
            res.status(400).send('Error adding new category');
        } else {
            // If there is no error, redirect to the categories page to show the updated list
            res.redirect('/categories');
        }
    });
});

// add products
app.post('/add-product', function(req, res) {
    let data = req.body;
    let categoryID = data['productCategoryID'] ? parseInt(data['productCategoryID'], 10) : null;
    // Parameterized query to prevent SQL injection
    let queryProductsInsert = `INSERT INTO Products (productName, unitPrice, categoryID) VALUES (?, ?, ?);`;
    let queryParams = [data['productProductName'], data['productUnitPrice'], categoryID];
    
    db.pool.query(queryProductsInsert, queryParams, function(error, results, fields) {
        if (error) {
            // Send 400 Bad Request if there is an error
            console.error(error);
            res.status(400).send('Error adding new product');    // an update based on peer review 5
        } else {
            // If there is no error, redirect to the employees page to show the updated list
            res.redirect('/products');
        }
    });
});

// add customers
app.post('/add-customer', function(req, res) {
    let data = req.body;

    console.log("Received data:", data); // Log received data

    console.log("Customer type is Guest:", data['customerType'] === 'Guest'); // Check customer type
    console.log("Email is not provided:", !data['customerEmail']); // Check if email is provided

    // An update: Check if customer is a guest and didn't provide an email
    if (data['customerType'] === 'Guest' && data['customerEmail'] === 'guest@example.com') {
        data['customerEmail'] = `guest_${Date.now()}@example.com`;
        console.log("Generated Guest Email:", data['customerEmail']);
    }

    // Parameterized query to prevent SQL injection
    let queryCustomersInsert = `INSERT INTO Customers (customerType, firstName, lastName, email) VALUES (?, ?, ?, ?);`;
    let queryParams = [data['customerType'], data['customerFirstName'], data['customerLastName'], data['customerEmail']];
    
    db.pool.query(queryCustomersInsert, queryParams, function(error, results, fields) {
        if (error) {
            // Send 400 Bad Request if there is an error
            console.error(error);
            res.status(400).send('Error adding new customer');
        } else {
            // If there is no error, redirect to the customers page to show the updated list
            res.redirect('/customers');
        }
    });
});

// add employees
app.post('/add-employee', function(req, res) {
    let data = req.body;
    let customerType = data['employeeCustomerType'];

    db.pool.query('SELECT customerID FROM Customers WHERE customerType = ?', [customerType], function(findError, findResults) {
        if (findError || findResults.length === 0) {
            console.error("Error finding customerID:", findError);
            return res.status(400).send('Customer type not found');
        }

        let customerID = findResults[0].customerID;

        let queryEmployeesInsert = `INSERT INTO Employees (firstName, lastName, email, position, customerID) VALUES (?, ?, ?, ?, ?);`;
        let queryParams = [data['employeeFirstName'], data['employeeLastName'], data['employeeEmail'], data['employeePosition'], customerID];
        
        db.pool.query(queryEmployeesInsert, queryParams, function(error, results, fields) {
            if (error) {
                console.error(error);
                res.status(400).send('Error adding new employee');
            } else {
                res.redirect('/employees');
            }
        });
    });
});


// add transactions
app.post('/add-transaction', function(req, res) {
    let data = req.body;
    
    console.log("Received transaction data:", data);

    let customerEmail = data['customerEmail'];
    let employeeEmail = data['employeeEmail'];
    let purchaseDate = data['purchaseDate'];
    let totalAmount = parseFloat(data['totalAmount']);

    // Check if the customer email exists in the Customers table
    db.pool.query('SELECT * FROM Customers WHERE email = ?', [customerEmail], function(customerCheckError, customerCheckResults) {
        if (customerCheckError) {
            console.error("Customer check error:", customerCheckError);
            return res.status(500).send('Error checking customer email');
        }

        console.log("Customer check results:", customerCheckResults);

        if (customerCheckResults.length === 0) {
            return res.status(400).send('Customer email not found');
        }

        let customerID = customerCheckResults[0].customerID;

        // Check if the employee email exists in the Employees table
        db.pool.query('SELECT * FROM Employees WHERE email = ?', [employeeEmail], function(employeeCheckError, employeeCheckResults) {
            if (employeeCheckError) {
                console.error("Employee check error:", employeeCheckError);
                return res.status(500).send('Error checking employee email');
            }

            console.log("Employee check results:", employeeCheckResults);

            if (employeeCheckResults.length === 0) {
                return res.status(400).send('Employee email not found');
            }

            let employeeID = employeeCheckResults[0].employeeID;

            // Insert data into Transactions
            let queryTransactionsInsert = `INSERT INTO Transactions (customerID, employeeID, purchaseDate, totalAmount) VALUES (?, ?, ?, ?);`;
            let queryParams = [customerID, employeeID, purchaseDate, totalAmount];

            db.pool.query(queryTransactionsInsert, queryParams, function(insertError, insertResults) {
                if (insertError) {
                    console.error("Insert transaction error:", insertError);
                    return res.status(400).send('Error adding new transaction');
                }

                console.log("Transaction inserted successfully");
                res.redirect('/transactions');
            });
        });
    });
});

// add transaction details
app.post('/add-itemsInTransaction', function(req, res) {
    let data = req.body;

    console.log("Received items in transaction data:", data);

    let customerEmail = data['customerEmail'];
    let purchaseDate = data['purchaseDate'];
    let productName = data['productName'];
    let quantity = parseInt(data['quantity']);
    //let amount = parseFloat(data['amount']);

    console.log("Searching for Transaction with Email:", customerEmail, "and Date:", purchaseDate);
    // Find the transactionID based on customerEmail and purchaseDate
    db.pool.query(`SELECT transactionID FROM Transactions 
                        INNER JOIN Customers 
                        ON Transactions.customerID = Customers.customerID 
                        WHERE Customers.email = ? 
                        AND Transactions.purchaseDate = ?`, 
                [customerEmail, purchaseDate], function(transCheckError, transCheckResults) {

        console.log("Query Results:", transCheckResults);
        if (transCheckError || transCheckResults.length === 0) {
            console.error("Error finding transaction:", transCheckError);
            return res.status(400).send('Transaction not found');
        }

        let transactionID = transCheckResults[0].transactionID;

        // Fetch product details
        db.pool.query('SELECT * FROM Products WHERE productName = ?', [productName], function(productCheckError, productCheckResults) {
            if (productCheckError || productCheckResults.length === 0) {
                console.error("Product check error:", productCheckError);
                return res.status(400).send('Product not found');
            }

            let productID = productCheckResults[0].productID;
            let unitPrice = productCheckResults[0].unitPrice;
            let amount = unitPrice * quantity;

            if (isNaN(amount)) {
                console.error("Calculated amount is NaN. Unit Price:", unitPrice, "Quantity:", quantity);
                return res.status(400).send('Error calculating amount');
            }

            // Insert data into ItemsInTransaction
            let queryItemsInTransactionInsert = `INSERT INTO ItemsInTransaction (transactionID, productID, quantity, amount) VALUES (?, ?, ?, ?);`;
            let queryParams = [transactionID, productID, quantity, amount];

            db.pool.query(queryItemsInTransactionInsert, queryParams, function(insertError, insertResults) {
                if (insertError) {
                    console.error("Insert items in transaction error:", insertError);
                    return res.status(400).send('Error adding new item in transaction');
                }

                res.redirect('/itemsInTransaction');
            });
        });
    });
});


/* ===============================  UPDATE ===============================*/
// update category
app.post('/update-category', function(req,res,next){
    let data = req.body;
    console.log('Request Body:', data);

    let categoryID = parseInt(data['updateCategoryID'], 10);  

    // Check if categoryID is not a number (NaN), which would indicate a parsing error
    if (isNaN(categoryID)) {
        return res.status(400).send('Invalid category ID');
    }
    
    let queryUpdateCategories = `UPDATE Categories SET categoryName = ? WHERE categoryID = ?;`;
    let queryParams = [
        data['updateCategoryName'],      
        categoryID
    ];

    // Log queryParams to check their values before the query
    console.log(queryParams);

    db.pool.query(queryUpdateCategories, queryParams, function(error, results, fields) {
        if (error) {
            console.error('Database error:', error);
            res.status(400).send('Error updating category information');
        } else {
            res.redirect('/categories');
        }
    });
});

// update product
app.post('/update-product', function(req, res) {
    let data = req.body;

    let productID = parseInt(data['updateProductID'], 10);  
    let categoryID = data['updateProductCategoryID'] ? parseInt(data['updateProductCategoryID'], 10) : null;

    // Check if productID is not a number (NaN), which would indicate a parsing error
    if (isNaN(productID)) {
        return res.status(400).send('Invalid product ID');
    }
    
    // productID can be null if the input is empty, which is fine if the field is optional
    if (data['updateProductCategoryID'] !== '' && isNaN(categoryID)) {
        return res.status(400).send('Invalid category ID');
    }

    let queryUpdateProducts = `UPDATE Products SET productName = ?, unitPrice = ?, categoryID = ? WHERE productID = ?;`;
    let queryParams = [
        data['updateProductProductName'],  
        data['updateProductUnitPrice'],       
        categoryID,
        productID
    ];

    // Log queryParams to check their values before the query
    console.log(queryParams);

    db.pool.query(queryUpdateProducts, queryParams, function(error, results, fields) {
        if (error) {
            console.error('Database error:', error);
            res.status(400).send('Error updating employee information');
        } else {
            res.redirect('/products');
        }
    });
});

// update customer
app.post('/update-customer', function(req, res) {
    let data = req.body;

    let customerID = parseInt(data['updateCustomerID'], 10);  

    // Check if customerID is not a number (NaN), which would indicate a parsing error
    if (isNaN(customerID)) {
        return res.status(400).send('Invalid customer ID');
    }

    let queryUpdateCustomers = `UPDATE Customers SET customerType = ?, firstName = ?, lastName = ?, email = ? WHERE customerID = ?;`;
    let queryParams = [
        data['updateCustomerType'],  
        data['updateCustomerFirstName'],  
        data['updateCustomerLastName'],  
        data['updateCustomerEmail'],      
        customerID
    ];

    // Log queryParams to check their values before the query
    console.log(queryParams);

    db.pool.query(queryUpdateCustomers, queryParams, function(error, results, fields) {
        if (error) {
            console.error('Database error:', error);
            res.status(400).send('Error updating customer information');
        } else {
            res.redirect('/customers');
        }
    });
});

// update employee
app.post('/update-employee', function(req, res) {
    let data = req.body;
    let employeeID = parseInt(data['updateEmployeeID'], 10);

    if (isNaN(employeeID)) {
        return res.status(400).send('Invalid employee ID');
    }

    // Update employee details first
    let queryUpdateEmployee = `UPDATE Employees SET firstName = ?, lastName = ?, email = ?, position = ? WHERE employeeID = ?;`;
    let employeeParams = [data['updateEmployeeFirstName'], data['updateEmployeeLastName'], data['updateEmployeeEmail'], data['updateEmployeePosition'], employeeID];

    db.pool.query(queryUpdateEmployee, employeeParams, function(employeeError, employeeResults) {
        if (employeeError) {
            console.error('Error updating employee:', employeeError);
            return res.status(400).send('Error updating employee information');
        }

        // Then update customer type based on the associated customerID
        let queryUpdateCustomerType = `UPDATE Customers SET customerType = ? WHERE customerID = (SELECT customerID FROM Employees WHERE employeeID = ?);`;
        let customerParams = [data['updateEmployeeCustomerType'], employeeID];

        db.pool.query(queryUpdateCustomerType, customerParams, function(customerError, customerResults) {
            if (customerError) {
                console.error('Error updating customer type:', customerError);
                return res.status(400).send('Error updating customer type');
            }

            res.redirect('/employees');
        });
    });
});


// update transaction
app.post('/update-transaction', function(req, res) {
    let data = req.body;

    let transactionID = parseInt(data['updateTransactionID']);
    let employeeID = parseInt(data['updateEmployeeID']);
    let purchaseDate = data['updatePurchaseDate'];
    let totalAmount = parseFloat(data['updateTotalAmount']);

    if (isNaN(transactionID)) {
        return res.status(400).send('Invalid transaction ID');
    }

    let queryUpdateTransaction = `UPDATE Transactions SET employeeID = ?, purchaseDate = ?, totalAmount = ? WHERE transactionID = ?;`;
    let queryParams = [employeeID, purchaseDate, totalAmount, transactionID];

    db.pool.query(queryUpdateTransaction, queryParams, function(updateError, updateResults) {
        if (updateError) {
            console.error("Update transaction error:", updateError);
            return res.status(400).send('Error updating transaction');
        }

        console.log("Transaction updated successfully");
        res.redirect('/transactions');
    });

});

// update transaction detail
app.post('/update-transactionDetail', function (req, res, next) {
    let data = req.body;

    let itemID = parseInt(data.updateItemID);
    let productName = data.updateProductName; 
    let quantity = parseInt(data.updateQuantity);
    //let amount = parseFloat(data.updateAmount);

    if (isNaN(itemID)) {
        return res.status(400).send('Invalid item ID');
    }
    
    console.log("Received request to update item with ID:", itemID);
    console.log("Product Name to update:", `"${productName}"`);
    console.log("New Quantity:", quantity);

    // First, get the productID for the given productName
    db.pool.query('SELECT productID, unitPrice FROM Products WHERE productName = ?', [productName], function(productCheckError, productCheckResults) {
        if (productCheckError) {
            console.error("Error checking product name:", productCheckError);
            return res.status(500).send('Server error occurred while checking product name.');
        }

        if (productCheckResults.length === 0) {
            console.log("Product name not found in the database:", productName);
            return res.status(400).send('Product name not found.');
        }

        let productID = productCheckResults[0].productID;

        // Calculate amount based on user update
        let unitPrice = productCheckResults[0].unitPrice;
        
        if (typeof unitPrice !== 'number') {
            console.error("Unit price is not a number for product:", productName, "Unit Price:", unitPrice);
            return res.status(400).send('Unit price not found for product.');
        }

        let amount = unitPrice * quantity;

        if (isNaN(amount)) {
            console.error("Calculated amount is NaN. Unit Price:", unitPrice, "Quantity:", quantity);
            return res.status(400).send('Error calculating amount');
        }
        console.log("Calculated Amount:", amount);

        // Now update the ItemsInTransaction with the obtained productID
        let queryUpdateItemsInTransaction = `
            UPDATE ItemsInTransaction 
            SET productID = ?, quantity = ?, amount = ? 
            WHERE itemID = ?;
        `;
        let queryParams = [productID, quantity, amount, itemID];

        db.pool.query(queryUpdateItemsInTransaction, queryParams, function (updateError, updateResults) {
            if (updateError) {
                console.error("Error updating item in transaction:", updateError);
                return res.status(400).send('Server error occurred while updating item in transaction.');
            }

            console.log("Item in transaction updated successfully:", itemID);
            res.redirect('/itemsInTransaction'); // Redirect as appropriate for your app
        });
    });
});


/* =============================== DELETE ===============================*/

app.delete('/delete-category/', function(req,res,next){
    let data = req.body;
    let categoryID = parseInt(data.categoryID); 
    let queryDeleteCategory = `DELETE FROM Categories WHERE categoryID = ?`;

    // Run the query
    db.pool.query(queryDeleteCategory, [categoryID], function(error, results, fields){
        if (error) {
            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204); 
        }
    });
});

// delete product
app.delete('/delete-product', function(req, res, next){
    let data = req.body;
    let productID = parseInt(data.productID); 
    let queryDeleteProduct = `DELETE FROM Products WHERE productID = ?`;

    // Run the query
    db.pool.query(queryDeleteProduct, [productID], function(error, results, fields){
        if (error) {
            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204); 
        }
    });
});

// delete customer
app.delete('/delete-customer', function(req, res, next){
    let data = req.body;
    let customerID = parseInt(data.customerID); 
    let queryDeleteCustomer = `DELETE FROM Customers WHERE customerID = ?`;

    // Run the query
    db.pool.query(queryDeleteCustomer, [customerID], function(error, results, fields){
        if (error) {
            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204); 
        }
    });
});

// delete employee
app.delete('/delete-employee', function(req, res, next){
    let data = req.body;
    let employeeID = parseInt(data.employeeID); 
    let queryDeleteEmployee = `DELETE FROM Employees WHERE employeeID = ?`;

    // Run the query
    db.pool.query(queryDeleteEmployee, [employeeID], function(error, results, fields){
        if (error) {
            // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204); 
        }
    });
});

// delete transaction
app.delete('/delete-transaction', function(req, res, next){
    let data = req.body;
    let transactionID = parseInt(data.transactionID); 
    let queryDeleteTransaction = `DELETE FROM Transactions WHERE transactionID = ?`;

    // Run the query
    db.pool.query(queryDeleteTransaction, [transactionID], function(error, results, fields){
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204); 
        }
    });
});

// delete transaction detail
app.delete('/delete-transactionDetail', function(req, res, next){
    let data = req.body;
    let itemID = parseInt(data.itemID); 
    let queryDeleteItemsInTransaction = `DELETE FROM ItemsInTransaction WHERE itemID = ?`;

    // Run the query
    db.pool.query(queryDeleteItemsInTransaction, [itemID], function(error, results, fields){
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204); 
        }
    });
});


/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});