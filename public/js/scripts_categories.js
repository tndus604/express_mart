document.addEventListener('DOMContentLoaded', () => {
    // INSERT
    const insertCategoryBtn = document.getElementById('insert_category_btn');
    const insertCategoryCancel = document.getElementById('insert_category_cancel');
    const insertCategoryForm = document.getElementById('insert_category_form');
  
    insertCategoryBtn.addEventListener('click', () => {
      insertCategoryForm.style.display = 'block';
    });
  
    insertCategoryCancel.addEventListener('click', () => {
      insertCategoryForm.style.display = 'none';
    });
  
    // UPDATE
    const updateCategoryBtns = document.querySelectorAll('.edit_icon'); 
    const updateCategoryCancel = document.getElementById('update_category_cancel');
    const updateCategoryForm = document.getElementById('update_category_form');
  
    updateCategoryBtns.forEach((btn, index) => {
      btn.addEventListener('click', (event) => {
        //Get the data and populate the form for the table
        let rowToUpdate = event.target.closest('tr');
        document.getElementById("updateCategoryID").value = rowToUpdate.getAttribute("data-value") 
        document.getElementById("updateCategoryName").value = rowToUpdate.getAttribute("data-category-name")  
        updateCategoryForm.style.display = 'block';
      });
    });
  
    updateCategoryCancel.addEventListener('click', () => {
      updateCategoryForm.style.display = 'none';
    });
  
    // DELETE
    const deleteCategoryBtns = document.querySelectorAll('.delete_category_icon'); 
  
    deleteCategoryBtns.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const isConfirmed = window.confirm(
          'Click the button to confirm this delete'
        );
  
        if (isConfirmed) {
          const rowToDelete = event.target.closest('tr');
          let categoryToDelete = rowToDelete.getAttribute("data-value")
          deleteCategory(categoryToDelete)
        }
      });
    });
  });
  
  //Use AJAX to delete
  function deleteCategory(categoryID) {
    let data = {
        categoryID: categoryID
    };
  
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-category", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {
            deleteRow(categoryID);
        } else if (xhttp.readyState == 4) {
            console.log("Error deleting category.");
        }
    };
    xhttp.send(JSON.stringify(data));
}

  
  // update the HTML for the row removal
  function deleteRow(categoryID){
    let table = document.getElementById("categories-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       //iterate through rows
       if (table.rows[i].getAttribute("data-value") == categoryID) {
            table.deleteRow(i);
            break;
       }
    }
  }
  