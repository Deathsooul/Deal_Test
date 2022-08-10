const { Sequelize } = require("sequelize");
const config = require("./sqlite");

// Modulo responsável por Config de conexão com o banco SQL
export default new Sequelize(config);
