import { ItemDefinition } from "@azure/cosmos";

export type Stock = {
  product_id: string;
  count: number;
};

export const mapToStock = (item: ItemDefinition) => ({
  product_id: item.product_id,
  count: item.count,
});
