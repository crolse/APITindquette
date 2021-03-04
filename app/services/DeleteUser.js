const sequelize = require("../config/sequilize")
const deleteUser = () => {

    try {
        sequelize.sequelize.query("SELECT * FROM disquette").then(([results, metadata]) => {
            console.log(results);
            console.log(metadata)
            return metadata

        })
    }
    catch (error) {
        console.error('erreur lors de la suppression de l utilisateur, erreur suivante :', error);
    }

}

exports.deleteUser = deleteUser