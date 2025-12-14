import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

export type ChartCandles = {
  closes: number[];
  highs: number[];
  lows: number[];
  opens: number[];
  timestamps: number[];
  volumes: number[];
};

export type RawPayloadResponseChart = {
  candles: ChartCandles;
  symbol: string;
};

export type ChartRequestParams = {
  symbol: string;
  timeAggregation: string;
  range: string;
  includeExtendedHours: boolean;
};

export default class ChartMessageHandler implements WebSocketApiMessageHandler<ChartRequestParams> {
  buildRequest({
    symbol,
    timeAggregation,
    range,
    includeExtendedHours,
  }: ChartRequestParams): RawPayloadRequest {
    return newPayload({
      header: { service: "chart", id: "chart-page-chart-1", ver: 1 },
      params: {
        symbol,
        timeAggregation,
        studies: [],
        range,
        extendedHours: includeExtendedHours,
      },
    });
  }

  service: ApiService = "chart";
}
