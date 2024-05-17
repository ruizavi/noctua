import { z } from "zod";
import { Context, Param, Res } from "./core/decorator/args";
import { Controller } from "./core/decorator/controller";
import { Domain } from "./core/decorator/domain";
import { Post } from "./core/decorator/http";
import { Noctua } from "./core/noctua";
import type { Response } from "./utils/types";
const schema = z.object({
  slug: z.number(),
  id: z.number(),
});

@Controller("domain", { v: 2 })
class Controller2 {
  @Post(":id<number>/:slug<number>")
  get(@Param(schema) param: z.infer<typeof schema>, @Res() res: Response) {
    res.setStatus(201);
    res.setStatusText("Hi!");
    res.setHeaders("Hello", "World!");
    return { param };
  }
}

@Domain({ controllers: [Controller2] })
class App {}

function main() {
  const app = Noctua.create(App);

  app.start(4000);
}

main();
