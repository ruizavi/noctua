import { isUndefined, type Type } from "../utils/is";
import { DomainResolver } from "./resolvers/domain";
import { RegExpRouter, type Router } from "./router";

export class Noctua {
  private static noctua: Noctua;
  private declare router: Router<any>;
  private declare domain: Type<any>;

  private constructor(root: Type<any>) {
    this.domain = root;
    this.router = new RegExpRouter<any>();
  }

  static create(root: Type<any>) {
    if (!Noctua.noctua) Noctua.noctua = new Noctua(root);

    return Noctua.noctua;
  }

  private matcher(method: string, url: string) {
    const [[[fn, params]], requests] = this.router.match(method, url);

    const parsed: {
      fn: any;
      params: { [key: string | symbol]: any };
      url?: string;
      values?: Array<string>;
    } = {
      fn,
      params,
    };

    if (!isUndefined(requests)) {
      const [url, ...values] = requests;

      parsed.url = url;
      parsed.values = values;
    }

    return parsed;
  }

  public start(port: number) {
    const domainResolver = new DomainResolver(this.domain, this.router);

    domainResolver.resolve();

    Bun.serve({
      fetch: async (request, server) => {
        const url = new URL(request.url);

        try {
          const result = this.matcher(request.method, url.pathname);

          const response = await result.fn();

          return new Response(JSON.stringify(response));
        } catch (error) {
          return new Response("Algo salio mal");
        }
      },
      port,
    });
  }
}
