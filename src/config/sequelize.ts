const { Sequelize } = require("sequelize");
const config = require("./sqlite");
const teste = require("./sr");

// Modulo responsável por Config de conexão com o banco SQL
export default new Sequelize(config);
