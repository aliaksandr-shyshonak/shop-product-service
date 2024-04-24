import { ItemDefinition } from "@azure/cosmos";
import { Stock } from "./stock";

export type Product = {
  id: string;
  price: number;
  title: string;
  description: string;
};

export type ProductDto = Product & Omit<Stock, "product_id">;
export type ProductCreateDto = Omit<ProductDto, "id">;

export const mapToProduct = (item: ItemDefinition) => ({
  id: item.id,
  price: item.price,
  title: item.title,
  description: item.description,
});
