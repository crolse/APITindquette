const express = require("express");
const bodyParser = require("body-parser");
const http = require('http')
const cors = require("cors");
const dbMysql = require("./app/config/mysql.config.js")
const connectionBdd = require("./app/services/ConnectionBdd")
const auth = require("./app/middleware/auth.js");
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_output.json')
var passwordHash = require('password-hash');
const jwt = require('jsonwebtoken');





const app = express();
http.createServer(app).listen(8080)
console.log("Listening at:// port:%s (HTTP)", 8080)
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// init connection to bdd
connectionBdd.connectionBdd()

app.use(cors()) // permet d'accepter les requêtes de toutes provenances
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));




//#region REQUEST 

//#region SignUP
app.post("/addUser", (req, res) => {
    try {
        req.body.password = passwordHash.generate(req.body.password);
        dbMysql.dbMysql.query("SELECT * FROM user WHERE pseudo=? OR mail=?", [req.body.pseudo, req.body.mail], function (err, result) {
            if (err) res.status(500).json({ message: "unknown error" });
            console.log("retour du select" + result);
            if (result == "") {
                dbMysql.dbMysql.query('INSERT INTO user SET mail = ? , pseudo = ? , password = ? , isAdmin = ?', [req.body.mail, req.body.pseudo, req.body.password, req.body.isAdmin], function (error, results, fields) {
                    if (error) res.status(500).json({ message: "unknown error" });
                    res.status(200).json({ message: "utilisateur ajouté" });;
                });
            }
            else {
                console.log("email ou pseudo déja utilisé");
                res.status(406).json({ message: "email ou pseudo déja utilisé" }) // 406 NOT ACCEPTABLE

            }
        });
    } catch (error) {
        res.status(500).json({ message: "unknown error" })

    }


});
//#endregion

//#region SignIN
app.post("/connection", (req, res) => {
    try {
        dbMysql.dbMysql.query("SELECT password, id ,isAdmin FROM user where mail = ?", [req.body.mail], function (err, result) {
            if (err) res.status(500).json({ message: "unknown error" });
            if (result == "") { res.status(406).json({ message: "email invalide" }) }
            else {
                console.log(result[0].password);
                console.log(result[0].id)
                let checkPassword = passwordHash.verify(req.body.password, result[0].password)
                if (checkPassword == true) {
                    console.log("vous êtes connecté")
                    res.status(200).json({
                        userId: result[0].id,
                        token: jwt.sign(
                            { userId: result[0].id },
                            'ULTRA_RANDOM_TOKEN_SECRET',
                            { expiresIn: '4h' }
                        ),
                        isAdmin: result[0].isAdmin
                    });
                }
                else {
                    console.log("mot de passe erroné")
                    res.status(406).json({ message: "mot de passe invalide" })
                }
            }
        });

    } catch (error) { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region Add Disquette
app.post("/disquette", auth, (req, res) => {
    try {
        req.body.idAutor = req.body.userId
        dbMysql.dbMysql.query('INSERT INTO disquette SET content = ? , idAutor =? , isValid = 0', [req.body.content, req.body.idAutor], function (error, results, fields) {
            if (error) throw error;
            res.status(200).json({ message: "disquette ajouté" })
        });
    } catch (error) { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region Validate disquette
app.post("/acceptDisquette", (req, res) => {
    try {
        req.body.id = req.body.idDisquette
        dbMysql.dbMysql.query('Update disquette set isValid=1 WHERE id=?', [req.body.id], function (error, results, fields) {
            if (error) throw error;
            res.status(200).json({ message: "disquette Validé" })
        });
    } catch (error) { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region Delete disquette by an admin
app.delete('/deleteDisquette', function (req, res) {
    try {
        req.body.id = req.body.idDisquette
        dbMysql.dbMysql.query('DELETE FROM disquette WHERE id=?', [req.body.id], function (error, results, fields) {
            if (error) throw error;
            res.status(200).json({ message: "Disquette supprimé" })
        });
    } catch { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region Recover All Disquette
app.get("/getAllDisquette", (req, res) => {
    try {
        dbMysql.dbMysql.query("SELECT * FROM disquette ", function (err, result) {
            if (err) throw err;
            console.log(result);
            res.status(200).json(result)
        });
    } catch { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region Like Disquette
app.post("/favori", auth, (req, res) => {
    try {
        req.body.idUser = req.body.userId;
        dbMysql.dbMysql.query('Select * from favori where idUser=? and idDisquette=?', [req.body.idUser, req.body.idDisquette], function (error, results, fields) {
            if (error) throw error;
            if (results == "") {
                dbMysql.dbMysql.query('INSERT INTO favori SET idUser=? , idDisquette=?', [req.body.idUser, req.body.idDisquette], function (error, results, fields) {
                    if (error) throw error;
                    res.status(200).json({ message: "Disquette liké" })
                });
            }
            else {
                res.status(406).json({ message: "Disquette deja liké" })
            }
        });
    } catch { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region List Disquette LIKE
app.get("/favori/:userId", auth, (req, res) => {
    try {
        req.params.idUser = req.params.userId
        dbMysql.dbMysql.query("SELECT content , idDisquette from favori join disquette ON favori.idDisquette = disquette.id WHERE idUser = ?", [req.params.idUser], function (err, result) {
            if (err) throw err;
            console.log(result);
            res.status(200).json(result)
        });
    } catch { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region  Delete Like
app.delete('/favori', auth, function (req, res) {
    try {
        req.body.idUser = req.body.userId
        console.log(req.body.userId, req.body.idDisquette);
        dbMysql.dbMysql.query('DELETE FROM favori WHERE idUser=? and idDisquette=?', [req.body.idUser, req.body.idDisquette], function (error, results, fields) {
            if (error) throw error;
            res.status(200).json({ message: "Like supprimé" })
        });
    } catch { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region   Recover all User
app.get("/getAllUser", (req, res) => {
    try {
        dbMysql.dbMysql.query("SELECT * FROM user where isAdmin=0", function (err, result) {
            if (err) throw err;
            console.log(result);
            res.status(200).json(result)
        })
    } catch { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#region  Delete User
app.delete('/user', auth, function (req, res) {
    try {
        console.log(req.body);
        req.body.id = req.body.userIdDelete
        dbMysql.dbMysql.query('DELETE FROM user WHERE id=? ', [req.body.id], function (error, results, fields) {
            if (error) throw error;
            res.status(200).json({ message: "utilisateur supprimer" })
        });
    } catch { res.status(500).json({ message: "unknown error" }) }
});
//#endregion

//#endregion



