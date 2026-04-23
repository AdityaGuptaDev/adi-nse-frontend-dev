import app from "./app";
import controlDB from "./db/core/control-db";
import { initControlDB } from "./db/core/init-control-db";
import environment, {env} from "./environment";
import { createServer, Server } from "http";
import { createServer as secureServer } from "https";

import fs from "fs";

const DEFAULT_PORT = 9075;
const port = Number(process.env.PORT || DEFAULT_PORT);
let server: Server = createServer(app);

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Please stop the process using this port and restart the app.`);
    console.error("Try: netstat -ano | findstr \":9075\" and taskkill /PID <pid> /F");
    process.exit(1);
  }
  throw err;
});

async function run() {
  initControlDB(controlDB);
  server.listen(port, () => {
    console.log(`Http '${environment}' server running on port no: ${port}`);
  });
}

run();
