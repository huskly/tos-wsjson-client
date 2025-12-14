import ws from "ws";
import debug from "debug";
import {
  ProxiedRequest,
  ProxiedResponse,
} from "../client/wsJsonClientProxy.js";
import { WsJsonClient } from "../client/wsJsonClient.js";
import { Disposable } from "./disposable.js";

const logger = debug("wsJsonServerProxy");

/**
 * Sits in between two WebSocket connections and proxies messages between them. The client `downstream` connection is
 * expected to send ProxiedRequest JSON messages with a "request" property that matches a method on the WsJsonClient interface and an
 * "args" property that is an array of arguments to pass to the method. The response from the `upstream`
 * connection is then forwarded back to the `downstream` as a JSON string.
 */
export default class WsJsonServerProxy implements Disposable {
  private upstream?: WsJsonClient;

  constructor(
    private readonly downstream: ws,
    private readonly wsJsonClientFactory: () => WsJsonClient,
  ) {
    downstream.on("error", console.error);
    downstream.on("message", (data: string) => this.onClientMessage(data));
    logger("connected and ready to accept messages");
  }

  disconnect() {
    this.upstream?.disconnect();
    this.downstream.close();
  }

  private onClientMessage = async (data: string) => {
    const msg = JSON.parse(data) as ProxiedRequest;
    logger("⬅️\treceived %O", msg);
    const { request } = msg;
    switch (request) {
      case "authenticateWithAccessToken":
      case "authenticateWithAuthCode": {
        this.upstream = this.wsJsonClientFactory();
        return await this.relayPromise(msg);
      }
      case "quotes":
      case "accountPositions":
      case "chart":
      case "lookupAlerts":
      case "optionChainQuotes":
      case "optionQuotes":
      case "workingOrders":
      case "marketDepth":
        return await this.relayIterable(msg);
      case "createAlert":
      case "cancelAlert":
      case "cancelOrder":
      case "searchInstruments":
      case "userProperties":
      case "watchlist":
      case "optionChain":
      case "optionChainDetails":
      case "replaceOrder":
      case "placeOrder":
        return await this.relayPromise(msg);
      case "disconnect":
        return this.upstream!.disconnect();
    }
  };

  private proxyResponse(msg: ProxiedResponse) {
    this.downstream.send(JSON.stringify(msg));
  }

  private async relayPromise({ request, args }: ProxiedRequest) {
    const upstream = this.ensureConnected();
    try {
      const response = await upstream[request](args as never);
      this.proxyResponse({ request, args, response });
    } catch (e) {
      this.proxyResponse({ request, args, response: e });
    }
  }

  private async relayIterable({ request, args }: ProxiedRequest) {
    const upstream = this.ensureConnected();
    for await (const response of upstream[request](
      args as never,
    ) as AsyncIterable<any>) {
      this.proxyResponse({ request, args, response });
    }
  }

  private ensureConnected(): WsJsonClient {
    if (!this.upstream) {
      throw new Error("Not connected");
    }
    return this.upstream!;
  }
}
