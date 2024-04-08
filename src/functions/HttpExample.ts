import { AppConfigurationClient } from "@azure/app-configuration";
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

const CONNECTION_STRING = process.env.AZURE_APP_CONFIG_CONNECTION_STRING;

export async function HttpExample(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  let configValue;

  try {
    const client = new AppConfigurationClient(CONNECTION_STRING);
    const configs = await client.getConfigurationSetting({
      key: "NAME_FROM_APP_CONFIG",
    });
    configValue = configs.value;
  } catch (e) {
    context.log("Fail to get config");
  }

  const name =
    request.query.get("name") ||
    (await request.text()) ||
    configValue ||
    "world";

  return { body: `Hello, ${name}!` };
}

app.http("HttpExample", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: HttpExample,
  route: "example",
});
