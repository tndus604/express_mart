-- These are some Database Manipulation queries for a partially implemented Project Website 
-- using the bsg database.
-- Your submission should contain ALL the queries required to implement ALL the
-- functionalities listed in the Project Specs.


--------------------SELECT - Browse queries---------------------------

-- select all categories
SELECT categoryID, categoryName FROM Categories;

-- select all products
SELECT Products.productID, Products.productName, Products.unitPrice, Categories.categoryID, Categories.categoryName 
FROM Products
INNER JOIN Categories ON Products.categoryID = Categories.categoryID;

-- select all customers
SELECT customerID, firstName, lastName, email, customerType FROM Customers;

-- select all employees
SELECT employeeID, firstName, lastName, email, position FROM Employees;

-- select all transactions
SELECT Transactions.transactionID, Customers.customerID, Employees.employeeID, Transactions.date, Transactions.totalPrice
FROM Transactions
INNER JOIN Customers ON Transactions.customerID = Customers.customerID
INNER JOIN Employees ON Transactions.employeeID = Employees.employeeID;

-- select all itemsInTransaction
SELECT ItemsInTransaction.itemID, Transactions.transactionID, Products.productID, ItemsInTransaction.quantity, ItemsInTransaction.amount
FROM ItemsInTransaction
INNER JOIN Transactions ON ItemsInTransaction.transactionID = Transactions.transactionID
INNER JOIN Products ON ItemsInTransaction.productID = Products.productID;



--------------------INSERT queries----------------------------------------

-- insert a new category
INSERT INTO Categories (categoryName)
VALUES (:categoryNameInput);

-- insert a new product
INSERT INTO Products (productName, unitPrice, categoryID) VALUES (:productNameInput, :unitPriceInput, :categoryIDInput);

-- insert a new customer
INSERT INTO Customers (customerType, firstName, lastName, email) VALUES (:customerTypeInput, :firstNameInput, :lastNameInput, :emailInput);

-- insert a new employee
INSERT INTO Employees (firstName, lastName, email, position, customerID)
VALUES (:firstNameInput, :lastNameInput, :emailInput, :positionInput, :customerID);

-- insert a new transaction
INSERT INTO Transactions (customerID, employeeID, date, totalPrice) VALUES (:customerIDInput, :employeeIDInput, :dateInput, :totalPriceInput);

-- insert a new item in transaction.
INSERT INTO ItemsInTransaction (transactionID, productID, quantity, amount) VALUES (:transactionIDInput, :productIDInput, :quantityInput, :amountInput);




------------------------UPDATE queries-------------------------------------------
-- update an exsisiting category
UPDATE Categories SET categoryName = :categoryNameInput WHERE categoryID = :categoryID_update;

-- update an exsisiting product
UPDATE Products SET productName = :productNameInput, unitPrice = :unitPriceInput, categoryID = :categoryIDInput WHERE productID = :productID_update;

-- update an exsisiting customer
UPDATE Customers SET firstName = :firstNameInput, lastName = :lastNameInput, email = :emailInput, customerType = :customerTypeInput WHERE customerID = :customerID;

-- update an exsisiting employee
UPDATE Employees SET firstName = :firstNameInput, lastName = :lastNameInput, email = :emailInput, position = :positionInput, customerID = :customerID WHERE employeeID = :employeeID_update;

-- update an exsisiting transaction
UPDATE Transactions SET customerID = :customerIDInput, employeeID = :employeeIDInput, transactionDate = :transactionDateInput, totalPrice = :totalPriceInput WHERE transactionID = :transactionID_update;

-- update an exsisiting item in transaction
UPDATE itemsInTransaction SET transactionID = :transactionID, productID = :productID, quantity = :quantityInput, amount = :amountInput WHERE itemID : itemID_update;


------------------------DELETE queries-------------------------------------------
-- delete a category
DELETE FROM Categories WHERE categoryID= :categoryID_selected;

-- delete a product
DELETE FROM Products WHERE productID= :productID_selected;

-- delete a customer
DELETE FROM Customers WHERE customerID = :customerID_selected;

-- delete an employee
DELETE FROM Employees WHERE employeeID= :employeeID_selected;

-- delete a transaction invoice (M:M)
DELETE FROM Transactions WHERE transactionID = :transactionID_selected AND customerID = :customerID_selected

-- delete an iten in the transaction invoice (M:M)
DELETE FROM ItemsInTransaction WHERE itemID = :itemID_selected, transactionID = :transactionID_selected AND productID = :productID_selected