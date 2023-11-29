document.addEventListener('DOMContentLoaded', () => {
    // INSERT
    const insertProductBtn = document.getElementById('insert_product_btn');
    const insertProductCancel = document.getElementById('insert_product_cancel');
    const insertProductForm = document.getElementById('insert_product_form');
  
    insertProductBtn.addEventListener('click', () => {
      insertProductForm.style.display = 'block';
    });
  
    insertProductCancel.addEventListener('click', () => {
      insertProductForm.style.display = 'none';
    });
  
    // UPDATE
    const updateProductBtns = document.querySelectorAll('.edit_icon'); 
    const updateProductCancel = document.getElementById('update_product_cancel');
    const updateProductForm = document.getElementById('update_product_form');
  
    updateProductBtns.forEach((btn, index) => {
      btn.addEventListener('click', (event) => {
        //Get the data and populate the form for the table
        let rowToUpdate = event.target.closest('tr');
        document.getElementById("updateProductID").value = rowToUpdate.getAttribute("data-value") 
        document.getElementById("updateProductProductName").value = rowToUpdate.getAttribute("data-product-name") 
        document.getElementById("updateProductUnitPrice").value = rowToUpdate.getAttribute("data-unit-price")
        document.getElementById("updateProductCategoryID").value = rowToUpdate.getAttribute("data-categoryID") 
        updateProductForm.style.display = 'block';
      });
    });
  
    updateProductCancel.addEventListener('click', () => {
      updateProductForm.style.display = 'none';
    });
  
    // DELETE
    const deleteProductBtns = document.querySelectorAll('.delete_product_icon'); 
  
    deleteProductBtns.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        const isConfirmed = window.confirm(
          'Click the button to confirm this delete'
        );
  
        if (isConfirmed) {
          const rowToDelete = event.target.closest('tr');
          let productToDelete = rowToDelete.getAttribute("data-value")
          deleteProduct(productToDelete)
        }
      });
    });
  });
  
  //Use AJAX to delete
  function deleteProduct(productID) {
    let data = {
        productID: productID
    };
  
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-product", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {
            deleteRow(productID);
        } else if (xhttp.readyState == 4) {
            console.log("Error deleting product.");
        }
    };
    xhttp.send(JSON.stringify(data));
}

  
  // update the HTML for the row removal
  function deleteRow(productID){
    let table = document.getElementById("products-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       //iterate through rows
       if (table.rows[i].getAttribute("data-value") == productID) {
            table.deleteRow(i);
            break;
       }
    }
  }
  