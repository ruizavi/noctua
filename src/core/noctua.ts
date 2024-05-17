import { type Type } from "../utils/is";
import { generateContext } from "./request";
import { DomainResolver } from "./resolvers/domain";
import { RouterState } from "./state";

const METHODS = ["PUT", "PATCH", "POST"];

export class Noctua {
  private static noctua: Noctua;
  private declare domain: Type<any>;
  private router = RouterState.init();

  private constructor(root: Type<any>) {
    this.domain = root;
  }

  static create(root: Type<any>) {
    if (!Noctua.noctua) Noctua.noctua = new Noctua(root);

    return Noctua.noctua;
  }

  public start(port: number) {
    const domainResolver = new DomainResolver(this.domain);

    domainResolver.resolve();

    Bun.serve({
      fetch: async (request, server) => {
        const url = new URL(request.url);

        try {
          const result = this.router.matcher(request.method, url.pathname);

          const context = await generateContext({
            params: result.params,
            values: result.values,
            request,
            server,
          });

          const { json, file, ...response } = await result.handler(context);

          return new Response(JSON.stringify(json), response);
        } catch (error) {
          console.log(error);
          return new Response("Algo salio mal");
        }
      },
      port,
    });
  }
}
