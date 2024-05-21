import { app, InvocationContext } from "@azure/functions";
import { DbClientFactory } from "../common/db-client-factory";
import { ProductDataService } from "../services/product-data-service";

export async function ServiceBusImportProduct(
  message: unknown,
  context: InvocationContext
): Promise<void> {
  context.log("Service bus topic function processed message:", message);
  try {
    const newProduct =
      typeof message === "string" ? JSON.parse(String(message)) : message;
    const db = DbClientFactory.getInstance().database(process.env.DB_NAME);
    if (
      !newProduct.title ||
      !newProduct.description ||
      !newProduct.price ||
      !newProduct.count
    ) {
      context.log(`Wrong item : ${newProduct}`);
      return;
    }
    await new ProductDataService(db).createProduct(newProduct);
    context.log("Success transaction for putting Product and Stock");
  } catch (e) {
    context.log("Error to put items", e.message);
  }
}

app.serviceBusTopic("ServiceBusImportProduct", {
  connection: "CONNECTION_SERVICE_BUS",
  topicName: process.env.IMPORT_PRODUCT_TOPIC,
  subscriptionName: process.env.IMPORT_PRODUCT_SUBSCRIPTION,
  handler: ServiceBusImportProduct,
});
