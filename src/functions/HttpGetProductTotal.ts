import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { COMMON_HEADERS } from "../common/api-headers";
import { DbClientFactory } from "../common/db-client-factory";
import { Product, Stock } from "../models";

export async function HttpGetProductList(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  let products: Product[], stocks: Stock[];

  try {
    const db = DbClientFactory.getInstance().database("product-db");
    const productContainer = db.container("products");
    const stockContainer = db.container("stocks");
    const { resources: productResponse } = await productContainer.items
      .readAll()
      .fetchAll();
    products = Array.from(productResponse) as Product[];
    const { resources: stockResponse } = await stockContainer.items
      .readAll()
      .fetchAll();
    stocks = Array.from(stockResponse) as Stock[];
  } catch (error) {
    context.log(new Date().toISOString(), error.message);
    return { status: 500, body: "Internal Server Error." };
  }

  if (products && stocks) {
    const result = products
      .map((p: Product) => ({
        ...p,
        count: stocks.find((s) => s.product_id === p.id)?.count,
      }))
      .reduce((acc, val) => acc + val.count, 0);
    context.log(`Products total found - "${result}"`);
    return {
      body: JSON.stringify(result),
      headers: COMMON_HEADERS,
    };
  } else {
    return { status: 404, body: "Products not found" };
  }
}

app.http("HttpGetProductList", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: HttpGetProductList,
  route: "products",
});
