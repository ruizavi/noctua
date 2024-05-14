import { MetadataKey } from "../../utils/enums";
import { isNull } from "../../utils/is";
import type { RouteDefinition } from "../../utils/types";
import Metadata from "../metadata";
import type { Router } from "../router";

export class HttpResolver {
  private metadata = Metadata.init();

  private declare router: Router<any>;

  constructor(router: Router<any>) {
    this.router = router;
  }

  public resolve(target: unknown, prefix: string) {
    const data: RouteDefinition = this.metadata.get(MetadataKey.Routes, target);

    if (isNull(data)) return;

    for (const [key, { descriptor, method, path }] of Object.entries(data)) {
      console.log({ method, path: `${prefix}${path}` });
      this.router.add(method, `${prefix}${path}`, descriptor);
    }
  }
}
