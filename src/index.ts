import { z } from "zod";
import { Body, Param } from "./core/decorator/args";
import { Controller } from "./core/decorator/controller";
import { Domain } from "./core/decorator/domain";
import { Post } from "./core/decorator/http";
import { Noctua } from "./core/noctua";

const schema = z.object({
  slug: z.number(),
  id: z.number(),
});
const schema2 = z.object({
  status: z.string(),
});

@Controller("domain", { v: 2 })
class Controller2 {
  @Post(":id<number>/:slug<number>")
  get(
    @Param(schema) param: z.infer<typeof schema>,
    @Body(schema2) body: z.infer<typeof schema2>
  ) {
    return { body, param };
  }
}

@Domain({ controllers: [Controller2] })
class App {}

function main() {
  const app = Noctua.create(App);

  app.start(4000);
}

main();
