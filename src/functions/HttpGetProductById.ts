import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { COMMON_HEADERS } from "../common/api-headers";
import { DbClientFactory } from "../common/db-client-factory";
import { Product, ProductDto, Stock } from "../models";

export async function HttpGetProductById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const id = request.params.id;

  let productItem: Product, stockItem: Stock;

  try {
    const db = DbClientFactory.getInstance().database("product-db");
    const productContainer = db.container("products");
    const stockContainer = db.container("stocks");
    const { resource: productResponse } = await productContainer
      .item(id)
      .read();
    productItem = productResponse as Product;
    const { resource: stockResponse } = await stockContainer.item(id).read();
    stockItem = stockResponse as Stock;
  } catch (error) {
    context.log(new Date().toISOString(), error.message);
    return { status: 500, body: "Internal Server Error." };
  }
  if (productItem && stockItem) {
    const product: ProductDto = { ...productItem, count: stockItem.count };
    context.log(`Product found - "${product}"`);
    return {
      body: JSON.stringify({ product }),
      headers: COMMON_HEADERS,
    };
  } else {
    return { status: 404, body: "Product not found" };
  }
}

app.http("HttpGetProductById", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: HttpGetProductById,
  route: "products/{id:guid}",
});
