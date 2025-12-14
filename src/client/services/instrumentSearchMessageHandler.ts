import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { newRandomId } from "../util.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";

export type RawPayloadResponseInstrumentSearch = {
  instruments: InstrumentSearchMatch[];
};

export type InstrumentSearchMatch = {
  symbol: string;
  displaySymbol: string;
  description: string;
};

type InstrumentSearchRequest = {
  query: string;
  limit?: number;
};

export default class InstrumentSearchMessageHandler implements WebSocketApiMessageHandler<InstrumentSearchRequest> {
  buildRequest({
    query,
    limit = 5,
  }: InstrumentSearchRequest): RawPayloadRequest {
    const id = newRandomId();
    return {
      payload: [
        {
          header: {
            service: "instrument_search",
            ver: 0,
            id: `searchForSymbol-${id}`,
          },
          params: { limit, pattern: query },
        },
      ],
    };
  }

  service: ApiService = "instrument_search";
}
