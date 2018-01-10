import * as express from "express";
import * as WebSocket from "ws";
import * as Knex from "knex";
import Augur from "augur.js";
import { runWebsocketServer } from "./run-websocket-server";
import { getMarkets } from "./getters/get-markets";
import { Address, MarketsRow } from "../types";

// tslint:disable-next-line:no-var-requires
const { websocketConfigs } = require("../../config");

export interface RunServerResult {
  app: express.Application;
  servers: Array<WebSocket.Server>;
}

export function runServer(db: Knex, augur: Augur): RunServerResult {
  const app: express.Application = express();

  const servers: Array<WebSocket.Server> = runWebsocketServer(db, app, websocketConfigs);

  app.get("/", (req, res) => {
    res.send("Hello World");
  });

  app.get("/status", (req, res) => {
    try {
      const networkId: string = augur.rpc.getNetworkID();
      const universe: Address = augur.contracts.addresses[networkId].Universe;

      getMarkets(db, universe, undefined, undefined, undefined, undefined, (err: Error|null, result?: any): void => {
        if (err || result.length === 0) {
          res.send( { status: "down", reason: err || "No markets found", universe });
        } else {
          res.send( { status: "up", universe } );
        }
      });
    } catch (e) {
      res.send({status: "down", reason: e});
    }
  });

  app.get("/status/database", (req, res) => {
    const maxPendingTransactions: number = (typeof req.query.max_pending_transactions === "undefined") ? 1 : parseInt(req.query.max_pending_transactions, 10);
    if (isNaN(maxPendingTransactions)) {
      res.status(400).send({error: "Bad value for max_pending_transactions, must be an integer in base 10"});
    } else {
      res.send({status: (maxPendingTransactions > db.client.pool.waitingClientsCount()) ? "up" : "down", maxPendingTransactions, pendingTransactions: db.client.pool.waitingClientsCount() });
    }
  });

  app.get("/status/blockage", (req, res) => {
    db("blocks").orderBy("blockNumber", "DESC").first().asCallback( (err: Error, newestBlock: any) => {
      if (err) return res.status(500).send({error: err.message });
      const timestampDelta: number = Math.round((Date.now() / 1000) - newestBlock.timestamp);
      const timestampDeltaThreshold = (typeof req.query.time === "undefined") ? 120 : parseInt(req.query.time, 10);
      if ( isNaN(timestampDeltaThreshold) ) {
        res.status(422).send({error: "Bad value for time parameter, must be an integer in base 10"});
      }
      const status = timestampDelta > timestampDeltaThreshold ? "down" : "up";
      return res.status(status === "up" ? 200 : 500).send(Object.assign( {status, timestampDelta}, newestBlock ));
    });
  });

  return { app, servers };
}
