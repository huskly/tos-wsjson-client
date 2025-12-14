import { Disposable } from "../server/disposable.js";
import { ChartRequestParams } from "./services/chartMessageHandler.js";
import { CreateAlertRequestParams } from "./services/createAlertMessageHandler.js";
import { RawLoginResponseBody } from "./services/loginMessageHandler.js";
import { OptionChainDetailsRequest } from "./services/optionChainDetailsMessageHandler.js";
import { OptionQuotesRequestParams } from "./services/optionQuotesMessageHandler.js";
import { PlaceLimitOrderRequestParams } from "./services/placeOrderMessageHandler.js";
import { ParsedPayloadResponse } from "./tdaWsJsonTypes.js";

export interface WsJsonClient extends Disposable {
  authenticateWithAuthCode(
    authCode: string,
  ): Promise<RawLoginResponseBody | null>;

  authenticateWithAccessToken(args: {
    accessToken: string;
    refreshToken: string;
  }): Promise<RawLoginResponseBody | null>;

  isConnected(): boolean;

  isConnecting(): boolean;

  ensureConnected(): void;

  quotes(symbols: string[]): AsyncIterable<ParsedPayloadResponse>;

  accountPositions(accountNumber: string): AsyncIterable<ParsedPayloadResponse>;

  chart(request: ChartRequestParams): AsyncIterable<ParsedPayloadResponse>;

  searchInstruments(query: string): Promise<ParsedPayloadResponse>;

  lookupAlerts(): AsyncIterable<ParsedPayloadResponse>;

  optionChain(symbol: string): Promise<ParsedPayloadResponse>;

  optionChainQuotes(symbol: string): AsyncIterable<ParsedPayloadResponse>;

  optionChainDetails(
    request: OptionChainDetailsRequest,
  ): Promise<ParsedPayloadResponse>;

  optionQuotes(
    request: OptionQuotesRequestParams,
  ): AsyncIterable<ParsedPayloadResponse>;

  placeOrder(
    request: PlaceLimitOrderRequestParams,
  ): Promise<ParsedPayloadResponse>;

  replaceOrder(
    request: Required<PlaceLimitOrderRequestParams>,
  ): Promise<ParsedPayloadResponse>;

  workingOrders(accountNumber: string): AsyncIterable<ParsedPayloadResponse>;

  createAlert(
    request: CreateAlertRequestParams,
  ): Promise<ParsedPayloadResponse>;

  cancelAlert(alertId: number): Promise<ParsedPayloadResponse>;

  cancelOrder(orderId: number): Promise<ParsedPayloadResponse>;

  userProperties(): Promise<ParsedPayloadResponse>;

  marketDepth(symbol: string): AsyncIterable<ParsedPayloadResponse>;

  watchlist(watchlistId: number): Promise<ParsedPayloadResponse>;
}
