import type { AnyZodObject, AnyZodTuple, ZodTypeAny } from "zod";
import type { Context } from "../core/request";
import type { RequestArgs, RequestMethod } from "./enums";

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

export type Handler = (ctx: Context) => Promise<unknown>;
