import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { PRODUCTS } from "../mocks/products";
import { COMMON_HEADERS } from "../common/api-headers";

export async function HttpGetProductList(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  return {
    body: JSON.stringify(PRODUCTS),
    headers: COMMON_HEADERS,
  };
}

app.http("HttpGetProductList", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: HttpGetProductList,
  route: "products",
});
