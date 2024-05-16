import type { AnyZodObject, AnyZodTuple, ZodTypeAny } from "zod";
import { MetadataKey } from "../../utils/enums";
import { isNull, isUndefined } from "../../utils/is";
import type { Args, Handler, RouteDefinition } from "../../utils/types";
import Metadata from "../metadata";
import type { Context } from "../request";
import { RouterState } from "../state";
import { AssocArgsContext } from "./args";

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
  ) {
    const args: Args<ZodTypeAny | AnyZodObject | AnyZodTuple> =
      this.metadata.get(MetadataKey.Args, target, propertyKey);

    return async (ctx: Context) => {
      try {
        const params: Array<unknown> = [];

        for (const { type, data, validator } of Object.values(args).reverse()) {
          const value = this.argsContext.changekeyForValue(type, data, ctx);

          const val = Array.isArray(validator) ? validator[0] : validator;

          params.push(isUndefined(validator) ? value : val.parse(value));
        }

        const returnedValue = await handler.apply(this, params);

        return returnedValue!;
      } catch (error) {
        return error;
      }
    };
  }
}
