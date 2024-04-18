import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { v4 as uuidv4 } from "uuid";
import { COMMON_HEADERS } from "../common/api-headers";
import { DbClientFactory } from "../common/db-client-factory";
import { ProductPostBody } from "../models";

export async function HttpPostProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  let newProduct: ProductPostBody;

  try {
    newProduct = (await request.json()) as ProductPostBody;
    if (
      !newProduct.title ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.count
    ) {
      return { status: 400, body: "Bad request." };
    }
  } catch (error) {
    context.log("Fail to parse body", await request.text());
    return { status: 400, body: "Bad request." };
  }
  const productItem = {
    id: uuidv4(),
    title: newProduct.title,
    description: newProduct.description,
    price: newProduct.price,
    created_at: new Date().toISOString(),
  };
  const stockItem = {
    product_id: productItem.id,
    count: newProduct.count,
    created_at: productItem.created_at,
  };
  try {
    const db = DbClientFactory.getInstance().database("product-db");
    const productContainer = db.container("products");
    const stockContainer = db.container("stocks");
    await Promise.allSettled([
      productContainer.items.create(productItem),
      stockContainer.items.create(stockItem),
    ]);
    context.log("Success transaction for putting Product and Stock");
  } catch (e) {
    context.log("Error to put items", e.message);
    return { status: 500, body: "Internal Server Error." };
  }
  return {
    body: JSON.stringify({ ...productItem, count: stockItem.count }),
    headers: COMMON_HEADERS,
  };
}

app.http("HttpPostProduct", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: HttpPostProduct,
  route: "products",
});
