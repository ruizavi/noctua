import type { AnyZodObject } from "zod";
import { MetadataKey, RequestArgs } from "../../utils/enums";
import Metadata from "../metadata";
import { isUndefined, isString } from "../../utils/is";

function argsDecoratorFactory(type: RequestArgs): ParameterDecorator {
  const metadata = Metadata.init();
  return function (target, propertyKey, parameterIndex) {
    const args = metadata.get(MetadataKey.Args, target, propertyKey) || {};

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
      target,
      propertyKey
    );
  };
}

function argsZodDecoratorFactory(type: RequestArgs) {
  return function <T extends AnyZodObject>(
    data?: string,
    z?: T
  ): ParameterDecorator {
    const metadata = Metadata.init();

    const hasParamData = isUndefined(data) || isString(data);
    const paramData = hasParamData ? data : undefined;
    const paramValidate = isUndefined(z) ? undefined : z;

    return function (target, propertyKey, parameterIndex) {
      const args = metadata.get(MetadataKey.Args, target, propertyKey) || {};

      metadata.set(
        MetadataKey.Args,
        {
          ...args,
          [`${type}-${parameterIndex}`]: {
            type,
            index: parameterIndex,
            data: paramData,
            validator: paramValidate,
          },
        },
        target,
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
export function Body(data: string): ParameterDecorator;
export function Body<T extends AnyZodObject>(z: T): ParameterDecorator;
export function Body<T extends AnyZodObject>(
  data: string,
  z: T
): ParameterDecorator;
export function Body<T extends AnyZodObject>(
  data?: string,
  z?: T
): ParameterDecorator {
  return argsZodDecoratorFactory(RequestArgs.Body)(data, z);
}

export function Param(): ParameterDecorator;
export function Param(data: string): ParameterDecorator;
export function Param<T extends AnyZodObject>(z: T): ParameterDecorator;
export function Param<T extends AnyZodObject>(
  data: string,
  z: T
): ParameterDecorator;
export function Param<T extends AnyZodObject>(
  data?: string,
  z?: T
): ParameterDecorator {
  return argsZodDecoratorFactory(RequestArgs.Param)(data, z);
}

export function Query(): ParameterDecorator;
export function Query(data: string): ParameterDecorator;
export function Query<T extends AnyZodObject>(z: T): ParameterDecorator;
export function Query<T extends AnyZodObject>(
  data: string,
  z: T
): ParameterDecorator;
export function Query<T extends AnyZodObject>(
  data?: string,
  z?: T
): ParameterDecorator {
  return argsZodDecoratorFactory(RequestArgs.Query)(data, z);
}

export function Headers(): ParameterDecorator;
export function Headers(data: string): ParameterDecorator;
export function Headers<T extends AnyZodObject>(z: T): ParameterDecorator;
export function Headers<T extends AnyZodObject>(
  data: string,
  z: T
): ParameterDecorator;
export function Headers<T extends AnyZodObject>(
  data?: string,
  z?: T
): ParameterDecorator {
  return argsZodDecoratorFactory(RequestArgs.Headers)(data, z);
}
