import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import IOrdersRepository from '../repositories/IOrdersRepository';

import Order from '../infra/typeorm/entities/Order';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const existCustomer = await this.customersRepository.findById(customer_id);
    if (!existCustomer) throw new AppError("Customer Doesn't Exist!", 400);

    const existProducts = await this.productsRepository.findAllById(products);
    if (!existProducts.length)
      throw new AppError("Products Doesn't Exists!", 400);

    const existProductsId = existProducts.map(existProduct => existProduct.id);
    const verifyNonExistentProducts = products.filter(
      product => !existProductsId.includes(product.id),
    );
    if (verifyNonExistentProducts.length)
      throw new AppError("Some of the Products Doesn't Exists!", 400);

    const invalidQuantityProducts: IProduct[] = [];

    existProducts.forEach(existProduct => {
      const findProduct = products.filter(
        product => product.id === existProduct.id,
      )[0];

      if (existProduct.quantity < findProduct.quantity)
        invalidQuantityProducts.push(findProduct);
    });

    if (invalidQuantityProducts.length)
      throw new AppError(
        "Some of the Products hasn't the necessary Quantity!",
        400,
      );

    const formattedProduct = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existProducts.filter(
        existProduct => existProduct.id === product.id,
      )[0].price,
    }));

    const newOrder = await this.ordersRepository.create({
      customer: existCustomer,
      products: formattedProduct,
    });

    const { order_products } = newOrder;
    const orderedProductsQuantity = order_products.map(product => ({
      id: product.product_id,
      quantity:
        existProducts.filter(
          existProduct => existProduct.id === product.product_id,
        )[0].quantity - product.quantity,
    }));

    await this.productsRepository.updateQuantity(orderedProductsQuantity);
    return newOrder;
  }
}

export default CreateOrderService;
