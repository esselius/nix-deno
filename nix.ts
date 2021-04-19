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
  return "import " + args.join(" ");
}

export { Obj, Str, Let, Fun, Arr, Import };
