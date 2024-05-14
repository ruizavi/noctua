import { MetadataKey } from "../../utils/enums";
import Metadata from "../metadata";
import type { Router } from "../router";
import { HttpResolver } from "./http";

export class ControllerResolver {
  private metadata = Metadata.init();
  private declare httpResolver: HttpResolver;

  constructor(router: Router<any>) {
    this.httpResolver = new HttpResolver(router);
  }

  public resolve(controller: unknown) {
    const data: string = this.metadata.get(MetadataKey.Controller, controller);

    this.httpResolver.resolve(controller, data);
  }
}
