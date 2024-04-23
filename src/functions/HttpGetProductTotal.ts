import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { COMMON_HEADERS } from "../common/api-headers";
import { DbClientFactory } from "../common/db-client-factory";
import { ProductDataService } from "../services/product-data-service";

export async function HttpGetProductTotal(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  try {
    const db = DbClientFactory.getDatabase();
    const products = await new ProductDataService(db).getProducts();
    const result = products.reduce((acc, val) => acc + val.count, 0);
    context.log(`Products total found - "${result}"`);
    return {
      body: JSON.stringify(result),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    context.log(new Date().toISOString(), error.message);
    return { status: 500, body: "Internal Server Error." };
  }
}

app.http("HttpGetProductTotal", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: HttpGetProductTotal,
  route: "products/total",
});
