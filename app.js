// App.js

/*
    SETUP
*/
var express = require('express');   // We are using the express library for the web server
var app     = express();            // We need to instantiate an express object to interact with the server in our code
PORT        = 9133;                 // Set a port number at the top so it's easy to change in the future

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

// Database
var db = require('./database/db-connector')

const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.


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

app.get('/transactions', function(req, res)                 // This is the basic syntax for what is called a 'route'
    {
        res.render('transactions')                                                  
    }); 

app.get('/itemsInTransaction', function(req, res)                 // This is the basic syntax for what is called a 'route'
    {
        res.render('itemsInTransaction')                                                  
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


/*
    LISTENER
*/
app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});