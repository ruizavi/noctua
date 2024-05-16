import { RequestArgs } from "../../utils/enums";
import type { Context } from "../request";

export class AssocArgsContext {
  public changekeyForValue(
    key: RequestArgs,
    data: string | object | any,
    ctx: Context
  ): any {
    if (key === RequestArgs.Context) return ctx as any;
    if (key === RequestArgs.Body)
      return data && ctx.body ? ctx.body[data] : ctx.body;
    if (key === RequestArgs.Param) return data ? ctx.params[data] : ctx.params;
    if (key === RequestArgs.Query)
      return data ? ctx.queryParams[data] : ctx.queryParams;
    if (key === RequestArgs.Headers)
      return data ? ctx.headers[data] : ctx.headers;
    if (key === RequestArgs.Hostname) return ctx.hostname;
    if (key === RequestArgs.Method) return ctx.method;
    if (key === RequestArgs.Path) return ctx.path;
    if (key === RequestArgs.Url) return ctx.url;
  }
}
