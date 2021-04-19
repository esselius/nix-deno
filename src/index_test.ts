import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

import { toNix } from "./index.ts";

Deno.test("nix string", () => {
  const result = toNix("hello, nix!");
  assertEquals(result, '"hello, nix!"');
});

Deno.test("nix object", () => {
  const result = toNix({ a: "b", b: "a" });
  assertEquals(result, '{a="b";b="a";}');
});
