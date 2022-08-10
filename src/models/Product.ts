import { Sequelize, DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize';
import { db } from '../config/sqlite';

interface Attributes {
  id?: number;
  name: string;
  description: string;
  value: number;
}

class ProductModel extends Model<Attributes> implements Attributes {
  declare id: number;
  declare name: string;
  declare description: string;
  declare value: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
  declare readonly deletedAt: Date;
}

ProductModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    value: DataTypes.INTEGER,
  },
  {
    sequelize,
    tableName: 'Product',
  }
);

export { ProductModel };

