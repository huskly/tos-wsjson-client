import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

type MarketDepthQuote = {
  name?: string;
  price?: number;
  size?: number;
  index?: number;
};

export type RawPayloadMarketDepthResponse = {
  askQuotes: MarketDepthQuote[];
  bidQuotes: MarketDepthQuote[];
};

export type MarketDepthResponse = {
  service: "market_depth";
  askQuotes: MarketDepthQuote[];
  bidQuotes: MarketDepthQuote[];
};

export default class MarketDepthMessageHandler implements WebSocketApiMessageHandler<string> {
  buildRequest(symbol: string): RawPayloadRequest {
    return newPayload({
      header: {
        service: "market_depth",
        id: "marketDepth-trade-page-chart",
        ver: 0,
      },
      params: { symbol },
    });
  }

  service: ApiService = "market_depth";
}
