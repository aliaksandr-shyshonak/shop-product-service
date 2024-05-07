import { InvocationContext } from "@azure/functions";
import {
  BlobDeleteResponse,
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { generateSasToken } from "../common/token";

export async function copyToContainer(
  context: InvocationContext,
  source: string,
  target: string
): Promise<void> {
  const file = String(context.triggerMetadata.name);
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      process.env.CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT
    );
    const uploadedContainerClient =
      blobServiceClient.getContainerClient(source);
    const sourceBlob = uploadedContainerClient.getBlobClient(file);
    const parsedContainerClient = blobServiceClient.getContainerClient(target);
    const targetBlob = parsedContainerClient.getBlobClient(file);
    const sasToken = generateSasToken(
      sourceBlob.containerName,
      sourceBlob.name,
      sourceBlob.credential as StorageSharedKeyCredential
    ).toString();
    const sourceBlobSASURL: string = sourceBlob.url + "?" + sasToken;

    const copyPoller = await targetBlob.beginCopyFromURL(sourceBlobSASURL);
    await copyPoller.pollUntilDone();
    context.log(`${file} copied to ${target} folder.`);
    const blobDeleteResponse: BlobDeleteResponse = await sourceBlob.delete({
      deleteSnapshots: "include",
    });
    if (!blobDeleteResponse.errorCode) {
      context.log(`${file} was deleted from ${source} folder.`);
    }
  } catch (e) {
    context.log("Failed to move file", e.message);
  }
}
