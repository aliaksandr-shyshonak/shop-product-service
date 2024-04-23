import { CosmosClient } from "@azure/cosmos";

export class DbClientFactory {
  private static instance: CosmosClient;

  public static getInstance(): CosmosClient {
    if (!DbClientFactory.instance) {
      const key = process.env.COSMOS_KEY;
      const endpoint = process.env.COSMOS_ENDPOINT;
      DbClientFactory.instance = new CosmosClient({ endpoint, key });
    }
    return DbClientFactory.instance;
  }

  public static getDatabase() {
    return DbClientFactory.getInstance().database(process.env.DB_NAME);
  }
}
