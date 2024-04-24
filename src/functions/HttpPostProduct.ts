import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { COMMON_HEADERS } from "../common/api-headers";
import { DbClientFactory } from "../common/db-client-factory";
import { ProductCreateDto } from "../models";
import { ProductDataService } from "../services/product-data-service";

export async function HttpPostProduct(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  let newProduct: ProductCreateDto;

  try {
    newProduct = (await request.json()) as ProductCreateDto;
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
  try {
    const db = DbClientFactory.getInstance().database("product-db");
    const product = await new ProductDataService(db).createProduct(newProduct);
    context.log("Success transaction for putting Product and Stock");
    return {
      body: JSON.stringify(product),
      headers: COMMON_HEADERS,
    };
  } catch (e) {
    context.log("Error to put items", e.message);
    return { status: 500, body: "Internal Server Error." };
  }
}

app.http("HttpPostProduct", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: HttpPostProduct,
  route: "products",
});
