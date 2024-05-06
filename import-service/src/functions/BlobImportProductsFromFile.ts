import { app, InvocationContext } from "@azure/functions";
import {
  BlobDeleteResponse,
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { parse } from "csv-parse";
import { generateSasToken } from "../common/token";

export async function BlobImportProductsFromFile(
  blob: Buffer,
  context: InvocationContext
): Promise<void> {
  context.log(
    `Storage blob function processed blob "${context.triggerMetadata.name}" with size ${blob.length} bytes`
  );
  try {
    const parsedData = new Promise((resolve, reject) => {
      const importedItems = [];
      parse(blob, {
        columns: true,
      })
        .on("data", (data) => importedItems.push(data))
        .on("error", (e) => {
          context.log("Failed to parse file - ", e.message);
          reject(e);
        })
        .on("end", () => {
          resolve(importedItems);
        });
    });
    const result = await parsedData;
    if (Array.isArray(result)) {
      for (const item of result) {
        JSON.stringify(item);
        context.log(item);
      }
    } else {
      context.log("No items found.");
    }
  } catch (e) {
    context.log("Fail to parse blob - ", e.message);
  }
  await copyToParsedFolder(context);
}

async function copyToParsedFolder(context: InvocationContext): Promise<void> {
  const file = String(context.triggerMetadata.name);
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT
    );
    const uploadedContainerClient =
      blobServiceClient.getContainerClient("uploaded");
    const sourceBlob = uploadedContainerClient.getBlobClient(file);
    const parsedContainerClient =
      blobServiceClient.getContainerClient("parsed");
    const targetBlob = parsedContainerClient.getBlobClient(file);
    const sasToken = generateSasToken(
      sourceBlob.containerName,
      sourceBlob.name,
      sourceBlob.credential as StorageSharedKeyCredential
    ).toString();
    const sourceBlobSASURL: string = sourceBlob.url + "?" + sasToken;

    const copyPoller = await targetBlob.beginCopyFromURL(sourceBlobSASURL);
    await copyPoller.pollUntilDone();
    context.log(`${file} copied to parsed folder.`);
    const blobDeleteResponse: BlobDeleteResponse = await sourceBlob.delete({
      deleteSnapshots: "include",
    });
    if (!blobDeleteResponse.errorCode) {
      context.log(`${file} was deleted from uploaded folder.`);
    }
  } catch (e) {
    context.log("Failed to move file", e.message);
  }
}

app.storageBlob("BlobImportProductsFromFile", {
  path: "uploaded/{name}",
  connection: "CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT",
  handler: BlobImportProductsFromFile,
});
