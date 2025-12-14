import debug from "debug";
import WebSocket from "isomorphic-ws";
import { isString } from "lodash-es";
import {
  BufferedIterator,
  deferredWrap,
  MulticastIterator,
  Observable,
} from "obgen";
import { ChannelState } from "./realWsJsonClient.js";
import { ChartRequestParams } from "./services/chartMessageHandler.js";
import { CreateAlertRequestParams } from "./services/createAlertMessageHandler.js";
import { RawLoginResponseBody } from "./services/loginMessageHandler.js";
import { OptionChainDetailsRequest } from "./services/optionChainDetailsMessageHandler.js";
import { OptionQuotesRequestParams } from "./services/optionQuotesMessageHandler.js";
import { PlaceLimitOrderRequestParams } from "./services/placeOrderMessageHandler.js";
import { ParsedPayloadResponse } from "./tdaWsJsonTypes.js";
import { WsJsonClient } from "./wsJsonClient.js";

const logger = debug("wsClientProxy");

export const ALL_REQUESTS = [
  "authenticateWithAuthCode",
  "authenticateWithAccessToken",
  "optionChainQuotes",
  "disconnect",
  "quotes",
  "accountPositions",
  "chart",
  "searchInstruments",
  "lookupAlerts",
  "optionChain",
  "optionChainQuotes",
  "optionChainDetails",
  "optionQuotes",
  "placeOrder",
  "replaceOrder",
  "workingOrders",
  "createAlert",
  "cancelAlert",
  "cancelOrder",
  "userProperties",
  "marketDepth",
  "watchlist",
] as const;
type RequestType = typeof ALL_REQUESTS;
export type Request = RequestType[number];

export type ProxiedRequest = {
  request: Request;
  args?: any;
};

export type ProxiedResponse = ProxiedRequest & { response: unknown };

// A WsJsonClient proxy implementation that proxies requests to a WebSocket server using the provided `proxyUrl`.
export class WsJsonClientProxy implements WsJsonClient {
  private state = ChannelState.DISCONNECTED;
  private buffer = new BufferedIterator<ProxiedResponse>();
  private iterator = new MulticastIterator(this.buffer);
  private socket?: WebSocket;

  constructor(
    private readonly proxyUrl: string,
    private readonly options?: any,
  ) {}

  authenticateWithAuthCode(
    authCode: string,
  ): Promise<RawLoginResponseBody | null> {
    return this.authenticate("authenticateWithAuthCode", authCode);
  }

  authenticateWithAccessToken(args: {
    accessToken: string;
    refreshToken: string;
  }): Promise<RawLoginResponseBody | null> {
    return this.authenticate("authenticateWithAccessToken", args);
  }

  private authenticate(
    method: "authenticateWithAuthCode" | "authenticateWithAccessToken",
    args: string | { accessToken: string; refreshToken: string },
  ): Promise<RawLoginResponseBody | null> {
    this.socket = new WebSocket(this.proxyUrl, this.options);
    this.state = ChannelState.CONNECTING;
    this.buffer = new BufferedIterator<ProxiedResponse>();
    this.iterator = new MulticastIterator(this.buffer);
    const { buffer, socket } = this;
    return new Promise((resolve, reject) => {
      socket.onmessage = ({ data }) => {
        // make sure date objects are reconstructed across the wire
        const parsedMsg = JSON.parse(data as string, dateReviver);
        buffer.emit(parsedMsg as ProxiedResponse);
      };
      socket.onopen = () => {
        logger("proxy ws connection opened");
        this.state = ChannelState.CONNECTED;
        this.doAuthenticate(method, args).then((res) => {
          logger("proxy ws authentication response: %O", res);
          if (isString(res) && res.includes("NOT_AUTHORIZED")) {
            reject(res);
          } else {
            resolve(res);
          }
        });
      };
      socket.onclose = (event) => {
        this.state = ChannelState.DISCONNECTED;
        logger("proxy ws connection closed: ", event?.reason);
        reject(event?.reason);
      };
      socket.onerror = (err) => {
        this.state = ChannelState.ERROR;
        logger("proxy ws socket error: %O", err);
        reject(err);
      };
    });
  }

  private doAuthenticate(
    method: "authenticateWithAuthCode" | "authenticateWithAccessToken",
    args: string | { accessToken: string; refreshToken: string },
  ): Promise<RawLoginResponseBody | null> {
    return this.dispatch<RawLoginResponseBody | null>(method, args).promise();
  }

  accountPositions(
    accountNumber: string,
  ): AsyncIterable<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "accountPositions",
      accountNumber,
    ).iterable();
  }

  cancelAlert(alertId: number): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "cancelAlert",
      alertId,
    ).promise();
  }

  cancelOrder(orderId: number): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "cancelOrder",
      orderId,
    ).promise();
  }

  chart(request: ChartRequestParams): AsyncIterable<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>("chart", request).iterable();
  }

  createAlert(
    request: CreateAlertRequestParams,
  ): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "createAlert",
      request,
    ).promise();
  }

  disconnect(): void {
    this.sendMessage({ request: "disconnect" });
  }

  ensureConnected(): void {
    if (this.state !== ChannelState.CONNECTED) {
      throw new Error("Not connected");
    }
  }

  isConnected(): boolean {
    return this.state === ChannelState.CONNECTED;
  }

  isConnecting(): boolean {
    return this.state === ChannelState.CONNECTING;
  }

  lookupAlerts(): AsyncIterable<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>("lookupAlerts").iterable();
  }

  marketDepth(symbol: string): AsyncIterable<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "marketDepth",
      symbol,
    ).iterable();
  }

  optionChain(symbol: string): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "optionChain",
      symbol,
    ).promise();
  }

  optionChainDetails(
    request: OptionChainDetailsRequest,
  ): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "optionChainDetails",
      request,
    ).promise();
  }

  optionChainQuotes(symbol: string): AsyncIterable<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "optionChainQuotes",
      symbol,
    ).iterable();
  }

  optionQuotes(
    request: OptionQuotesRequestParams,
  ): AsyncIterable<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "optionQuotes",
      request,
    ).iterable();
  }

  placeOrder(
    request: PlaceLimitOrderRequestParams,
  ): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "placeOrder",
      request,
    ).promise();
  }

  quotes(symbols: string[]): AsyncIterable<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>("quotes", symbols).iterable();
  }

  replaceOrder(
    request: Required<PlaceLimitOrderRequestParams>,
  ): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "replaceOrder",
      request,
    ).promise();
  }

  searchInstruments(query: string): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "searchInstruments",
      query,
    ).promise();
  }

  userProperties(): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>("userProperties").promise();
  }

  watchlist(watchlistId: number): Promise<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "watchlist",
      watchlistId,
    ).promise();
  }

  workingOrders(accountNumber: string): AsyncIterable<ParsedPayloadResponse> {
    return this.dispatch<ParsedPayloadResponse>(
      "workingOrders",
      accountNumber,
    ).iterable();
  }

  private sendMessage(request: ProxiedRequest) {
    this.ensureConnected();
    this.socket!.send(JSON.stringify(request));
  }

  private dispatch<T>(req: Request, args?: any): Observable<T> {
    this.sendMessage({ request: req, args });
    return deferredWrap<ProxiedResponse>(() => this.iterator)
      .filter(({ request }) => request === req)
      .map(({ response }) => response as T);
  }
}

function dateReviver(_: string, value: any): any {
  if (typeof value === "string") {
    // Regular expression to check if the string matches ISO 8601 date format
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    if (isoDateRegex.test(value)) {
      return new Date(value);
    }
  }
  return value; // return the value unchanged if not a date string
}
