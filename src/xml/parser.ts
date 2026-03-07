import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  parseTagValue: true,
  trimValues: true,
});

export function parseXml<T = unknown>(xml: string): T {
  return parser.parse(xml) as T;
}
