type Map = Record<string, string>;

function concatMap(map: Map) {
  return Object.keys(map)
    .map((k) => k + "=" + map[k] + ";")
    .join("");
}

function Obj(obj: Map) {
  return "{" + concatMap(obj) + "}";
}

function Str(str: string) {
  return '"' + str + '"';
}

function Let(bindings: Map, expr: string) {
  return "let " + concatMap(bindings) + " in " + expr;
}

function Fun(arg: string | string[], body: string) {
  if (Array.isArray(arg)) {
    return "{" + arg.join(",") + "}" + ": " + body;
  }
  return arg + ": " + body;
}

function Arr(...items: string[]) {
  return "[" + items.join(" ") + "]";
}

function Import(...args: string[]) {
  return Call("import", ...args);
}

function With(arg: string, body: string) {
  return "with " + arg + "; " + body;
}

function Call(...args: string[]) {
  return args.join(" ");
}

function mkStrOptions(options: Record<string, string>) {
  var result = {};

  Object.keys(options).forEach((k) => {
    result = {
      ...result,
      ...{
        [k]: Call(
          "mkOption",
          Obj({ type: "types.str", default: Str(options[k]) })
        ),
      },
    };
  });

  return result;
}

function SvcMod(svc: {
  name: string;
  package: string;
  options: Record<string, string>;
  args: string[];
}) {
  return Fun(
    ["config", "lib", "pkgs", "..."],
    With(
      "lib",
      Let(
        { cfg: "config.services." + svc.name },
        Obj({
          options: Obj({
            ["services." + svc.name]: Obj({
              ...{
                enable: Call(
                  "mkOption",
                  Obj({ type: "types.bool", default: "false" })
                ),
                package: Call(
                  "mkOption",
                  Obj({ type: "types.package", default: "pkgs." + svc.package })
                ),
              },
              ...mkStrOptions(svc.options),
            }),
          }),
          config: Call(
            "mkIf",
            "cfg.enable",
            Obj({
              "environment.systemPackages": Arr("cfg.package"),
              ["launchd.daemons." + svc.name + ".serviceConfig"]: Obj({
                ProgramArguments: Arr(
                  Str("${cfg.package}/bin/" + svc.name),
                  ...svc.args
                ),
                RunAtLoad: "true",
                KeepAlive: "true",
              }),
            })
          ),
        })
      )
    )
  );
}

export { Obj, Str, Let, Fun, Arr, Import, With, Call, SvcMod };
