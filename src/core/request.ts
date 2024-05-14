import type { Server } from "bun";

type KeyValue<T = unknown> = Record<string, T>;

export interface Context {
  headers: KeyValue;
  method: string;
  params: KeyValue<number>;
  queryParams: KeyValue<string | null>;
  path: string;
  url: string;
  hostname: string;
  json?: unknown;
}

interface GenerateContext {
  params: KeyValue<number>;
  values?: Array<string>;
  request: Request;
  url: URL;
  hostname: string;
  json: unknown;
}

export function assocParams(
  params: Record<string, number>,
  values?: Array<string>
) {
  const assoc: Record<string, any> = {};

  for (const [name, posicion] of Object.entries(params)) {
    assoc[name] = values?.[posicion - 1] || null;
  }

  return assoc;
}

export function assocHeaders(headers: Headers) {
  const assoc: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    assoc[key] = value;
  }

  return assoc;
}

export function assocQuery(search: string) {
  const currentSearch = search.replace("?", "");

  const entries = currentSearch.split("&");

  const queryParams: Record<string, string | null> = {};

  for (const query of entries) {
    const [key, value]: Array<string> = query.split("=");

    queryParams[key] = value || null;
  }

  return queryParams;
}

export async function generateContext({
  params,
  values,
  request,
  url,
  hostname,
  json,
}: GenerateContext): Promise<Context> {
  const { headers, method } = request;

  const assoc = assocParams(params, values);
  const headersAssoc = assocHeaders(headers);
  const queryParams = assocQuery(url.search);

  return {
    params: assoc,
    method,
    url: url.toString(),
    path: url.pathname,
    headers: headersAssoc,
    queryParams,
    hostname,
    json,
  };
}
