import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { COMMON_HEADERS } from "../common/api-headers";
import { DbClientFactory } from "../common/db-client-factory";
import { ProductDataService } from "../services/product-data-service";

export async function HttpGetProductList(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  try {
    const db = DbClientFactory.getDatabase();
    const products = await new ProductDataService(db).getProducts();
    context.log(`Products found - "${products.length}"`);
    return {
      body: JSON.stringify(products),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    context.log(new Date().toISOString(), error.message);
    return { status: 500, body: "Internal Server Error." };
  }
}

app.http("HttpGetProductList", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: HttpGetProductList,
  route: "products",
});
