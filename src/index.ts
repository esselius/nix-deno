import { NixExpression } from "nijs";

let flake = () =>
  new NixExpression("{ wget }: { packages.x86_64-darwin.wget = wget; }");

export { flake };
