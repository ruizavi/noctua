import type { AnyZodObject, AnyZodTuple, ZodTypeAny } from "zod";
import type { Context } from "../core/request";
import type { RequestArgs, RequestMethod } from "./enums";
import type { BunFile } from "bun";
import { expect } from "vitest";

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
  setHeaders: (key: string, value: string) => string;
}

interface ErrorContext extends Context {
  error: Error;
}

export interface LifeCycle {
  use(ctx: Context, next: () => void): Promise<void>;
}

export interface ErrorHandling {
  handling(context: ErrorContext, next: (error?: any) => void): Promise<void>;
}
