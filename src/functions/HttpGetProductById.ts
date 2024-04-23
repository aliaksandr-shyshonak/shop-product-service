import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { COMMON_HEADERS } from "../common/api-headers";
import { DbClientFactory } from "../common/db-client-factory";
import { ProductDataService } from "../services/product-data-service";

export async function HttpGetProductById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const id = request.params.id;

  try {
    const db = DbClientFactory.getDatabase();
    const product = await new ProductDataService(db).getProductById(id);
    context.log(`Product found - "${JSON.stringify(product)}"`);
    if (!product) {
      return { status: 404, body: "Product not found" };
    }
    return {
      body: JSON.stringify({ product }),
      headers: COMMON_HEADERS,
    };
  } catch (error) {
    context.log(new Date().toISOString(), error.message);
    return { status: 500, body: "Internal Server Error." };
  }
}

app.http("HttpGetProductById", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: HttpGetProductById,
  route: "products/{id:guid}",
});
