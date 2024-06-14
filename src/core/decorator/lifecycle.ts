import { LifeCycleState } from "../../utils/enums";
import { isFunction, validateEach, type Type } from "../../utils/is";
import type { ErrorHandling, LifeCycle } from "../../utils/types";
import Metadata from "../metadata";

export function lifeCycleFactory(type: LifeCycleState) {
  return (
      ...handlers: (Type<LifeCycle> | LifeCycle)[]
    ): MethodDecorator & ClassDecorator =>
    (
      target: any,
      key?: string | symbol,
      descriptor?: TypedPropertyDescriptor<any>
    ) => {
      const metadata = Metadata.init();

      const isValidHandler = <T extends Function | Record<string, any>>(
        handler: T
      ) =>
        handler &&
        (isFunction(handler) ||
          isFunction((handler as Record<string, any>).use));

      if (descriptor) {
        const previous = metadata.get(type, target.constructor, key) || [];

        validateEach(
          target.constructor,
          handlers,
          isValidHandler,
          "@LifeCycle",
          "handler"
        );

        metadata.set(type, [...previous, ...handlers], target.constructor, key);

        return descriptor;
      }

      const previous = metadata.get(type, target) || [];

      validateEach(target, handlers, isValidHandler, "@LifeCycle", "handler");

      metadata.set(type, [...previous, ...handlers], target);

      return target;
    };
}

export const OnBefore = lifeCycleFactory(LifeCycleState.Before);
export const OnAfter = lifeCycleFactory(LifeCycleState.After);

export function OnError(
  handler: Type<ErrorHandling> | ErrorHandling
): MethodDecorator & ClassDecorator {
  return (
    target: any,
    key?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ) => {
    const metadata = Metadata.init();

    const isValidHandler = <T extends Function | Record<string, any>>(
      handler: T
    ) =>
      handler &&
      (isFunction(handler) ||
        isFunction((handler as Record<string, any>).handling));

    if (!isValidHandler(handler)) throw new Error();

    if (descriptor) {
      metadata.set(LifeCycleState.Error, handler, target.constructor, key);

      return descriptor;
    }

    metadata.set(LifeCycleState.Error, handler, target);

    return target;
  };
}
