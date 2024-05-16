import { MetadataKey } from "../../utils/enums";
import { isNull } from "../../utils/is";
import type { RouteDefinition } from "../../utils/types";
import Metadata from "../metadata";
import { RouterState } from "../state";

export class HttpResolver {
  private metadata = Metadata.init();

  private router = RouterState.init();

  constructor() {}

  public resolve(target: unknown, prefix: string) {
    const data: RouteDefinition = this.metadata.get(MetadataKey.Routes, target);

    if (isNull(data)) return;

    for (const [key, { descriptor, method, path }] of Object.entries(data)) {
      this.router.add(method, `${prefix}${path}`, descriptor);
    }
  }
}
