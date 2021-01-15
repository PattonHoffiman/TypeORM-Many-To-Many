import { container } from 'tsyringe';
import { Request, Response } from 'express';

import CreateProductService from '@modules/products/services/CreateProductService';

export default class ProductsController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { name, price, quantity } = req.body;
    const createProduct = container.resolve(CreateProductService);

    const newProduct = await createProduct.execute({ name, price, quantity });
    return res.json(newProduct);
  }
}
