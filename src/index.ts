import { z } from "zod";
import { Param, Res } from "./core/decorator/args";
import { Controller } from "./core/decorator/controller";
import { Domain } from "./core/decorator/domain";
import { Get, Post } from "./core/decorator/http";
import { Noctua } from "./core/noctua";
import type { LifeCycle, Response } from "./utils/types";
import { SetFile, SetHeaders, SetStatus } from "./core/decorator/response";
import { HttpError } from "./core/error";
import type { Context } from "./core/request";
import { OnBefore } from "./core/decorator/lifecycle";
const schema = z.object({
  slug: z.number(),
  id: z.number(),
});

class BeforeHandler implements LifeCycle {
  async use(ctx: Context, next: () => void): Promise<void> {
    console.log("si entro aqui?");

    next();
  }
}

class BeforeTwo implements LifeCycle {
  async use(ctx: Context, next: () => void): Promise<void> {
    console.log("si entro aqui? 2");

    next();
  }
}

class BeforeThree implements LifeCycle {
  async use(ctx: Context, next: (error?: any) => void): Promise<void> {
    try {
      throw new Error();
    } catch (error) {
      next(error);
    }
  }
}

@Controller("domain", { v: 2 })
class Controller2 {
  @Post(":id<number>/:slug<number>")
  @SetHeaders({ good: "bye!" })
  @SetStatus(200)
  get(@Param(schema) param: z.infer<typeof schema>, @Res() res: Response) {
    res.setStatusText("Hi!");
    res.setHeaders("Hello", "World!");

    if (param.id === 1) {
      throw new HttpError({ description: "Si funciona!!", status: 404 });
    }

    return { param };
  }

  @Get("/file")
  @SetFile()
  @OnBefore(BeforeHandler, BeforeTwo, BeforeThree)
  file() {
    return `${process.cwd()}/package.json`;
  }
}

@Domain({ controllers: [Controller2] })
class App {}

function main() {
  const app = Noctua.create(App);

  app.start(4000);
}

main();
