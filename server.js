const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dbMysql = require("./app/config/mysql.config.js")
const connectionBdd = require("./app/services/ConnectionBdd")
var passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');
const auth = require("./app/middleware/auth.js");
var randomstring = require("randomstring");


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
        res.end("OK");
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
        res.end("OK");
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

// Create user
app.post("/user", (req, res) => {
    req.body.password = passwordHash.generate(req.body.password);
    dbMysql.dbMysql.query("SELECT * FROM user WHERE pseudo=? OR mail=?", [req.body.pseudo, req.body.mail], function (err, result) {
        if (err) throw err;
        console.log("retour du select" + result);
        if (result == "") {
            dbMysql.dbMysql.query('INSERT INTO user SET mail = ? , pseudo = ? , password = ? , isAdmin = ?', [req.body.mail, req.body.pseudo, req.body.password, req.body.isAdmin], function (error, results, fields) {
                if (error) throw error;
                res.end("OK");
            });
        }
        else {
            console.log("email ou pseudo déja utilisé");
            res.end("NOK")
            console.log(passwordHash.verify('b', 'sha1$63efbe7d$1$d7ddfc96057a751a0f27b5714d68e810eb5b2584'));
        }
    });


});
// delete user 
//{"id" : 2} 
app.delete('/user', function (req, res) {
    console.log(req.body);
    dbMysql.dbMysql.query('DELETE FROM user WHERE id=? and isAdmin = 1', [req.body.id], function (error, results, fields) {
        if (error) throw error;
        res.end("OK");
    });
});

/*=========================================================Connexion=======================================*/

app.post("/connection", (req, res) => {
    dbMysql.dbMysql.query("SELECT password, id FROM user where mail = ?", [req.body.mail], function (err, result) {
        if (err) throw err;
        console.log(result[0].password);
        console.log(result[0].id)
        let checkPassword = passwordHash.verify(req.body.password, result[0].password)
        if (checkPassword == true) {
            console.log("vous êtes connecté")
            res.status(200).json({
                userId: result[0].id,
                token: jwt.sign(
                    { userId: result[0].id },
                    randomstring.generate(20),
                    { expiresIn: '4h' }
                )
            });
        }
        else {
            console.log("email ou mot de passe erroné")
            res.end("NOK")
        }
    });

});




// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);

});