import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

const ALL_FIELDS = [
  "MARK",
  "MARK_CHANGE",
  "MARK_PERCENT_CHANGE",
  "NET_CHANGE",
  "NET_CHANGE_PERCENT",
  "BID",
  "ASK",
  "BID_SIZE",
  "ASK_SIZE",
  "VOLUME",
  "OPEN",
  "HIGH",
  "LOW",
  "LAST",
  "LAST_SIZE",
  "CLOSE",
] as const;

type FieldType = (typeof ALL_FIELDS)[number];

export type RawPayloadResponseQuotesItem = {
  symbol?: string;
  isDelayed?: boolean;
  values: {
    [key in FieldType]?: number;
  };
};

export type RawPayloadResponseQuotesSnapshot = {
  items: RawPayloadResponseQuotesItem[];
};

export default class QuotesMessageHandler implements WebSocketApiMessageHandler<
  string[]
> {
  buildRequest(symbols: string[]): RawPayloadRequest {
    return newPayload({
      header: { service: "quotes", id: "generalQuotes", ver: 0 },
      params: {
        account: "COMBINED ACCOUNT",
        symbols,
        refreshRate: 300,
        fields: ALL_FIELDS,
      },
    });
  }

  service: ApiService = "quotes";
}
