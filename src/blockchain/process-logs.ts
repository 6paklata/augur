import Augur from "augur.js";
import { eachSeries } from "async";
import * as Knex from "knex";
import { FormattedEventLog, EventLogProcessor, ErrorCallback } from "../types";

export function processLog(db: Knex, augur: Augur, log: FormattedEventLog, logProcessor: EventLogProcessor, callback: ErrorCallback): void {
  (!log.removed ? logProcessor.add : logProcessor.remove)(db, augur, log, callback);
}

export function processLogs(db: Knex, augur: Augur, logs: Array<FormattedEventLog>, logProcessor: EventLogProcessor, callback: ErrorCallback): void {
  eachSeries(logs, (log: FormattedEventLog, nextLog: ErrorCallback): void => processLog(db, augur, log, logProcessor, nextLog), callback);
}
