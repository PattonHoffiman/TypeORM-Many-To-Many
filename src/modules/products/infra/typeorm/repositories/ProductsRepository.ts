import { getRepository, Repository, In } from 'typeorm';

import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';

import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({
      where: { name },
    });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsId = products.map(product => product.id);
    const findProducts = await this.ormRepository.find({
      where: { id: In(productsId) },
    });

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsId = products.map(product => product.id);
    const findProducts = await this.ormRepository.find({
      where: { id: In(productsId) },
    });

    products.forEach(product => {
      findProducts.map(findProduct => {
        if (findProduct.id === product.id)
          findProduct.quantity = product.quantity;

        return findProduct;
      });
    });

    const updatedProducts = await this.ormRepository.save(findProducts);
    return updatedProducts;
  }
}

export default ProductsRepository;
