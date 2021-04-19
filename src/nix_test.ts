import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

import {
  NixLiteral,
  NixString,
  NixObject,
  NixLet,
  NixFunction,
  NixArray,
  NixWith,
  NixFunctionInvocation,
  Obj,
  Str,
  Let,
  Fun,
  Arr,
  Import,
} from "./nix.ts";

Deno.test("nix literal", () => {
  const result = new NixLiteral("hello").toString();
  assertEquals(result, "hello");
});

Deno.test("nix string", () => {
  const result = new NixString("hello").toString();
  assertEquals(result, '"hello"');
});

Deno.test("nix object", () => {
  const result = new NixObject({ a: new NixString("hello") }).toString();
  assertEquals(result, '{a="hello";}');
});

Deno.test("nix object, multiple keys", () => {
  const result = new NixObject({
    a: new NixString("hello"),
    b: new NixString("world"),
  }).toString();
  assertEquals(result, '{a="hello";b="world";}');
});

Deno.test("nix let", () => {
  const result = new NixLet(
    { a: new NixString("hello") },
    new NixLiteral("world")
  ).toString();
  assertEquals(result, 'let a="hello"; in world');
});

Deno.test("nix function, simple arg", () => {
  const result = new NixFunction(
    "hello",
    new NixLiteral("hello.world")
  ).toString();
  assertEquals(result, "hello: hello.world");
});

Deno.test("nix function, arg deconstruction", () => {
  const result = new NixFunction(
    ["arg1", "arg2"],
    new NixLiteral("hello.world")
  ).toString();
  assertEquals(result, "{arg1,arg2}: hello.world");
});

Deno.test("nix array", () => {
  const result = new NixArray([
    new NixLiteral("hello"),
    new NixLiteral("ripgrep"),
  ]).toString();
  assertEquals(result, "[hello ripgrep]");
});

Deno.test("nix with", () => {
  const result = new NixWith(
    new NixLiteral("pkgs"),
    new NixArray([new NixLiteral("hello")])
  ).toString();
  assertEquals(result, "with pkgs; [hello]");
});

Deno.test("nix function invocation", () => {
  const result = new NixFunctionInvocation(new NixLiteral("import"), [
    new NixLiteral("./file.nix"),
  ]).toString();
  assertEquals(result, "import ./file.nix");
});

Deno.test("nix flake outputs", () => {
  const result = new NixFunction(
    ["arg1"],
    new NixLet(
      {
        pkgs: new NixFunctionInvocation(new NixLiteral("import"), [
          new NixLiteral("arg1"),
          new NixObject({ sys: new NixString("x86") }),
        ]),
      },
      new NixObject({ "pkg.x86.hello": new NixLiteral("pkgs.hello") })
    )
  ).toString();
  assertEquals(
    result,
    '{arg1}: let pkgs=import arg1 {sys="x86";}; in {pkg.x86.hello=pkgs.hello;}'
  );
});

Deno.test("shorter nix obj", () => {
  const result = Obj({ a: Str("b") });

  assertEquals(result, '{a="b";}');
});

Deno.test("shorter nix fun let", () => {
  const result = Fun("arg", Let({ a: "arg + " + Str("hello") }, "a"));

  assertEquals(result, 'arg: let a=arg + "hello"; in a');
});

Deno.test("shorter nix fun array", () => {
  const result = Arr("hello", "you");

  assertEquals(result, "[hello you]");
});

Deno.test("shorter nix flake outputs", () => {
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
