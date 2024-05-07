import { HttpRequest, InvocationContext } from "@azure/functions";
import { describe, expect, test } from "@jest/globals";
import { HttpGetImportProductsFiles } from "./HttpGetImportProductsFiles";

describe("HttpGetImportProductsFiles", () => {
  test("fail if not file name provided", async () => {
    const context = new InvocationContext({
      functionName: "HttpGetImportProductsFiles",
    });
    const request = new HttpRequest({
      url: "http://localhost/import",
      method: "get",
    });
    expect(await HttpGetImportProductsFiles(request, context)).toHaveProperty(
      "status",
      400
    );
  });

  test("get sas token if file name provided", async () => {
    const context = new InvocationContext({
      functionName: "HttpGetImportProductsFiles",
    });
    const request = new HttpRequest({
      url: "http://localhost/import?name=products.csv",
      method: "get",
    });
    const response = await HttpGetImportProductsFiles(request, context);
    expect(response).toHaveProperty("status", 200);
    expect(response.body).toMatch(/uploaded\/products.csv/);
  });
});
