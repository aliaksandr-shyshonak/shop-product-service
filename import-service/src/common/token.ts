import {
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

export function generateSasToken(
  containerName: string,
  blobName: string,
  credential: StorageSharedKeyCredential
): string {
  const now = new Date();
  const expireOn = new Date(now.valueOf() + 10 * 60 * 1000);
  const sasOptions = {
    containerName,
    blobName,
    startsOn: now,
    expiresOn: expireOn,
    permissions: BlobSASPermissions.parse("rw"),
  };

  return generateBlobSASQueryParameters(sasOptions, credential).toString();
}
