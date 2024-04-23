import { Database } from "@azure/cosmos";
import { v4 as uuidv4 } from "uuid";
import { DatabaseException } from "../classes";
import {
  Product,
  ProductCreateDto,
  ProductDto,
  Stock,
  mapToProduct,
  mapToStock,
} from "../models";

export class ProductDataService {
  constructor(private db: Database) {}

  async getProducts(): Promise<ProductDto[]> {
    let products: Product[], stocks: Stock[];

    try {
      const { productContainer, stockContainer } = this.getContainers();
      const { resources: productResponse } = await productContainer.items
        .readAll()
        .fetchAll();
      products = productResponse.map(mapToProduct);
      const { resources: stockResponse } = await stockContainer.items
        .readAll()
        .fetchAll();
      stocks = stockResponse.map(mapToStock);
    } catch (error) {
      throw new DatabaseException(error.message);
    }

    if (products && stocks) {
      const result: ProductDto[] = products.map((p: Product) => ({
        ...p,
        count: stocks.find((s) => s.product_id === p.id)?.count,
      }));
      return result;
    } else {
      return [];
    }
  }

  async getProductById(id: string): Promise<ProductDto | undefined> {
    try {
      const { productContainer, stockContainer } = this.getContainers();
      const { resource: productResponse } = await productContainer
        .item(id, id)
        .read();
      const stockQuery = {
        query: "SELECT * FROM c WHERE c.product_id=@productId",
        parameters: [
          {
            name: "@productId",
            value: id,
          },
        ],
      };
      const { resources: stockResponse } = await stockContainer.items
        .query(stockQuery)
        .fetchAll();
      const stock = stockResponse.map(mapToStock).shift();
      return productResponse && stock
        ? {
            ...mapToProduct(productResponse),
            count: mapToStock(stock).count,
          }
        : undefined;
    } catch (error) {
      throw new DatabaseException(error.message);
    }
  }

  async createProduct(product: ProductCreateDto): Promise<ProductDto> {
    const productItem = {
      id: uuidv4(),
      title: product.title,
      description: product.description,
      price: product.price,
      created_at: new Date().toISOString(),
    };
    const stockItem = {
      product_id: productItem.id,
      count: product.count,
      created_at: productItem.created_at,
    };
    try {
      const { productContainer, stockContainer } = this.getContainers();
      await Promise.allSettled([
        productContainer.items.create(productItem),
        stockContainer.items.create(stockItem),
      ]);
      return {
        id: productItem.id,
        title: productItem.title,
        description: productItem.description,
        price: productItem.price,
        count: stockItem.count,
      };
    } catch (error) {
      throw new DatabaseException(error.message);
    }
  }

  private getContainers() {
    return {
      productContainer: this.db.container("products"),
      stockContainer: this.db.container("stocks"),
    };
  }
}
