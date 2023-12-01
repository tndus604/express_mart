// App.js

/*
    SETUP
*/
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
PORT        = 9130;                 // Set a port number at the top so it's easy to change in the future

// Database
var db = require('./database/db-connector')

// app.js
const { engine } = require('express-handlebars');
const moment = require('moment');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({ // Create an instance of the handlebars engine to process templates
    extname: ".hbs",
    // helper function to convert time format as "MM/DD/YYYY"
    helpers: {
        formatDate: function (dateString) {   
            return moment(dateString).format('MM/DD/YYYY');
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

app.get('/products', function(req, res)                 // This is the basic syntax for what is called a 'route'
    {
       // Define our query
        let queryProductSelect = "SELECT productID, productName, unitPrice, categoryID FROM Products;";
        
        // Execute the query and render the template with the results
        db.pool.query(queryProductSelect, function(error, rows, fields) {
            if (error) {
                // Handle the error
                console.error(error);
                res.sendStatus(500); // Internal Server Error
            } else {
                // Render the 'products' template with the data retrieved from the database
                res.render('products', { data: rows });
            }
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
    let queryEmployeeSelect = "SELECT employeeID, firstName, lastName, email, position, customerID FROM Employees;";
    
    // Execute the query and render the template with the results
    db.pool.query(queryEmployeeSelect, function(error, rows, fields) {
        if (error) {
            // Handle the error
            console.error(error);
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
app.get('/itemsInTransaction', function(req, res)                 // This is the basic syntax for what is called a 'route'
{
    let query = `
        SELECT 
            ItemsInTransaction.itemID, 
            Transactions.transactionID AS transactionID, 
            Products.productName AS productName, 
            ItemsInTransaction.quantity, 
            ItemsInTransaction.amount
        FROM ItemsInTransaction
        LEFT JOIN Transactions ON ItemsInTransaction.transactionID = Transactions.transactionID
        LEFT JOIN Products ON ItemsInTransaction.productID = Products.productID
        ;`;
    // db.pool.query(query, function(error, rows, fields) {
    //     if (error) {
    //         console.error(error);
    //         res.sendStatus(500); // Internal Server Error
    //     } else {
    //             // Render the 'transactions' template with the data retrieved from the database
    //         res.render('itemsInTransaction', { data: rows });
    //         }
    //     });  
    
    let query2 = `SELECT * FROM Products`
    let query3 = `SELECT * FROM Transactions`  

    db.pool.query(query, function(error, rows, fields) {
        if (error) {
            console.error(error);
            res.sendStatus(500); // Internal Server Error
        } else {
            let ItemsInTransaction = rows;
            db.pool.query(query2, (error, rows, fields) => {
            
                // Save the Products
                let Products = rows;

                db.pool.query(query3, (error, rows, fields) => {
            
                    // Save the Transactions
                    let Transactions = rows;
                    return res.render('itemsInTransaction', {data: ItemsInTransaction, Products: Products, Transactions: Transactions});
                });
            });
        };
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
            res.status(400).send('Error adding new employee');
        } else {
            // If there is no error, redirect to the employees page to show the updated list
            res.redirect('/products');
        }
    });
});

// add customers
app.post('/add-customer', function(req, res) {
    let data = req.body;
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
    let customerID = data['employeeCustomerID'] ? parseInt(data['employeeCustomerID'], 10) : null;
    // Parameterized query to prevent SQL injection
    let queryEmployeesInsert = `INSERT INTO Employees (firstName, lastName, email, position, customerID) VALUES (?, ?, ?, ?, ?);`;
    let queryParams = [data['employeeFirstName'], data['employeeLastName'], data['employeeEmail'], data['employeePosition'], customerID];
    
    db.pool.query(queryEmployeesInsert, queryParams, function(error, results, fields) {
        if (error) {
            // Send 400 Bad Request if there is an error
            console.error(error);
            res.status(400).send('Error adding new employee');
        } else {
            // If there is no error, redirect to the employees page to show the updated list
            res.redirect('/employees');
        }
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

    let transactionID = data['transactionID'];
    let productName = data['productName'];
    let quantity = parseInt(data['quantity']);
    let amount = parseFloat(data['amount']);

    // Check if the transaction ID exists in the Transactions table
    db.pool.query('SELECT * FROM Transactions WHERE transactionID = ?', [transactionID], function(transactionCheckError, transactionCheckResults) {
        if (transactionCheckError) {
            console.error("Transaction check error:", transactionCheckError);
            return res.status(500).send('Error checking transaction ID');
        }

        if (transactionCheckResults.length === 0) {
            return res.status(400).send('Transaction ID not found');
        }

        // Check if the product ID exists in the Products table
        db.pool.query('SELECT * FROM Products WHERE productName = ?', [productName], function(productCheckError, productCheckResults) {
            if (productCheckError) {
                console.error("Product check error:", productCheckError);
                return res.status(500).send('Error checking product Name');
            }

            if (productCheckResults.length === 0) {
                return res.status(400).send('Product Name not found');
            }
            let productID = productCheckResults[0].productID;

            // Insert data into ItemsInTransaction
            let queryItemsInTransactionInsert = `INSERT INTO ItemsInTransaction (transactionID, productID, quantity, amount) VALUES (?, ?, ?, ?);`;
            let queryParams = [transactionID, productID, quantity, amount];

            db.pool.query(queryItemsInTransactionInsert, queryParams, function(insertError, insertResults) {
                if (insertError) {
                    console.error("Insert items in transaction error:", insertError);
                    return res.status(400).send('Error adding new item in transaction');
                }

                console.log("Item in transaction inserted successfully");
                res.redirect('/itemsInTransaction'); // Adjust the redirect as needed
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
    let customerID = data['updateEmployeeCustomerID'] ? parseInt(data['updateEmployeeCustomerID'], 10) : null;

    // Check if employeeID is not a number (NaN), which would indicate a parsing error
    if (isNaN(employeeID)) {
        return res.status(400).send('Invalid employee ID');
    }
    
    // customerID can be null if the input is empty, which is fine if the field is optional
    if (data['updateEmployeeCustomerID'] !== '' && isNaN(customerID)) {
        return res.status(400).send('Invalid customer ID');
    }

    let queryUpdateEmployees = `UPDATE Employees SET firstName = ?, lastName = ?, email = ?, position = ?, customerID = ? WHERE employeeID = ?;`;
    let queryParams = [
        data['updateEmployeeFirstName'],  
        data['updateEmployeeLastName'],  
        data['updateEmployeeEmail'],      
        data['updateEmployeePosition'],  
        customerID,
        employeeID
    ];

    // Log queryParams to check their values before the query
    console.log(queryParams);

    db.pool.query(queryUpdateEmployees, queryParams, function(error, results, fields) {
        if (error) {
            console.error('Database error:', error);
            res.status(400).send('Error updating employee information');
        } else {
            res.redirect('/employees');
        }
    });
});

// update transaction
app.post('/update-transaction', function(req, res) {
    let data = req.body;

    let transactionID = parseInt(data['updateTransactionID']);
    let purchaseDate = data['updatePurchaseDate'];
    let totalAmount = parseFloat(data['updateTotalAmount']);

    if (isNaN(transactionID)) {
        return res.status(400).send('Invalid transaction ID');
    }

    let queryUpdateTransaction = `UPDATE Transactions SET purchaseDate = ?, totalAmount = ? WHERE transactionID = ?;`;
    let queryParams = [purchaseDate, totalAmount, transactionID];

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
    let amount = parseFloat(data.updateAmount);

    if (isNaN(itemID)) {
        return res.status(400).send('Invalid item ID');
    }
    
    console.log("Received request to update item with ID:", itemID);
    console.log("Product Name to update:", productName);
    console.log("New Quantity:", quantity);
    console.log("New Amount:", amount);

    // First, get the productID for the given productName
    db.pool.query('SELECT productID FROM Products WHERE productName = ?', [productName], function(productCheckError, productCheckResults) {
        if (productCheckError) {
            console.error("Error checking product name:", productCheckError);
            return res.status(500).send('Server error occurred while checking product name.');
        }

        if (productCheckResults.length === 0) {
            console.log("Product name not found in the database:", productName);
            return res.status(400).send('Product name not found.');
        }

        let productID = productCheckResults[0].productID;

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