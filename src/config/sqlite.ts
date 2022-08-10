import { Sequelize } from 'sequelize';

// Modulo responsável por Config de conexão com o banco SQL
const db = new Sequelize({
  dialect: 'sqlite',
  storage: '../database/database.sqlite3',
  define: {
    timestamps: true,
    underscored: true,
  },
  logging: false,
});
export { db };
