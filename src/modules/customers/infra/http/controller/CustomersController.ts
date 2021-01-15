import { container } from 'tsyringe';
import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

export default class CustomersController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { name, email } = req.body;
    const createCustomer = container.resolve(CreateCustomerService);

    const newCustomer = await createCustomer.execute({ name, email });
    return res.json(newCustomer);
  }
}
