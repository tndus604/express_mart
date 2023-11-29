document.addEventListener('DOMContentLoaded', () => {
    // INSERT
    const insertEmployeeBtn = document.getElementById('insert_employee_btn');
    const insertEmployeeCancel = document.getElementById('insert_employee_cancel');
    const insertEmployeeForm = document.getElementById('insert_employee_form');
  
    insertEmployeeBtn.addEventListener('click', () => {
      insertEmployeeForm.style.display = 'block';
    });
  
    insertEmployeeCancel.addEventListener('click', () => {
      insertEmployeeForm.style.display = 'none';
    });
  
    // UPDATE
    const updateEmployeeBtns = document.querySelectorAll('.edit_icon'); 
    const updateEmployeeCancel = document.getElementById('update_employee_cancel');
    const updateEmployeeForm = document.getElementById('update_employee_form');
  
    updateEmployeeBtns.forEach((btn, index) => {
      btn.addEventListener('click', (event) => {
        //Get the data and populate the form for the table
        let rowToUpdate = event.target.closest('tr');
        document.getElementById("updateEmployeeID").value = rowToUpdate.getAttribute("data-value") 
        document.getElementById("updateEmployeeFirstName").value = rowToUpdate.getAttribute("data-first-name") 
        document.getElementById("updateEmployeeLastName").value = rowToUpdate.getAttribute("data-last-name")
        document.getElementById("updateEmployeeEmail").value = rowToUpdate.getAttribute("data-email") 
        document.getElementById("updateEmployeePosition").value = rowToUpdate.getAttribute("data-position") 
        document.getElementById("updateEmployeeCustomerID").value = rowToUpdate.getAttribute("data-customerID") 
        updateEmployeeForm.style.display = 'block';
      });
    });
  
    updateEmployeeCancel.addEventListener('click', () => {
      updateEmployeeForm.style.display = 'none';
    });
  
    // DELETE
    const deleteEmployeeBtns = document.querySelectorAll('.delete_employee_icon'); 
  
    deleteEmployeeBtns.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const isConfirmed = window.confirm(
          'Click the button to confirm this delete'
        );
  
        if (isConfirmed) {
          const rowToDelete = event.target.closest('tr');
          let employeeToDelete = rowToDelete.getAttribute("data-value")
          deletePerson(employeeToDelete)
        }
      });
    });
  });
  
  //Use AJAX to delete
  function deletePerson(employeeID) {
    let data = {
        employeeID: employeeID
    };
  
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-employee", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {
            deleteRow(employeeID);
        } else if (xhttp.readyState == 4) {
            console.log("Error deleting employee.");
        }
    };
    xhttp.send(JSON.stringify(data));
}

  
  // update the HTML for the row removal
  function deleteRow(employeeID){
    let table = document.getElementById("employees-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       //iterate through rows
       if (table.rows[i].getAttribute("data-value") == employeeID) {
            table.deleteRow(i);
            break;
       }
    }
  }
  