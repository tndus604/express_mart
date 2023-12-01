document.addEventListener('DOMContentLoaded', () => {
    // INSERT
    const insertTransactionBtn = document.getElementById('insert_transaction_btn');
    const insertTransactionCancel = document.getElementById('insert_transaction_cancel');
    const insertTransactionForm = document.getElementById('insert_transaction_form');
  
    insertTransactionBtn.addEventListener('click', () => {
      insertTransactionForm.style.display = 'block';
    });
  
    insertTransactionCancel.addEventListener('click', () => {
      insertTransactionForm.style.display = 'none';
    });
  
    // UPDATE
    const updateTransactionBtns = document.querySelectorAll('.edit_transaction_icon'); 
    const updateTransactionCancel = document.getElementById('update_transaction_cancel');
    const updateTransactionForm = document.getElementById('update_transaction_form');
  
    updateTransactionBtns.forEach((btn, index) => {
      btn.addEventListener('click', (event) => {
        //Get the data and populate the form for the table
        let rowToUpdate = event.target.closest('tr');
        document.getElementById("updateTransactionID").value = rowToUpdate.getAttribute("data-value") 
        document.getElementById("updateCustomerEmail").value = rowToUpdate.getAttribute("data-customer-email") 
        document.getElementById("updateEmployeeEmail").value = rowToUpdate.getAttribute("data-employee-email")
        document.getElementById("updatePurchaseDate").value = rowToUpdate.getAttribute("data-purchase-date") 
        document.getElementById("updateTotalAmount").value = rowToUpdate.getAttribute("data-total-amount") 
        
        updateTransactionForm.style.display = 'block';
      });
    });
  
    updateTransactionCancel.addEventListener('click', () => {
      updateTransactionForm.style.display = 'none';
    });
  
    // DELETE
    const deleteTransactionBtns = document.querySelectorAll('.delete_transaction_icon'); 
  
    deleteTransactionBtns.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const isConfirmed = window.confirm(
          'Click the button to confirm this delete, all transaction details will also be deleted.'
        );
  
        if (isConfirmed) {
          const rowToDelete = event.target.closest('tr');
          let transactionToDelete = rowToDelete.getAttribute("data-value")
          deleteTransaction(transactionToDelete)
        }
      });
    });
  });
  
  //Use AJAX to delete
  function deleteTransaction(transactionID) {
    let data = {
        transactionID: transactionID
    };
  
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-transaction", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {
            deleteRow(transactionID);
        } else if (xhttp.readyState == 4) {
            console.log("Error deleting transaction.");
        }
    };
    xhttp.send(JSON.stringify(data));
}

  
  // update the HTML for the row removal
  function deleteRow(transactionID){
    let table = document.getElementById("transactions-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       //iterate through rows
       if (table.rows[i].getAttribute("data-value") == transactionID) {
            table.deleteRow(i);
            break;
       }
    }
  }
  