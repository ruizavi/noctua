import type { AnyZodObject, AnyZodTuple, ZodTypeAny } from "zod";
import {
  LifeCycleState,
  MetadataKey,
  RequestArgs,
  ResponseArgs,
} from "../../utils/enums";
import { isNull, isString, isUndefined } from "../../utils/is";
import type {
  Args,
  Handler,
  RouteDefinition,
  Response,
} from "../../utils/types";
import Metadata from "../metadata";
import type { Context } from "../request";
import { RouterState } from "../state";
import { AssocArgsContext } from "./args";
import type { BunFile } from "bun";
export class HttpResolver {
  private metadata = Metadata.init();
  private argsContext = new AssocArgsContext();
  private router = RouterState.init();

  constructor() {}

  public resolve(target: unknown, prefix: string) {
    const data: RouteDefinition = this.metadata.get(MetadataKey.Routes, target);

    if (isNull(data)) return;

    for (const [key, { descriptor, method, path }] of Object.entries(data)) {
      const buildedHandler = this.buildHandler(descriptor, target, key);
      this.router.add(method, `${prefix}${path}`, buildedHandler);
    }
  }

  private buildHandler(
    handler: any,
    target: any,
    propertyKey: string | symbol
  ): Handler {
    const args: Args<ZodTypeAny | AnyZodObject | AnyZodTuple> =
      this.metadata.get(MetadataKey.Args, target, propertyKey) || {};

    const responseArgs: Array<
      [number, string | number | Record<string, string>]
    > = this.metadata.get(MetadataKey.Response, target, propertyKey) || [];

    const beforeByHandler = this.metadata.get(
      LifeCycleState.Before,
      target,
      propertyKey
    );

    const afterByHandler = this.metadata.get(
      LifeCycleState.After,
      target,
      propertyKey
    );

    const execLifecycle = async (
      handlers: Array<any>,
      ctx: Context,
      res: Response
    ) => {
      let index = 0;
      let next = async (error?: any) => {
        if (error) {
          throw error;
        }

        index++;
        if (index < handlers.length) {
          const handler = new handlers[index]();

          await handler.use(ctx, next);
        }
      };

      if (!handlers) return;

      const handler = new handlers[index]();

      await handler.use(ctx, next);
    };

    const headers: Record<string, string> = {};
    let status: number | undefined = undefined;
    let statusText: string | undefined = undefined;
    let isFile: { status: boolean; data?: string } = {
      status: false,
      data: undefined,
    };

    const setHeaders = (key: string, value: string) => (headers[key] = value);
    const setStatus = (code: number) => (status = code);
    const setStatusText = (text: string) => (statusText = text);

    const response = Object.assign(
      {},
      { setHeaders, setStatus, setStatusText }
    );

    return async (ctx: Context) => {
      try {
        const params: Array<unknown> = [];

        execLifecycle(beforeByHandler, ctx, response);

        for (const [type, data] of Object.values(responseArgs)) {
          if (type === ResponseArgs.Header && typeof data === "object") {
            for (const [key, value] of Object.entries(data)) {
              headers[key] = value;
            }
          }

          if (type === ResponseArgs.Status && typeof data === "number") {
            status = data;
          }

          if (type === ResponseArgs.File) {
            isFile = {
              status: true,
              data: isString(data) ? data : undefined,
            };
          }
        }

        for (const { type, data, validator } of Object.values(args).reverse()) {
          if (type === RequestArgs.Res) params.push(response);

          const value = this.argsContext.changekeyForValue(type, data, ctx);

          const val = Array.isArray(validator) ? validator[0] : validator;

          params.push(isUndefined(validator) ? value : val.parse(value));
        }

        const returnedValue = await handler.apply(this, params);

        execLifecycle(afterByHandler, ctx, response);

        let file: BunFile | undefined = undefined;

        if (isFile.status) {
          file =
            typeof isFile.data === "string"
              ? Bun.file(isFile.data)
              : Bun.file(returnedValue);
        }

        return {
          file,
          status,
          statusText,
          headers,
          json: returnedValue,
        }!;
      } catch (error) {
        console.log("si entro aqui por el error?");
        // await execLifecycle(errors, ctx, response);

        throw error;
      }
    };
  }
}
