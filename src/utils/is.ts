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

export class InvalidDecoratorItemException extends Error {
  private readonly msg: string;

  constructor(decorator: string, item: string, context: string) {
    const message = `Invalid ${item} passed to ${decorator}() decorator (${context}).`;
    super(message);

    this.msg = message;
  }

  public what(): string {
    return this.msg;
  }
}

export function validateEach(
  context: { name: string },
  arr: any[],
  predicate: Function,
  decorator: string,
  item: string
): boolean {
  if (!context || !context.name) {
    return true;
  }
  const errors = arr.some((str) => !predicate(str));
  if (errors) {
    throw new InvalidDecoratorItemException(decorator, item, context.name);
  }
  return true;
}
