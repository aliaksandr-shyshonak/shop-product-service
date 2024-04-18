import "dotenv/config";
import { CosmosClient } from "@azure/cosmos";
import PRODUCT_LIST from "./games.json" assert { type: "json" };

const key = process.env.COSMOS_KEY;
const endpoint = process.env.COSMOS_ENDPOINT;

const cosmosClient = new CosmosClient({ endpoint, key });
const database = cosmosClient.database("product-db");
const productContainer = database.container("products");
const stockContainer = database.container("stocks");

async function initData() {
  for (const product of PRODUCT_LIST) {
    const productItem = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,
      created_at: new Date().toISOString(),
    };
    const stockItem = {
      product_id: product.id,
      count: product.count,
      created_at: new Date().toISOString(),
    };
    try {
      await productContainer.items.create(productItem);
      await stockContainer.items.create(stockItem);
      console.log(`Created product with id: ${productItem.id}`);
    } catch (err) {
      console.error("Error running the seeder script:", err.message);
    }
  }

  console.log("Seeding completed.");
}

initData();
