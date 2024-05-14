import { isUndefined } from "../utils/is";
import { RegExpRouter, type Router } from "./router";

export class RouterState {
  private declare router: Router<any>;
  private static state: RouterState;

  private constructor() {
    this.router = new RegExpRouter();
  }

  static init() {
    if (!RouterState.state) RouterState.state = new RouterState();

    return RouterState.state;
  }

  public matcher(method: string, url: string) {
    const [[[handler, params]], requests] = this.router.match(method, url);

    const parsed: {
      handler: any;
      params: { [key: string | symbol]: any };
      url?: string;
      values?: Array<string>;
    } = {
      handler,
      params,
    };

    if (!isUndefined(requests)) {
      const [url, ...values] = requests;

      parsed.url = url;
      parsed.values = values;
    }

    return parsed;
  }

  public add(method: string, url: string, handler: any) {
    this.router.add(method, url, handler);
  }
}
