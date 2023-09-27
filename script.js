// Function to calculate and display total price for each person
function calculateTotalPrice() {
    const orders = JSON.parse(localStorage.getItem("orders")) || {};
    const totalPrices = {};

    // Calculate total price for each person
    orders.forEach(order => {
        const nombre = order.nombre;
        const precio = parseFloat(order.precio);

        if (!isNaN(precio)) {
            totalPrices[nombre] = (totalPrices[nombre] || 0) + precio;
        }
    });

    // Display total prices and order history buttons
    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";

    for (const nombre in totalPrices) {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<strong>Nombre:</strong> ${nombre}<br>
                              <strong>Total Precio:</strong> ${totalPrices[nombre].toFixed(2)}`;
        
        // Create a button to view order history for this person
        const historyButton = document.createElement("button");
        historyButton.textContent = "View History";
        historyButton.className = "view-history-button";
        historyButton.addEventListener("click", () => viewOrderHistory(nombre));
        listItem.appendChild(historyButton);

        orderList.appendChild(listItem);
    }
}

// Function to calculate and display total sales amount as an integer
function calculateTotalSalesAmount() {
    const orders = JSON.parse(localStorage.getItem("orders")) || {};
    let totalSalesAmount = 0;

    // Calculate total sales amount as an integer
    orders.forEach(order => {
        const precio = parseFloat(order.precio);

        if (!isNaN(precio)) {
            totalSalesAmount += Math.round(precio);
        }
    });

    // Display the total sales amount as an integer
    const totalSalesAmountSpan = document.getElementById("total-sales-amount");
    totalSalesAmountSpan.textContent = totalSalesAmount;
}

// Function to view order history for a person
function viewOrderHistory(nombre) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    const personOrders = orders.filter(order => order.nombre === nombre);

    // Display order history for the selected person
    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";

    const backButton = document.createElement("button");
    backButton.textContent = "Back to Total Prices";
    backButton.className = "back-button";
    backButton.addEventListener("click", calculateTotalPrice);
    orderList.appendChild(backButton);

    personOrders.forEach(order => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<strong>Número de Prenda:</strong> ${order.numeroPrenda}<br>
                              <strong>Precio:</strong> ${order.precio}`;
        
        // Create a button to remove the order
        const removeButton = document.createElement("button");
        removeButton.textContent = "Borrar Prenda";
        removeButton.className = "remove-order-button";
        removeButton.addEventListener("click", () => removeOrder(nombre, order.numeroPrenda));
        listItem.appendChild(removeButton);

        orderList.appendChild(listItem);
    });
}

// Function to add an order
function addOrder() {
    const numeroPrenda = document.getElementById("numero-prenda").value;
    const precio = document.getElementById("precio").value;
    const nombre = document.getElementById("nombre").value;

    if (numeroPrenda && precio && nombre) {
        const order = {
            numeroPrenda: numeroPrenda,
            precio: precio,
            nombre: nombre
        };

        // Get existing orders from local storage or initialize an empty array
        const orders = JSON.parse(localStorage.getItem("orders")) || [];

        // Add the new order to the array
        orders.push(order);

        // Save the updated order list to local storage
        localStorage.setItem("orders", JSON.stringify(orders));

        // Clear input fields
        document.getElementById("numero-prenda").value = "";
        document.getElementById("precio").value = "";
        document.getElementById("nombre").value = "";

        // Recalculate and display total prices
        calculateTotalPrice();
        calculateTotalSalesAmount(); // Call this to update the total sales amount as well
    }
}

// Function to clear the order history
function clearHistory() {
    localStorage.removeItem("orders");
    // Clear the displayed order list
    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";

    // Reset the total sales amount
    const totalSalesAmountSpan = document.getElementById("total-sales-amount");
    totalSalesAmountSpan.textContent = "0"; // Set it to zero
}

// Function to remove an order from a person's history
function removeOrder(nombre, numeroPrenda) {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    
    // Find the index of the order to remove
    const indexToRemove = orders.findIndex(order => order.nombre === nombre && order.numeroPrenda === numeroPrenda);
    
    if (indexToRemove !== -1) {
        // Remove the order from the array
        orders.splice(indexToRemove, 1);
        
        // Save the updated order list to local storage
        localStorage.setItem("orders", JSON.stringify(orders));
        
        // Refresh the order history for the selected person
        viewOrderHistory(nombre);
        
        // Recalculate and display total prices and total sales amount
        calculateTotalPrice();
        calculateTotalSalesAmount();
    }
}

// Initial calculation and display of total prices and total sales amount
calculateTotalPrice();
calculateTotalSalesAmount();

function generateTxtFile() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    
    // Create a string to store the purchase history
    let txtContent = "Número de Prenda\tPrecio\tNombre\n"; // Column headers

    orders.forEach(order => {
        const { numeroPrenda, precio, nombre } = order;
        txtContent += `${numeroPrenda}\t${precio}\t${nombre}\n`;
    });

    // Create a Blob containing the text
    const blob = new Blob([txtContent], { type: "text/plain" });

    // Create a link to download the Blob
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "purchase_history.txt";

    // Trigger a click event on the link to start the download
    a.click();

    // Release the Blob and URL objects
    window.URL.revokeObjectURL(url);
}
