import debug from "debug";
import { Server as HttpServer, IncomingMessage, ServerResponse } from "http";
import { Server as HttpsServer } from "https";
import { WebSocket, WebSocketServer } from "ws";
import { WsJsonClient } from "../client/wsJsonClient.js";
import WsJsonServerProxy from "./wsJsonServerProxy.js";

const logger = debug("wsJsonServer");
const DEFAULT_PORT = 8080;
type DefaultHttpsServer = HttpsServer<
  typeof IncomingMessage,
  typeof ServerResponse
>;
type DefaultHttpServer = HttpServer<
  typeof IncomingMessage,
  typeof ServerResponse
>;

/**
 * A WebSocket server that proxies requests to a WsJsonClient client. Incoming messages must be in JSON format and have
 * a "request" property that matches a method on the WsJsonClient interface and an "args" property that is an array of
 * arguments to pass to the method. The response is then forwarded back to the client as a JSON string.
 */
export class WsJsonServer {
  private readonly wss: WebSocketServer;
  private readonly activeClients: Map<WebSocket, WsJsonServerProxy> = new Map();

  constructor(
    private readonly wsJsonClientFactory: () => WsJsonClient,
    private readonly server: DefaultHttpsServer | DefaultHttpServer,
    private readonly port = DEFAULT_PORT,
  ) {
    this.wss = new WebSocketServer({ server: this.server });
  }

  start() {
    const { wss, server, port, wsJsonClientFactory, activeClients } = this;

    wss.on("connection", (ws) => {
      logger("client connected");
      ws.on("error", console.error);
      ws.on("close", () => {
        logger("client disconnected");
        const client = activeClients.get(ws);
        if (client) {
          client.disconnect();
          activeClients.delete(ws);
        } else {
          logger("[warn] client disconnected but no client found");
        }
      });
      activeClients.set(ws, new WsJsonServerProxy(ws, wsJsonClientFactory));
    });

    wss.on("close", function close() {
      logger("server closed");
      activeClients.forEach((proxy) => proxy.disconnect());
    });

    server.listen(port);
    logger(`server started and listening on port ${port}`);
  }
}
