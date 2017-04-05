document.addEventListener('DOMContentLoaded', addExButton);

function addExButton() {
    document.getElementById("add").addEventListener('click', function(event) {

        if (!document.getElementById("name").value){
          alert("You must enter a name!");
          event.preventDefault();
          return;
        }

        var req = new XMLHttpRequest();
        
        //Set default unit to kgs
        var checked = 0;
        if (document.getElementById("checker").checked) {
            //if checked, sets units to lbs.
            checked = 1;
        }

        var payload = {
            name: document.getElementById("name").value,
            reps: document.getElementById("reps").value,
            weight: document.getElementById("weight").value,
            date: document.getElementById("date").value,
            lbs: checked
        };

        req.open('POST', 'http://flip3.engr.oregonstate.edu:3434/add');
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function() {
            if (req.status >= 200 && req.status < 400) {
                var response = JSON.parse(req.responseText);

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
        req.send(JSON.stringify(payload));
        event.preventDefault();
    });
}