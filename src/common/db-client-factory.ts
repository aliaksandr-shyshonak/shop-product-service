import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";

export class DbClientFactory {
  private static instance: CosmosClient;

  public static getInstance(): CosmosClient {
    if (!DbClientFactory.instance) {
      const endpoint = process.env.COSMOS_ENDPOINT;
      // const key = process.env.COSMOS_KEY;
      // DbClientFactory.instance = new CosmosClient({ endpoint, key });
      const aadCredentials = new DefaultAzureCredential();
      DbClientFactory.instance = new CosmosClient({ endpoint, aadCredentials });
    }
    return DbClientFactory.instance;
  }

  public static getDatabase() {
    return DbClientFactory.getInstance().database(process.env.DB_NAME);
  }
}
