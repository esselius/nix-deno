import { assertEquals } from "https://deno.land/std@0.93.0/testing/asserts.ts";

import { Obj, Str, Let, Fun, Arr, Import, With, Call, SvcMod } from "./nix.ts";

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

Deno.test("nix with", () => {
  const result = With("hello", "you");

  assertEquals(result, "with hello; you");
});

Deno.test("nix function call", () => {
  const result = Call("hi", Str("you"));

  assertEquals(result, 'hi "you"');
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

Deno.test("nix service module", () => {
  const result = SvcMod({
    name: "dns-heaven",
    package: "dns-heaven",
    options: {
      address: "127.0.0.1:53",
    },
    args: [Str("-address"), "cfg.address"],
  });

  assertEquals(
    result,
    '{config,lib,pkgs,...}: with lib; let cfg=config.services.dns-heaven; in {options={services.dns-heaven={enable=mkOption {type=types.bool;default=false;};package=mkOption {type=types.package;default=pkgs.dns-heaven;};address=mkOption {type=types.str;default="127.0.0.1:53";};};};config=mkIf cfg.enable {environment.systemPackages=[cfg.package];launchd.daemons.dns-heaven.serviceConfig={ProgramArguments=["${cfg.package}/bin/dns-heaven" "-address" cfg.address];RunAtLoad=true;KeepAlive=true;};};}'
  );
});
