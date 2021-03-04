const sequelize = require("../config/sequilize")



const connectionBdd = () => {

    try {

        sequelize.sequelize.authenticate();

        console.log('Connecté à la base de données MySQL!');
    } catch (error) {

        console.error('Impossible de se connecter, erreur suivante :', error);

    }
}

exports.connectionBdd = connectionBdd


