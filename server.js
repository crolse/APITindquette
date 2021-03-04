const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const connection = require("./app/services/connection.js")
const sequelize = require("./app/config/sequilize")
const getAllDisquette = require("./app/services/getAllDisquette")
const dbMysql = require("./app/config/mysql.config.js")
const connectionBdd = require("./app/services/ConnectionBdd")


const app = express();

var corsOptions = {
    origin: "http://localhost:8081"
};

// init connection to bdd

connectionBdd.connectionBdd()



app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));



/*=========================================================Action Disquette========================================*/
//recover all disquette
app.get("/getAllDisquette", (req, res) => {

    dbMysql.dbMysql.query("SELECT * FROM disquette", function (err, result) {
        if (err) throw err;
        console.log(result);
        res.end(JSON.stringify(result))
    });
});

//create disquette
//{"content":"lorem ipsum fefefe","idAutor":"1","isValid":0}
app.post("/disquette", (req, res) => {
    var postData = req.body;
    dbMysql.dbMysql.query('INSERT INTO disquette SET ?', postData, function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});

app.get("/myDisquette/:idUser", (req, res) => {

    dbMysql.dbMysql.query("SELECT id , content FROM disquette WHERE idAutor=?", [req.params.idUser], function (err, result) {
        if (err) throw err;
        console.log(result);
        res.end(JSON.stringify(result))
    });
});

app.delete('/myDisquette', function (req, res) {
    console.log(req.body);
    dbMysql.dbMysql.query('DELETE FROM disquette WHERE idAutor=? and id=?', [req.body.idUser, req.body.idDisquette], function (error, results, fields) {
        if (error) throw error;
        res.end("Disquette supprimer");
    });
});

/*=========================================================Action Favoris========================================*/
//recover favoris
app.get("/favori/:idUser", (req, res) => {
    dbMysql.dbMysql.query("SELECT * FROM favori WHERE idUser=?", [req.params.idUser], function (err, result) {
        if (err) throw err;
        console.log(result);
        res.end(JSON.stringify(result))
    });
});
// Like a disquette
app.post("/favori", (req, res) => {
    var postData = req.body;
    dbMysql.dbMysql.query('INSERT INTO favori SET ?', postData, function (error, results, fields) {
        if (error) throw error;
        res.end("Favori ajouté");
    });
});
//Delete favori
app.delete('/favori', function (req, res) {
    console.log(req.body);
    dbMysql.dbMysql.query('DELETE FROM favori WHERE idUser=? and idDisquette=?', [req.body.idUser, req.body.idDisquette], function (error, results, fields) {
        if (error) throw error;
        res.end("Favori supprimer");
    });
});

/*=========================================================Action USER========================================*/

//recover all user 
app.get("/getAllUser", (req, res) => {

    dbMysql.dbMysql.query("SELECT * FROM user", function (err, result) {
        if (err) throw err;
        console.log(result);
        res.end(JSON.stringify(result))
    });
});

/*todo : checker si un mail existe deja ainsi que le pseudo*/
/*{"mail":"greg@","pseudo":"crolse","password":"gregge", "isAdmin" : 0}*/
app.post("/user", (req, res) => {

    var postData = req.body;
    dbMysql.dbMysql.query('INSERT INTO user SET ?', postData, function (error, results, fields) {
        if (error) throw error;
        res.end(JSON.stringify(results));
    });
});
// delete user 
//{"id" : 2} 
app.delete('/user', function (req, res) {
    console.log(req.body);
    dbMysql.dbMysql.query('DELETE FROM user WHERE id=?', [req.body.id], function (error, results, fields) {
        if (error) throw error;
        res.end('Utilisateur supprimer');
    });
});


// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);

});