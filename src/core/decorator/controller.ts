import { isUndefined } from "../../utils/is";
import { MetadataKey } from "../../utils/enums";
import { addSlash } from "../../utils/url";
import Metadata from "../metadata";

interface ControllerOptions {
  v: number;
}

function Controller(): ClassDecorator;
function Controller(path: string): ClassDecorator;
function Controller(path: string, options: ControllerOptions): ClassDecorator;
function Controller(
  path?: string,
  options?: ControllerOptions
): ClassDecorator {
  const metadata = Metadata.init();

  const current = isUndefined(options) ? path : `v${options.v}/${path}`;

  const controllerPath = addSlash(current);

  return (target) => {
    metadata.set(MetadataKey.Controller, controllerPath, target);
  };
}

export { Controller };
