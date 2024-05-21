import { app, InvocationContext } from "@azure/functions";

export async function WrongPriceServiceBusImportProduct(
  message: unknown,
  context: InvocationContext
): Promise<void> {
  context.log("Item has wrong price - ", message);
}

app.serviceBusTopic("WrongPriceServiceBusImportProduct", {
  connection: "CONNECTION_SERVICE_BUS",
  topicName: process.env.IMPORT_PRODUCT_TOPIC,
  subscriptionName: "sbs-wrong-product-import-subscription-ne-001",
  handler: WrongPriceServiceBusImportProduct,
});
