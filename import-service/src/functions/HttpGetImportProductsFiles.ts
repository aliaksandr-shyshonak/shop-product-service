import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { generateSasToken } from "../common/token";

const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "text/plain",
};

export async function HttpGetImportProductsFiles(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const name = request.query.get("name");
  context.log(`Passed file name: "${request.url}"`);

  if (!name) {
    return {
      body: "Bad request. Please pass a file name on the query string",
      status: 400,
      headers: HEADERS,
    };
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    process.env.CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT
  );
  const containerClient = blobServiceClient.getContainerClient("uploaded");
  const blobClient = containerClient.getBlobClient(name);
  context.log(`Prepared blob url "${blobClient.url}"`);

  const sasToken = generateSasToken(
    containerClient.containerName,
    name,
    blobServiceClient.credential as StorageSharedKeyCredential
  ).toString();

  return {
    body: blobClient.url + "?" + sasToken,
    status: 200,
    headers: HEADERS,
  };
}

app.http("HttpGetImportProductsFiles", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: HttpGetImportProductsFiles,
  route: "import",
});
