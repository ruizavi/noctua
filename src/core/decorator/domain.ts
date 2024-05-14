import { MetadataKey } from "../../utils/enums";
import type { Type } from "../../utils/is";
import Metadata from "../metadata";

export interface DomainOptions {
  controllers: Type<any>[];
}

export function Domain(options: DomainOptions): ClassDecorator {
  const metadata = Metadata.init();
  return (target) => {
    metadata.set(MetadataKey.Domain, options, target);
  };
}
