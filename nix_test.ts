import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

import { Obj, Str, Let, Fun, Arr, Import } from "./nix.ts";

Deno.test("nix obj", () => {
  const result = Obj({ a: Str("b") });

  assertEquals(result, '{a="b";}');
});

Deno.test("nix fun let", () => {
  const result = Fun("arg", Let({ a: "arg + " + Str("hello") }, "a"));

  assertEquals(result, 'arg: let a=arg + "hello"; in a');
});

Deno.test("nix fun array", () => {
  const result = Arr("hello", "you");

  assertEquals(result, "[hello you]");
});

Deno.test("nix flake outputs", () => {
  const result = Fun(
    ["nixpkgs"],
    Let(
      {
        pkgs: Import("nixpkgs", Obj({ sys: Str("x86") })),
      },
      Obj({ "pkg.x86.hello": "pkgs.hello" })
    )
  );
  assertEquals(
    result,
    '{nixpkgs}: let pkgs=import nixpkgs {sys="x86";}; in {pkg.x86.hello=pkgs.hello;}'
  );
});
