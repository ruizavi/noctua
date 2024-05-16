import { Param } from "./core/decorator/args";
import { Controller } from "./core/decorator/controller";
import { Domain } from "./core/decorator/domain";
import { Get, Post } from "./core/decorator/http";
import { Noctua } from "./core/noctua";
import type { Context } from "./core/request";

@Controller("domain", { v: 2 })
class Controller2 {
  @Post(":id<number>/:slug<number>")
  get(@Param() param: any) {
    return { status: "ok!" };
  }
}

@Domain({ controllers: [Controller2] })
class App {}

function main() {
  const app = Noctua.create(App);

  app.start(4000);
}

main();
