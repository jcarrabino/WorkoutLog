/**************************************************************
**Author:John Carrabino (carrabij)                           **
**Title: Database Interactions and UI                        **
**Description:This assignment called for us to create a      **
** simple database backed website that features Ajax         **
** interactions. The final product is a workout logger that  **
** a client could use to log their exercises.                **
**                                                           ** 
**************************************************************/

var express = require('express');
var mysql = require('./dbcon.js');

var app = express();
var handlebars = require('express-handlebars').create({
    defaultLayout: 'main'
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3434);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

var request = require('request');

app.use(express.static('public'));


//GET Req to reset the workouts table
app.get('/resetTable', function(req, res, next) {
    var context = {};
    mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err) { 
        var createString = "CREATE TABLE workouts(" +
            "id INT PRIMARY KEY AUTO_INCREMENT," +
            "name VARCHAR(255) NOT NULL," +
            "reps INT," +
            "weight INT," +
            "date DATE," +
            "lbs BOOLEAN)";
        mysql.pool.query(createString, function(err) {
            context.results = "Exercise table reset";
            res.render('home', context);
        });
    });
});


//Renders home page with any pre-existing Workouts data
app.get('/', function(req, res, next) {
    var context = {};
    mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.results = JSON.stringify(rows);
        res.render('home');
    });
});


// Same as previous function, used by buildTable.js to
// display up to date table to home page.
app.get('/get', function(req, res) {
    var context = {};
    mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.results = JSON.stringify(rows);
        res.send(context.results);
    });
});


/**************************************************************
**Function: '/add'                                           **
**Description: Adds a new row to the DB after a POST         **
** request is sent to the server from the client             **
**************************************************************/
app.post('/add', function(req, res) {
    var context = {};
    
    var post = {
        name: req.body.name,
        reps: req.body.reps,
        weight: req.body.weight,
        date: req.body.date,
        lbs: req.body.lbs
    };
   
    mysql.pool.query('INSERT INTO workouts SET ?', post,
        function(err, results) {
            if (err) {
                next(err);
                return;
            }
            mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
                if (err) {
                    next(err);
                    return;
                }
                context.results = JSON.stringify(rows);
                res.send(context.results);
            });
        });
});


/**************************************************************
**Function: '/delete'                                        **
**Description: This function takes the row id passed to it   **
** for the row the user has selected to delete. It then      **
** sends a POST query to the server and deletes the row      **
** before returning the newly updated table to the client.   **
**************************************************************/
app.post('/delete', function(req, res, next) {
    var context = {};
    console.log("Server-side delete id: " + req.body.id);
    mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.body.id], function(err, result) {
        if (err) {
            next(err);
            return;
        }
        mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields) {
            if (err) {
                next(err);
                return;
            }
            context.results = JSON.stringify(rows);
            res.send(context.results);
        });
    });
});


/**************************************************************
**Function: GET '/update'                                    **
**Description: Receives the id for the row to be updated and **
** uses that data to prepopulate and render the update form  **
**************************************************************/
app.get('/update', function(req, res, next) {
    var context = {};
    mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.query.id], function(err, rows, fields) {
        if (err) {
            next(err);
            return;
        }
        context.results = rows;

        //Check the box if lbs boolean is true.
        if (context.results[0].lbs === 1) {
            context.checked = "checked";
        }
        console.log("Current update object: " + JSON.stringify(context.results));
        res.render('update', context);
    });
});


/**************************************************************
**Function: POST '/update'                                   **
**Description: Sends updated row info via POST query to      **
** the server where it updates the specified row. After the  **
** row if updated this function redirects the client back to **
** the home page where they will be able to view the newly   **
** updated table.                                            ** 
**************************************************************/
app.post('/update', function(req, res, next) {
    var context = {};
    mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.body.id], function(err, result) {
        if (err) {
            next(err);
            return;
        }
        if (result.length == 1) {
            var updatedRow = result[0];
            var checked = 0;
            if(req.body.lbs){
              checked = 1;
            }
            console.log("req.body with POST: " + JSON.stringify(req.body));
            mysql.pool.query('UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?', 
            [req.body.name || updatedRow.name, req.body.reps || updatedRow.reps, req.body.weight || updatedRow.weight, req.body.date || updatedRow.date, checked, req.body.id],
                function(err, result) {
                    if (err) {
                        next(err);
                        return;
                    }
                    res.redirect('/');
                });
        }
    });
});


app.use(function(req, res) {
    res.status(404);
    res.render('404');
});


app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

 
app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
