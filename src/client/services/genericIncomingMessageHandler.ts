import {
  ParsedPayloadResponse,
  RawPayloadResponse,
} from "../tdaWsJsonTypes.js";
import pkg, { Operation } from "fast-json-patch";
const { applyPatch } = pkg;

type StoredData = Record<string, any>;

export default class GenericIncomingMessageHandler {
  private readonly dataStore: Record<string, StoredData> = {};

  parseResponse({ payload }: RawPayloadResponse): ParsedPayloadResponse[] {
    if (!payload) return [];
    const parsed: ParsedPayloadResponse[] = [];
    for (const entry of payload) {
      const { service, id, ver, type } = entry.header;
      const storeKey = `${service}_${id}_${ver}`;
      if (type === "snapshot") {
        this.dataStore[storeKey] = entry.body;
        parsed.push({ service, body: entry.body });
      } else if (type === "patch") {
        const existingObject = this.dataStore[storeKey] || {};
        const body = entry.body as unknown as { patches: Operation[] };
        const patches = body["patches"];
        const { newDocument } = applyPatch(
          existingObject,
          patches,
          /* validateOperation */ false,
        );
        this.dataStore[storeKey] = newDocument;
        parsed.push({ service, body: newDocument });
      } else {
        console.warn(`Unknown message type: ${type}`);
      }
    }
    return parsed;
  }
}
