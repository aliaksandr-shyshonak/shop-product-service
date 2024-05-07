import { parse } from "csv-parse";

export async function parseCsv(buffer: Buffer) {
  const parsedData = new Promise((resolve, reject) => {
    const importedItems = [];
    parse(buffer, {
      columns: true,
    })
      .on("data", (data) => importedItems.push(data))
      .on("error", (e) => {
        reject(e);
      })
      .on("end", () => {
        resolve(importedItems);
      });
  });
  return await parsedData;
}
