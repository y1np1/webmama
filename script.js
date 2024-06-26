document.addEventListener("DOMContentLoaded", function () {
    // Elements
    const garmentNumberInput = document.getElementById("garment-number");
    const garmentValueInput = document.getElementById("garment-value");
    const awardedPersonSelect = document.getElementById("awarded-person-select");
    const newPersonInput = document.getElementById("new-person");
    const addPersonButton = document.getElementById("add-person-button");
    const submitButton = document.getElementById("submit-button");
    const clearHistoryButton = document.getElementById("clear-history-button");
    const orderList = document.getElementById("order-summary");
    const logList = document.getElementById("log-list");
    const exportHistoryButton = document.getElementById("export-history-button");
    const exportTotalsButton = document.getElementById("export-totals-button");
    const editPersonButton = document.getElementById("edit-person-button");

    // Sales history arrays with local storage
    let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    const itemLog = [];

    // Function to validate form input
    function validateInput() {
        if (!garmentNumberInput.value.trim() || !garmentValueInput.value.trim() || isNaN(garmentValueInput.value)) {
            alert('Por favor ingresa datos validos.');
            return false;
        }
        return true;
    }

    // Function to populate the select element with awarded persons
    function populateAwardedPersons() {
        const uniquePersons = Array.from(new Set(orderHistory.map(item => item.awardedPerson)));
        awardedPersonSelect.innerHTML = "";

        uniquePersons.sort();
        uniquePersons.forEach(person => {
            const option = document.createElement("option");
            option.value = person;
            option.textContent = person;
            awardedPersonSelect.appendChild(option);
        });
    }

    // Function to update the person history section
    function updatePersonHistory() {
        orderList.innerHTML = "";

        const uniquePersons = Array.from(new Set(orderHistory.map(item => item.awardedPerson)));
        uniquePersons.sort();

        uniquePersons.forEach(person => {
            const personHistory = document.createElement("div");
            personHistory.className = "person-history";
            personHistory.innerHTML = `
                <h3>Historial de: ${person}</h3>
                <ul>
                    ${orderHistory
                        .filter(item => item.awardedPerson === person)
                        .map(item => `<li>${item.garmentNumber} - $${item.garmentValue}</li>`)
                        .join('')}
                </ul>
            `;
            orderList.appendChild(personHistory);
        });
    }

    // Function to create a delete button and attach it to a garment item
    function addDeleteButton(garmentItem, garmentIndex) {
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "Borrar Prenda";

        deleteButton.addEventListener("click", function () {
            orderHistory.splice(garmentIndex, 1);

            // Update local storage
            localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

            // Update the person history and order summary
            updatePersonHistory();
            populateAwardedPersons();
            updateOrderSummary();
        });

        garmentItem.appendChild(deleteButton);
    }

    // Function to create a garment item and add hover effect
    function createGarmentItem(garment, garmentIndex) {
        const garmentItem = document.createElement("li");
        garmentItem.textContent = `Prenda ${garment.garmentNumber} - $${garment.garmentValue} - Adjudicada Por: ${garment.awardedPerson}`;
        garmentItem.className = "garment-item";

        garmentItem.addEventListener("mouseenter", function () {
            addDeleteButton(garmentItem, garmentIndex);
        });

        garmentItem.addEventListener("mouseleave", function () {
            const deleteButton = garmentItem.querySelector(".delete-button");
            if (deleteButton) {
                deleteButton.remove();
            }
        });

        return garmentItem;
    }

    // Update the order summary with hover effect
    function updateOrderSummary() {
        logList.innerHTML = "";
        orderHistory.forEach((garment, index) => {
            const garmentItem = createGarmentItem(garment, index);
            logList.appendChild(garmentItem);
        });
    }

    // Function to export the detailed history as a TXT file
function exportDetailedHistory() {
    let txtContent = "Numero de prenda;Adjudicado por;Precio de la prenda\n"; // Column headers with a semicolon delimiter

    orderHistory.forEach(item => {
        txtContent += `${item.garmentNumber};${item.awardedPerson};${item.garmentValue}\n`; // Add a semicolon delimiter
    });

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_detallado.txt';
    a.click();
}

// Function to export totals per person as a TXT file
function exportTotalsPerPerson() {
    let txtContent = "Total;Persona\n"; // Column headers with a semicolon delimiter
    const uniquePersons = Array.from(new Set(orderHistory.map(item => item.awardedPerson)));
    
    uniquePersons.forEach(person => {
        const total = orderHistory
            .filter(item => item.awardedPerson === person)
            .reduce((acc, item) => acc + parseFloat(item.garmentValue), 0);
        txtContent += `${total};${person}\n`; // Add a semicolon delimiter
    });

    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'total_por_persona.txt';
    a.click();
}


    // Event listener for adding persons
    addPersonButton.addEventListener("click", function () {
        const newPerson = newPersonInput.value;
        if (newPerson) {
            awardedPersonSelect.innerHTML += `<option value="${newPerson}">${newPerson}</option>`;
            newPersonInput.value = "";
        }
    });

    // Event listener for exporting the detailed history
    exportHistoryButton.addEventListener("click", exportDetailedHistory);

    // Event listener for exporting totals per person
    exportTotalsButton.addEventListener("click", exportTotalsPerPerson);

    // Event listener for submitting a sale
    submitButton.addEventListener("click", function () {
        if (validateInput()) {
            const garmentNumber = garmentNumberInput.value;
            const garmentValue = garmentValueInput.value;
            const awardedPerson = awardedPersonSelect.value;

            orderHistory.push({ garmentNumber, garmentValue, awardedPerson });
            
            // Update local storage
            localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

            updatePersonHistory();
            populateAwardedPersons();
            updateOrderSummary();

            garmentNumberInput.value = "";
            garmentValueInput.value = "";
        }
    });

    // Event listener for clearing the history (with local storage)
    clearHistoryButton.addEventListener("click", function () {
        // Show a confirmation dialog
        const confirmDelete = confirm("Borrar?");
        
        if (confirmDelete) {
            logList.innerHTML = "";
            orderHistory.length = 0;
            localStorage.removeItem("orderHistory");
            populateAwardedPersons();
            updatePersonHistory();
            updateOrderSummary();
        }
    });

    // Event listener for editing a person's name
    editPersonButton.addEventListener("click", function () {
        const selectedPerson = awardedPersonSelect.value;
        const newPersonName = prompt("Cual es el nombre correcto?:");

        if (newPersonName) {
            orderHistory.forEach(item => {
                if (item.awardedPerson === selectedPerson) {
                    item.awardedPerson = newPersonName;
                }
            });

            populateAwardedPersons();
            updatePersonHistory();
        }
    });

    // Load data from local storage on page load
    if (localStorage.getItem("orderHistory")) {
        orderHistory = JSON.parse(localStorage.getItem("orderHistory"));
        populateAwardedPersons();
        updatePersonHistory();
        updateOrderSummary();
    }
});
