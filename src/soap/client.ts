import { config } from "../config.js";
import { parseXml } from "../xml/parser.js";

const NAMESPACE = "http://tempuri.org/";

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEnvelope(
  method: string,
  params: Record<string, string | number | undefined>,
): string {
  const paramXml = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<${k}>${escapeXml(String(v))}</${k}>`)
    .join("");

  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"`,
    `  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    `  xmlns:xsd="http://www.w3.org/2001/XMLSchema">`,
    `<soap:Body>`,
    `<${method} xmlns="${NAMESPACE}">`,
    paramXml,
    `</${method}>`,
    `</soap:Body>`,
    `</soap:Envelope>`,
  ].join("\n");
}

function buildEnvelopeWithXml(
  method: string,
  flatParams: Record<string, string | number | undefined>,
  xmlParams: Record<string, string>,
): string {
  const flatXml = Object.entries(flatParams)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<${k}>${escapeXml(String(v))}</${k}>`)
    .join("");

  const rawXml = Object.entries(xmlParams)
    .map(([k, v]) => `<${k}>${v}</${k}>`)
    .join("");

  return [
    `<?xml version="1.0" encoding="utf-8"?>`,
    `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"`,
    `  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`,
    `  xmlns:xsd="http://www.w3.org/2001/XMLSchema">`,
    `<soap:Body>`,
    `<${method} xmlns="${NAMESPACE}">`,
    flatXml,
    rawXml,
    `</${method}>`,
    `</soap:Body>`,
    `</soap:Envelope>`,
  ].join("\n");
}

/**
 * Calls an rs.ge SOAP method.
 * Credentials (su/sp) are prepended automatically.
 * Pass a custom baseUrl for services other than WayBill (e.g. invoice NTOS).
 */
export async function callSoap(
  method: string,
  extraParams: Record<string, string | number | undefined> = {},
  baseUrl?: string,
): Promise<unknown> {
  const params = { su: config.su, sp: config.sp, ...extraParams };
  const envelope = buildEnvelope(method, params);

  const res = await fetch(baseUrl ?? config.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `${NAMESPACE}${method}`,
    },
    body: envelope,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SOAP ${method} failed (${res.status}): ${body}`);
  }

  const xml = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed: any = parseXml(xml);

  const body = parsed?.["Envelope"]?.["Body"] ?? parsed;
  const responseKey = `${method}Response`;
  const response = body?.[responseKey];
  if (!response) return body;

  const resultKey = `${method}Result`;
  const dataKeys = Object.keys(response).filter((k) => !k.startsWith("@_"));

  if (dataKeys.length > 1) {
    return response;
  }

  return response[resultKey] ?? response;
}

/**
 * Calls an rs.ge SOAP method that requires raw XML parameters (e.g. save_waybill).
 * flatParams are escaped; xmlParams are embedded as-is (caller must provide valid XML).
 */
export async function callSoapXml(
  method: string,
  flatParams: Record<string, string | number | undefined>,
  xmlParams: Record<string, string>,
  baseUrl?: string,
): Promise<unknown> {
  const params = { su: config.su, sp: config.sp, ...flatParams };
  const envelope = buildEnvelopeWithXml(method, params, xmlParams);

  const res = await fetch(baseUrl ?? config.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `${NAMESPACE}${method}`,
    },
    body: envelope,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SOAP ${method} failed (${res.status}): ${body}`);
  }

  const xml = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed: any = parseXml(xml);

  const body = parsed?.["Envelope"]?.["Body"] ?? parsed;
  const responseKey = `${method}Response`;
  const response = body?.[responseKey];
  if (!response) return body;

  const resultKey = `${method}Result`;
  const dataKeys = Object.keys(response).filter((k) => !k.startsWith("@_"));

  if (dataKeys.length > 1) {
    return response;
  }

  return response[resultKey] ?? response;
}
