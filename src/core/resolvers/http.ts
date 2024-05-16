import { MetadataKey } from "../../utils/enums";
import { isNull } from "../../utils/is";
import type { Handler, RouteDefinition } from "../../utils/types";
import Metadata from "../metadata";
import type { Context } from "../request";
import { RouterState } from "../state";

export class HttpResolver {
  private metadata = Metadata.init();

  private router = RouterState.init();

  constructor() {}

  public resolve(target: unknown, prefix: string) {
    const data: RouteDefinition = this.metadata.get(MetadataKey.Routes, target);

    if (isNull(data)) return;

    for (const [key, { descriptor, method, path }] of Object.entries(data)) {
      this.buildHandler(descriptor, target, key);
      this.router.add(method, `${prefix}${path}`, descriptor);
    }
  }

  private buildHandler(
    handler: Handler,
    target: any,
    propertyKey: string | symbol
  ) {
    const args = this.metadata.get(MetadataKey.Args, target, propertyKey);

    return async (ctx: Context) => {
      return "Hello World"!;
    };
  }
}
