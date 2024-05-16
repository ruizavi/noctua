export const isNull = (obj: unknown): obj is null | undefined =>
  isUndefined(obj) || obj === null;

export const isUndefined = (obj: unknown): obj is undefined =>
  typeof obj === "undefined";

export const isFunction = (val: any): val is Function =>
  typeof val === "function";

export const isString = (val: any): val is string => typeof val === "string";

export interface Type<T = unknown> extends Function {
  new (...args: unknown[]): T;
}
