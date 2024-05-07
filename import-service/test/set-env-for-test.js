console.log("Setup env variables for test");
const config = require("../local.settings.json");
process.env.CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT =
  config.Values.CONNECTION_IMPORT_FILES_STORAGE_ACCOUNT;
