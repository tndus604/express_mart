document.addEventListener('DOMContentLoaded', () => {
    // INSERT
    const insertCustomerBtn = document.getElementById('insert_customer_btn');
    const insertCustomerCancel = document.getElementById('insert_customer_cancel');
    const insertCustomerForm = document.getElementById('insert_customer_form');
  
    insertCustomerBtn.addEventListener('click', () => {
      insertCustomerForm.style.display = 'block';
    });
  
    insertCustomerCancel.addEventListener('click', () => {
      insertCustomerForm.style.display = 'none';
    });
  
    // UPDATE
    const updateCustomerBtns = document.querySelectorAll('.edit_icon'); 
    const updateCustomerCancel = document.getElementById('update_customer_cancel');
    const updateCustomerForm = document.getElementById('update_customer_form');
  
    updateCustomerBtns.forEach((btn, index) => {
      btn.addEventListener('click', (event) => {
        //Get the data and populate the form for the table
        let rowToUpdate = event.target.closest('tr');
        document.getElementById("updateCustomerID").value = rowToUpdate.getAttribute("data-value") 
        document.getElementById("updateCustomerType").value = rowToUpdate.getAttribute("data-customer-type") 
        document.getElementById("updateCustomerFirstName").value = rowToUpdate.getAttribute("data-first-name") 
        document.getElementById("updateCustomerLastName").value = rowToUpdate.getAttribute("data-last-name")
        document.getElementById("updateCustomerEmail").value = rowToUpdate.getAttribute("data-email") 
        updateCustomerForm.style.display = 'block';
      });
    });
  
    updateCustomerCancel.addEventListener('click', () => {
      updateCustomerForm.style.display = 'none';
    });
  
    // DELETE
    const deleteCustomerBtns = document.querySelectorAll('.delete_customer_icon'); 
  
    deleteCustomerBtns.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const isConfirmed = window.confirm(
          'Click the button to confirm this delete'
        );
  
        if (isConfirmed) {
          const rowToDelete = event.target.closest('tr');
          let customerToDelete = rowToDelete.getAttribute("data-value")
          deletePerson(customerToDelete)
        }
      });
    });
  });
  
  //Use AJAX to delete
  function deletePerson(customerID) {
    let data = {
        customerID: customerID
    };
  
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-customer", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {
            deleteRow(customerID);
        } else if (xhttp.readyState == 4) {
            console.log("Error deleting customer.");
        }
    };
    xhttp.send(JSON.stringify(data));
}

  
  // update the HTML for the row removal
  function deleteRow(customerID){
    let table = document.getElementById("customers-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       //iterate through rows
       if (table.rows[i].getAttribute("data-value") == customerID) {
            table.deleteRow(i);
            break;
       }
    }
  }
  