import type { AnyZodObject, AnyZodTuple, ZodAnyDef, ZodTypeAny } from "zod";
import { MetadataKey, RequestArgs } from "../../utils/enums";
import Metadata from "../metadata";
import { isUndefined, isString } from "../../utils/is";

function argsDecoratorFactory(type: RequestArgs): ParameterDecorator {
  return function (target, propertyKey, parameterIndex) {
    const metadata = Metadata.init();
    const args =
      metadata.get(MetadataKey.Args, target.constructor, propertyKey) || {};

    metadata.set(
      MetadataKey.Args,
      {
        ...args,
        [`${type}-${parameterIndex}`]: {
          type,
          index: parameterIndex,
          data: undefined,
          validator: undefined,
        },
      },
      target.constructor,
      propertyKey
    );
  };
}

function argsZodDecoratorFactory(type: RequestArgs) {
  return function <T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
    data?: string,
    z?: T
  ): ParameterDecorator {
    const hasParamData = isUndefined(data) || isString(data);
    const paramData = hasParamData ? data : undefined;
    const paramParsers = hasParamData ? z : [data, z];

    return function (target, propertyKey, parameterIndex) {
      const metadata = Metadata.init();

      const args =
        metadata.get(MetadataKey.Args, target.constructor, propertyKey) || {};

      metadata.set(
        MetadataKey.Args,
        {
          ...args,
          [`${type}-${parameterIndex}`]: {
            type,
            index: parameterIndex,
            data: paramData,
            validator: paramParsers,
          },
        },
        target.constructor,
        propertyKey
      );
    };
  };
}

export const Context = argsDecoratorFactory(RequestArgs.Context);
export const Path = argsDecoratorFactory(RequestArgs.Path);
export const Url = argsDecoratorFactory(RequestArgs.Url);
export const Hostname = argsDecoratorFactory(RequestArgs.Hostname);
export const Method = argsDecoratorFactory(RequestArgs.Method);

export function Body(): ParameterDecorator;
export function Body<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  z: T
): ParameterDecorator;
export function Body<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  data: string,
  z: T
): ParameterDecorator;
export function Body<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  data?: string,
  z?: T
): ParameterDecorator {
  return argsZodDecoratorFactory(RequestArgs.Body)(data, z);
}

export function Param(): ParameterDecorator;
export function Param<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  z: T
): ParameterDecorator;
export function Param<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  data: string,
  z: T
): ParameterDecorator;
export function Param<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  data?: string,
  z?: T
): ParameterDecorator {
  return argsZodDecoratorFactory(RequestArgs.Param)(data, z);
}

export function Query(): ParameterDecorator;
export function Query<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  z: T
): ParameterDecorator;
export function Query<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  data: string,
  z: T
): ParameterDecorator;
export function Query<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  data?: string,
  z?: T
): ParameterDecorator {
  return argsZodDecoratorFactory(RequestArgs.Query)(data, z);
}

export function Header(): ParameterDecorator;
export function Header<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  z: T
): ParameterDecorator;
export function Header<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  data: string,
  z: T
): ParameterDecorator;
export function Header<T extends ZodTypeAny | AnyZodObject | AnyZodTuple>(
  data?: string,
  z?: T
): ParameterDecorator {
  return argsZodDecoratorFactory(RequestArgs.Headers)(data, z);
}
