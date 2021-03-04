const dbMysql = require("../config/mysql.config")
const express = require("express");

const getAllDisquette = () => {

    dbMysql.dbMysql.query("SELECT * FROM disquette", function (err, result) {
        if (err) throw err;
        console.log(result);

    });
    return 5

}

exports.getAllDisquette = getAllDisquette
