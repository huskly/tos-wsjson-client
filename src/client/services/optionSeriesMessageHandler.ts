import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { newRandomId } from "../util.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";

export type OptionSeriesItem = {
  // symbol
  underlying: string;
  // "19 JAN 24 100"
  name: string;
  spc: number;
  multiplier: number;
  // eg "REGULAR"
  expirationStyle: string;
  isEuropean: boolean;
  // eg "2024-01-20T12:00:00Z"
  expiration: string;
  lastTradeDate: string;
  settlementType: string; // likely AM or PM
};

export type RawOptionSeriesResponse = {
  series: OptionSeriesItem[];
};

export default class OptionSeriesMessageHandler implements WebSocketApiMessageHandler<string> {
  buildRequest(symbol: string): RawPayloadRequest {
    const id = newRandomId();
    return {
      payload: [
        {
          header: {
            id: `option-series-${id}`,
            service: "optionSeries",
            ver: 0,
          },
          params: { underlying: symbol },
        },
      ],
    };
  }

  service: ApiService = "optionSeries";
}
