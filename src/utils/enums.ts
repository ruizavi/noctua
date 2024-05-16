export enum MetadataKey {
  Controller,
  Routes,
  Domain,
  Args,
}

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  ALL = "ALL",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  SEARCH = "SEARCH",
}

export enum RequestArgs {
  Context,
  Body,
  Param,
  Query,
  Path,
  Url,
  Hostname,
  Headers,
  Method,
}
