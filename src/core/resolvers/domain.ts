import { MetadataKey } from "../../utils/enums";
import type { Type } from "../../utils/is";
import Metadata from "../metadata";
import type { Router } from "../router";
import { ControllerResolver } from "./controller";

export class DomainResolver {
  private metadata = Metadata.init();

  private declare domain: Type<any>;
  private declare controllerResolver: ControllerResolver;

  constructor(domain: Type<any>, router: Router<any>) {
    this.controllerResolver = new ControllerResolver(router);
    this.domain = domain;
  }

  public resolve() {
    const options = this.metadata.get(MetadataKey.Domain, this.domain);

    for (const controller of options.controllers) {
      this.controllerResolver.resolve(controller);
    }
  }
}
