import { jsToNix, NixExpression } from "nijs";

let flake = () =>
  jsToNix(
    new NixExpression("{ wget }: { packages.x86_64-darwin.wget = wget; }"),
    true
  );

export { flake };
