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
  body?: unknown;
}

interface GenerateContext {
  params: KeyValue<number>;
  values?: Array<string>;
  request: Request;
  server: Server;
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

export const bodyAssoc = async (req: Request) => {
  const contentType = req.headers.get("content-type");

  if (!contentType) return {};

  if (contentType.includes("text/plain")) {
    return await req.text();
  }

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();

    const body: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      body[key] = value;
    }

    return body;
  }

  if (contentType.includes("application/json")) {
    return await req.json();
  }
};

export const generateContext = async ({
  params,
  values,
  request,
  server,
}: GenerateContext): Promise<Context> => {
  const url = new URL(request.url);

  const assoc = assocParams(params, values);
  const headersAssoc = assocHeaders(request.headers);
  const queryParams = assocQuery(url.search);

  const body = await bodyAssoc(request);

  return {
    params: assoc,
    method: request.method,
    url: url.toString(),
    path: url.pathname,
    headers: headersAssoc,
    queryParams,
    hostname: server.hostname,
    body,
  };
};
