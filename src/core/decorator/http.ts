import { MetadataKey, RequestMethod } from "../../utils/enums";
import { isUndefined } from "../../utils/is";
import type { RouteDefinition } from "../../utils/types";
import { addSlash } from "../../utils/url";
import Metadata from "../metadata";

interface MethodOptions {
  v: number;
}

function requestMethodFactory(method: RequestMethod) {
  return (prefix: string, options?: MethodOptions): MethodDecorator => {
    const current = isUndefined(options) ? prefix : `v${options.v}/${prefix}`;

    const path = addSlash(current);

    const metadata = Metadata.init();
    return (target, propertyKey, descriptor) => {
      const args: RouteDefinition = metadata.has(
        MetadataKey.Routes,
        target.constructor
      )
        ? metadata.get(MetadataKey.Routes, target.constructor)
        : {};

      metadata.set(
        MetadataKey.Routes,
        {
          ...args,
          [propertyKey]: {
            path,
            descriptor: descriptor.value,
            method,
          },
        },
        target.constructor
      );
    };
  };
}

export const All = requestMethodFactory(RequestMethod.ALL);
export const Delete = requestMethodFactory(RequestMethod.DELETE);
export const Get = requestMethodFactory(RequestMethod.GET);
export const Head = requestMethodFactory(RequestMethod.HEAD);
export const Options = requestMethodFactory(RequestMethod.OPTIONS);
export const Patch = requestMethodFactory(RequestMethod.PATCH);
export const Post = requestMethodFactory(RequestMethod.POST);
export const Put = requestMethodFactory(RequestMethod.PUT);
export const Search = requestMethodFactory(RequestMethod.SEARCH);
