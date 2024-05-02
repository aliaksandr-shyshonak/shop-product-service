import { app, InvocationContext } from "@azure/functions";

export async function BlobImportProductsFromFile(
  blob: Buffer,
  context: InvocationContext
): Promise<void> {
  context.log(
    `Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`
  );
}

app.storageBlob("BlobImportProductsFromFile", {
  path: "uploaded/{name}",
  connection: "",
  handler: BlobImportProductsFromFile,
});
