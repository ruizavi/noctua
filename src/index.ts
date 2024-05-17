import { z } from "zod";
import { Context, Param, Res } from "./core/decorator/args";
import { Controller } from "./core/decorator/controller";
import { Domain } from "./core/decorator/domain";
import { Get, Post } from "./core/decorator/http";
import { Noctua } from "./core/noctua";
import type { Response } from "./utils/types";
import { SetFile, SetHeaders, SetStatus } from "./core/decorator/response";
import { HttpError } from "./core/error";
const schema = z.object({
  slug: z.number(),
  id: z.number(),
});

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
