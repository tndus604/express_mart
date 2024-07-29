/*------------------------------
    Team 110
    Su youn Jeon, Xinrui Hou
    Citation for the following DDL:
    Date: 11/01/2023
    Modified and customized based on activity-m2.sql from Activity 1
    Source URL: https://canvas.oregonstate.edu/courses/1933532/pages/activity-1-creating-a-customer-object-table

------------------------------*/

-- Drops all tables if it exists
set foreign_key_checks=0;
set autocommit=0;
drop table if exists Categories, Products, Customers, Employees, Transactions, ItemsInTransaction;

-- Create Categories table
CREATE OR REPLACE TABLE Categories (
    categoryID INT AUTO_INCREMENT NOT NULL,
    categoryName VARCHAR(255) NOT NULL,
    PRIMARY KEY (categoryID)
);

-- Create Products table
CREATE OR REPLACE TABLE Products (
    productID INT AUTO_INCREMENT,
    productName VARCHAR(255) NOT NULL,
    unitPrice decimal(10, 2) NOT NULL,
    categoryID INT NOT NULL,
    PRIMARY KEY (productID),
    FOREIGN KEY (categoryID) REFERENCES Categories(categoryID)
);


-- Create Customers table
CREATE OR REPLACE TABLE Customers (
    customerID INT AUTO_INCREMENT,
    customerType VARCHAR(255) NOT NULL CHECK (customerType IN ("Registered", "Guest", "Employee")),
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    PRIMARY KEY (customerID)
);

-- Create Employees table
create table Employees (
	employeeID int auto_increment unique NOT NULL,
    customerID int,
	firstName varchar(255) NOT NULL,
	lastName varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
	position varchar(255) NOT NULL,
	primary key (employeeID),
    FOREIGN KEY(customerID) REFERENCES Customers(customerID)
);

-- Create Transactions table
create table Transactions (
	transactionID int auto_increment unique NOT NULL,
	customerID int NULL,
	employeeID int NULL,
	purchaseDate date NOT NULL,
	totalAmount decimal(10, 2) NOT NULL,
	primary key (transactionID),
    FOREIGN KEY(customerID) REFERENCES Customers(customerID),
    FOREIGN KEY(employeeID) REFERENCES Employees(employeeID)
);

-- Create ItemsInTransaction table 
  -- Intersection table to facilitate M:M between ordersTransactions and Products
create table ItemsInTransaction (
	itemID int auto_increment unique not null,
	transactionID int not null,
    productID int not null,
    quantity int not null,
    amount decimal(10, 2) not null ,
	foreign key (transactionID) references Transactions(transactionID) on delete CASCADE,
	foreign key (productID) references Products(productID) on delete set null
);


-- Insert sample data

-- Insert data to Categories entity
INSERT INTO Categories (categoryName)
VALUES ("Produce"),
       ("Dairy and Eggs"),
       ("Snacks");

-- Insert data to Products entity
INSERT INTO Products (productName, categoryID, unitPrice)
VALUES ("Apple", 1, 0.70),
       ("Dragonfruit", 1, 2.50),
       ("Potato", 1, 1.20),
       ("Egg", 2, 3.00),
       ("Milk", 2, 3.50),
       ("Cheese", 2, 1.00),
       ("Pretzel", 3, 1.60),
       ("Popcorn", 3, 2.30),
       ("Takis", 3, 2.50);

-- Insert data to Customers entity
INSERT INTO Customers (firstName, lastName, email, customerType)
VALUES ('Lily', 'Fox', 'lfox@gmail.com', 'Registered'),
       ('Mary', 'Lamb', 'mlamb@gmail.com', 'Registered'),
       ('George', 'Lee', 'glee@gmail.com', 'Registered'),
       (NULL, NULL, NULL, "Guest"),
       ("Jason", "Wayne", "jwayne@gmail.com", "Employee"),
       ("Larry", "Mark", "lmark@gmail.com", "Employee"),
       ("Ashley", "Tang","atang@gmail.com","Employee");

-- Insert data to Employees entity
INSERT INTO Employees (firstName, lastName, email, position, customerID)
VALUES ("Jason", "Wayne", "jwayne@gmail.com", "Store Manager", 5),
       ("Larry", "Mark", "lmark@gmail.com", "Cashier", 6),
       ("Ashley", "Tang","atang@gmail.com","Cashier", 7),
       ("Mark", "Collins","mcollins@gmail.com","Grocery clerk", NULL);

-- Insert data to Transactions entity
INSERT INTO Transactions (customerID, employeeID, purchaseDate, totalAmount)
VALUES ((SELECT customerID FROM Customers WHERE firstName = "Lily" AND lastName = "Fox"), 
        (SELECT employeeID FROM Employees WHERE firstName = "Ashley" AND lastName = "Tang"), 
        "2023-10-01",
        "4.7"),
       ((SELECT customerID FROM Customers WHERE firstName = "Mary" AND lastName = "Lamb"), 
        (SELECT employeeID FROM Employees WHERE firstName = "Ashley" AND lastName = "Tang"), 
        "2023-10-02",
        "3"),
        ((SELECT customerID FROM Customers WHERE firstName = "Lily" AND lastName = "Fox"), 
        (SELECT employeeID FROM Employees WHERE firstName = "Larry" AND lastName = "Mark"), 
        "2023-10-03",
        "5"),
        ((SELECT customerID FROM Customers WHERE firstName = "George" AND lastName = "Lee"), 
        (SELECT employeeID FROM Employees WHERE firstName = "Larry" AND lastName = "Mark"), 
        "2023-10-04",
        "41");

-- Insert data to ItemsInTransaction entity
INSERT INTO ItemsInTransaction (transactionID, productID, quantity, amount)
VALUES ((SELECT transactionID FROM Transactions WHERE transactionID = "1"), 
        (SELECT productID FROM Products WHERE productID = "1"), 
        "5",
        "3.5"),
       ((SELECT transactionID FROM Transactions WHERE transactionID = "1"), 
        (SELECT productID FROM Products WHERE productID = "4"), 
        "3",
        "1.2"),
        ((SELECT transactionID FROM Transactions WHERE transactionID = "2"), 
        (SELECT productID FROM Products WHERE productID = "3"), 
        "1",
        "1.2"),
        ((SELECT transactionID FROM Transactions WHERE transactionID = "2"), 
        (SELECT productID FROM Products WHERE productID = "4"), 
        "6",
        "1.8"),
        ((SELECT transactionID FROM Transactions WHERE transactionID = "3"), 
        (SELECT productID FROM Products WHERE productID = "9"), 
        "2",
        "5"),
        ((SELECT transactionID FROM Transactions WHERE transactionID = "4"), 
        (SELECT productID FROM Products WHERE productID = "7"), 
        "10",
        "16"),
        ((SELECT transactionID FROM Transactions WHERE transactionID = "4"), 
        (SELECT productID FROM Products WHERE productID = "9"), 
        "10",
        "25");

-- enable foreign key checks and commit
SET FOREIGN_KEY_CHECKS=1;
COMMIT;