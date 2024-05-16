import type { Context } from "../core/request";
import type { RequestMethod } from "./enums";

export interface RouteDefinition {
  [key: string | symbol]: {
    path: string;
    descriptor: any;
    method: RequestMethod;
  };
}

export type Handler = (ctx: Context) => Promise<unknown>;
