import { Controller } from "./core/decorator/controller";
import { Domain } from "./core/decorator/domain";
import { Get } from "./core/decorator/http";
import { Noctua } from "./core/noctua";

@Controller("domain", { v: 2 })
class Controller2 {
  @Get(":id/:slug")
  get() {
    console.log("hola mundo!");

    return "hola!!";
  }
}

@Controller("app")
class Controller1 {
  @Get("test")
  get() {}
}

@Domain({ controllers: [Controller1, Controller2] })
class App {}

function main() {
  const app = Noctua.create(App);

  app.start(4000);
}

main();
