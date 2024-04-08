import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { PRODUCTS } from "../mocks/products";
import { COMMON_HEADERS } from "../common/api-headers";

export async function HttpGetProductById(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const id = request.params.id;

  const item = PRODUCTS.find((i) => i.id === id);
  context.log(`Product found - "${item?.id}"`);

  if (!item) {
    return { status: 404, body: "Product not found" };
  }
  return {
    body: JSON.stringify({ product: item }),
    headers: COMMON_HEADERS,
  };
}

app.http("HttpGetProductById", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: HttpGetProductById,
  route: "products/{id:guid}",
});
