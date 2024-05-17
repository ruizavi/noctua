import type { AnyZodObject, AnyZodTuple, ZodTypeAny } from "zod";
import type { Context } from "../core/request";
import type { RequestArgs, RequestMethod } from "./enums";
import type { BunFile } from "bun";

export interface RouteDefinition {
  [key: string | symbol]: {
    path: string;
    descriptor: any;
    method: RequestMethod;
  };
}

export interface Args<T extends ZodTypeAny | AnyZodObject | AnyZodTuple> {
  [key: string]: {
    type: RequestArgs;
    index: number;
    data?: string;
    validator: T;
  };
}

interface HandlerResponse {
  file?: BunFile;
  json?: unknown;
  headers?: { [key: string]: string };
  status?: number;
  statusText?: string;
}

export type Handler = (ctx: Context) => Promise<HandlerResponse>;

export interface Response {
  setStatusText: (text: string) => string;
  setStatus: (code: number) => number;
  setHeaders: (key: string, value: string) => Record<string, string>;
}
