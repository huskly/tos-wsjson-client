import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

export type OptionSeriesQuote = {
  name: string;
  values: {
    IMPLIED_VOLATILITY: number;
    SERIES_EXPECTED_MOVE: number;
  };
};

export type OptionSeriesQuotesSnapshotResponse = {
  series: OptionSeriesQuote[];
};

export default class OptionSeriesQuotesMessageHandler implements WebSocketApiMessageHandler<string> {
  buildRequest(symbol: string): RawPayloadRequest {
    return newPayload({
      header: {
        service: "optionSeries/quotes",
        id: "optionSeriesQuotes",
        ver: 0,
      },
      params: {
        underlying: symbol,
        exchange: "BEST",
        fields: ["IMPLIED_VOLATILITY", "SERIES_EXPECTED_MOVE"],
      },
    });
  }

  service: ApiService = "optionSeries/quotes";
}
