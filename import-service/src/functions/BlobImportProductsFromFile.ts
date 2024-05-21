import { app, InvocationContext } from "@azure/functions";
import { ServiceBusClient } from "@azure/service-bus";
import { copyToContainer } from "../utils/copyToContainer";
import { parseCsv } from "../utils/parseCsv";

export async function BlobImportProductsFromFile(
  blob: Buffer,
  context: InvocationContext
): Promise<void> {
  context.log(
    `Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`
  );
  try {
    const result = await parseCsv(blob);
    const serviceBusClient = new ServiceBusClient(
      process.env.CONNECTION_SERVICE_BUS
    );
    const sender = serviceBusClient.createSender(
      process.env.IMPORT_PRODUCT_TOPIC
    );
    if (Array.isArray(result) && result.length > 0) {
      for (const item of result) {
        const message = JSON.stringify(item);
        context.log(`Send message - ${message}`);
        await sender.sendMessages({ body: message });
      }
    } else {
      context.log("No items found.");
    }
  } catch (e) {
    context.log(`Fail to parse blob - ${e.message}`);
  }
  await copyToContainer(context, "uploaded", "parsed");
}

app.storageBlob("BlobImportProductsFromFile", {
  path: "uploaded/{name}",
  connection: "CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT",
  handler: BlobImportProductsFromFile,
});
