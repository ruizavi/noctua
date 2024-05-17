import { MetadataKey, ResponseArgs } from "../../utils/enums";
import Metadata from "../metadata";

export function responseArgsFactory<T>(type: ResponseArgs) {
  return function (data?: T): MethodDecorator {
    const metadata = Metadata.init();

    return function (target, propertyKey) {
      const responseArgs: Array<[number, T]> =
        metadata.get(MetadataKey.Response, target.constructor, propertyKey) ||
        [];

      metadata.set(
        MetadataKey.Response,
        [...responseArgs, [type, data]],
        target.constructor,
        propertyKey
      );
    };
  };
}

export const SetHeaders = responseArgsFactory<Record<string, string>>(
  ResponseArgs.Header
);
export const SetStatus = responseArgsFactory<number>(ResponseArgs.Status);
export const SetFile = responseArgsFactory<string | undefined>(
  ResponseArgs.File
);
