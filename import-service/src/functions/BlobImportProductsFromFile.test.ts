import { InvocationContext } from "@azure/functions";
import { describe, expect, jest, test } from "@jest/globals";
import { BlobImportProductsFromFile } from "./BlobImportProductsFromFile";

describe("BlobImportProductsFromFile", () => {
  test("parse csv file", async () => {
    const context = new InvocationContext({
      functionName: "HttpGetImportProductsFiles",
      triggerMetadata: {
        name: "products.csv",
      },
    });
    const logSpy = jest.spyOn(context, "log");

    const buffer = Buffer.from(
      `title,description,price,count
Age of Wonders 4,"Rule a fantasy realm!",35.99,100`,
      "utf8"
    );
    await BlobImportProductsFromFile(buffer, context);

    expect(logSpy).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining(`${buffer.length} bytes`)
    );
    expect(logSpy).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        title: "Age of Wonders 4",
      })
    );
  });

  test("parse empty csv file", async () => {
    const context = new InvocationContext({
      functionName: "HttpGetImportProductsFiles",
      triggerMetadata: {
        name: "products.csv",
      },
    });
    const logSpy = jest.spyOn(context, "log");

    const buffer = Buffer.from("", "utf8");
    await BlobImportProductsFromFile(buffer, context);

    expect(logSpy).toHaveBeenNthCalledWith(2, "No items found.");
  });
});
