var req = new XMLHttpRequest();


//This allows us to generate an up to date table every time
// the user goes to the Workout Logger's home page
req.open('GET', 'http://flip3.engr.oregonstate.edu:3434/get');
req.setRequestHeader('Content-Type', 'application/json');
req.addEventListener('load', function() {
    if (req.status >= 200 && req.status < 400) {
        var response = JSON.parse(req.responseText);
        console.log(response);
        if (response.length) {
            if (document.getElementById("workouts")) {
                var workoutsTable = document.getElementById("workouts");
                workoutsTable.parentNode.replaceChild(buildTable(response), workoutsTable);
            } else {
                document.body.appendChild(buildTable(response));
            }
        }
    } else {
        console.log("Error in network request: " + req.statusText);
    }
});
req.send(null); //send JSON string-formatted object


/**************************************************************
**Function: buildTable(data)                                 **
**Description: This function constructs the HTML table that  **                                            
** will be displayed on the home page. It takes all of the   **                                                        
** required data from the server, and appends an update and  **                                                        
** delete button on to the end of each row.                  **                                        
**                                                           **  
**************************************************************/
function buildTable(data) {
    var newTable = document.createElement("table");
    newTable.setAttribute('class','exTable');
    newTable.id = "workouts";

    var fields = Object.keys(data[0]);
    var headRow = document.createElement("tr");
    for (var i = 1; i < fields.length; i++) {
        var headCell = document.createElement("th");
        headCell.textContent = fields[i];
        headRow.appendChild(headCell);
    }
    newTable.appendChild(headRow);

    data.forEach(function(object) {
        var row = document.createElement("tr");

        for (var i = 1; i < fields.length; i++) {
            var cell = document.createElement("td");
            cell.textContent = object[fields[i]];
            row.appendChild(cell);
        }

        var newForm = document.createElement("form");

        var delButton = document.createElement("button");
        delButton.textContent = "Delete ";
        delButton.className = "delete";

        //Add delete button behavior on click
        delButton.addEventListener('click', function(event) {
            var req = new XMLHttpRequest();

            //The hidden attribute rowId is stored in the lastchild of the row.
            var rowId = delButton.parentNode.parentNode.lastChild.value;
            console.log("Client-side passed ID: " + rowId);

            //Create payload for POST query.
            var payload = {
                id: rowId
            };

            req.open('POST', 'http://flip3.engr.oregonstate.edu:3434/delete');
            req.setRequestHeader('Content-Type', 'application/json');
            req.addEventListener('load', function() {
                if (req.status >= 200 && req.status < 400) {

                    //If query was successful, delete the current row.
                    var workoutsTable = document.getElementById("workouts");
                    var currentRow = delButton.parentNode.parentNode.rowIndex; //rowIndex returns index of current row Object
                    workoutsTable.deleteRow(currentRow); 
                } else {
                    console.log("Error in network request: " + req.statusText);
                }
            });
            req.send(JSON.stringify(payload)); 
            event.preventDefault();
        });
        newForm.appendChild(delButton);

        var updateButton = document.createElement("button");
        updateButton.textContent = "Update";
        updateButton.className = "update";
        updateButton.onclick = function(){
          var rowId = updateButton.parentNode.parentNode.lastChild.value;
          location.href = "http://flip3.engr.oregonstate.edu:3434/update?id="+rowId;
          event.preventDefault();
        };
        newForm.appendChild(updateButton);

        row.appendChild(newForm);
        
        //hiddenId stores the id we will use to identify each
        // row while deleting/updating its contents.
        var hiddenId = document.createElement("input");
        hiddenId.name = "id" + object.id;
        hiddenId.type = "hidden";
        hiddenId.value = object.id;
        row.appendChild(hiddenId);

        newTable.appendChild(row);
    });
    return newTable;
}
