import { Request, Response } from 'express';

import { ProductModel } from '../../models/Product';

export class Product {
  async create(request: Request, response: Response) {
    try {
      console.info('Criando');
      // desestrutura dados do corpo da requisição
      const {
        name,
        description,
        value,
      }: {
        name: string;
        description: string;
        value: number;
      } = request['body'];
      // Verifica os dados recebidos
      if (!name || !description || !value) {
        // Em caso de erro
        return response.status(400).send('Error at method create');
      }

      const newProduct = await ProductModel.create({
        name,
        description,
        value,
      });

      return response.status(200).json({
        status: 'Success',
        message: 'Product Created',
        obj: newProduct,
      });
    } catch (error) {
      console.error(error);
    }
  }
  async read(request: Request, response: Response) {
    try {
      console.info('Buscando');
      // desestrutura dados do corpo da requisição
      const {
        name,
        description,
        value,
      }: {
        name: string;
        description: string;
        value: number;
      } = request['body'];
      // Verifica os dados recebidos
      if (!name) {
        // Em caso de erro
        return response.status(400).json({
          status: 'Error',
          message: 'Enter correct input',
        });
      }

      const findProduct = await ProductModel.findOne({
        where:{name}
      });

      return response.status(200).json({
        status: 'Success',
        message: 'Product find',
        obg: findProduct,
      });
    } catch (error) {
      console.error(error);
    }
  }
}
