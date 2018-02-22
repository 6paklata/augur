import Augur from "augur.js";
import * as Knex from "knex";
import * as sqlite3 from "sqlite3";
import { checkAugurDbSetup } from "./setup/check-augur-db-setup";
import { syncAugurNodeWithBlockchain } from "./blockchain/sync-augur-node-with-blockchain";
import { runServer } from "./server/run-server";

import { NetworkConfiguration } from "augur-core";

// tslint:disable-next-line:no-var-requires
const {augurDbPath, ethereumNodeEndpoints, uploadBlockNumbers } = require("../config");

let db: Knex;
if (process.env.DATABASE_URL) {
  // Be careful about non-serializable transactions. We expect database writes to be processed from the blockchain, serially, in block order.
  db = Knex({
    client: "pg",
    connection: process.env.DATABASE_URL,
  });
} else {
  sqlite3.verbose();
  db = Knex({
    client: "sqlite3",
    connection: {
      filename: augurDbPath,
    },
    acquireConnectionTimeout: 5 * 60 * 1000,
    useNullAsDefault: true,
  });
}

const networkName = process.argv[2] || "environment";
const networkConfig = NetworkConfiguration.create(networkName);

const augur: Augur = new Augur();

augur.rpc.setDebugOptions({ broadcast: false });
augur.events.nodes.ethereum.on("disconnect", () => {
  console.log(("Disconnected from eth node"));
  process.exit(1);
});

const { app, servers }  = runServer(db, augur);

checkAugurDbSetup(db, (err?: Error|null): void => {
  if (err) {
    console.error("checkAugurDbSetup:", err);
    servers.forEach((websocketServer) => websocketServer.close());
    process.exit(1);
  }
  syncAugurNodeWithBlockchain(db, augur, networkConfig, uploadBlockNumbers, (err?: Error|null): void => {
    if (err) {
      console.error("syncAugurNodeWithBlockchain:", err);
      servers.forEach((websocketServer) => websocketServer.close());
      process.exit(1);
    }
    console.log("Sync with blockchain complete.");
  });
});
