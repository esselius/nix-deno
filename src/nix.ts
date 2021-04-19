interface NixExpression {
  toString(): string;
}

// want: "hello" -> hello
// current: new NixLiteral("hello").toString() -> hello
class NixLiteral implements NixExpression {
  text: string;

  constructor(text: string) {
    this.text = text;
  }

  toString() {
    return this.text;
  }
}

// want: "hello" -> "hello"
// current: new NixString("hello").toString() -> "hello"
class NixString implements NixExpression {
  text: string;

  constructor(text: string) {
    this.text = text;
  }

  toString() {
    return '"' + this.text + '"';
  }
}
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

// want: {a:"b"} -> {a="b";}
// current: new NixObject({a:"b"}).toString() -> {a="b";}
class NixObject implements NixExpression {
  obj: Record<string, NixExpression>;

  constructor(obj: Record<string, NixExpression>) {
    this.obj = obj;
  }

  toString() {
    return (
      "{" +
      Object.keys(this.obj)
        .map((key) => key + "=" + this.obj[key].toString() + ";")
        .join("") +
      "}"
    );
  }
}

// want: {a:"b"}, "hello" -> let a="b"; in hello
// current: new NixLet({a:"b"}, new NixLiteral("hello")).toString() -> let a="b"; in hello
class NixLet implements NixExpression {
  bindings: Record<string, NixExpression>;
  body: NixExpression;

  constructor(bindings: Record<string, NixExpression>, body: NixExpression) {
    this.bindings = bindings;
    this.body = body;
  }

  toString() {
    return (
      "let " +
      Object.keys(this.bindings)
        .map((key) => key + "=" + this.bindings[key].toString() + ";")
        .join("") +
      " in " +
      this.body.toString()
    );
  }
}

// want: NixFunction<"arg","hello"> -> arg: hello
// current: new NixFunction("arg", new NixLiteral("hello")).toString() -> arg: hello

class NixFunction implements NixExpression {
  arg: string | string[];
  body: NixExpression;

  constructor(arg: string | string[], body: NixExpression) {
    this.arg = arg;
    this.body = body;
  }

  toString() {
    switch (typeof this.arg) {
      case "string": {
        return this.arg + ": " + this.body;
      }
      case "object": {
        return "{" + this.arg.join(",") + "}: " + this.body;
      }
    }
  }
}

// want: ["hello"] -> [hello]
// current: new NixArray([new NixLiteral("hello")]).toString() -> [hello]
class NixArray implements NixExpression {
  items: NixExpression[];

  constructor(items: NixExpression[]) {
    this.items = items;
  }

  toString() {
    return "[" + this.items.map((item) => item.toString()).join(" ") + "]";
  }
}

// want: NixWith<"hello","you"> -> with hello; you
// current: new NixWith(new NixLiteral("hello"), new NixLiteral("you")).toString() -> with hello; you

class NixWith implements NixExpression {
  scope: NixExpression;
  body: NixExpression;

  constructor(scope: NixExpression, body: NixExpression) {
    this.scope = scope;
    this.body = body;
  }

  toString() {
    return "with " + this.scope.toString() + "; " + this.body.toString();
  }
}

// want: "hello" "you" -> hello you
// current: new NixFunctionInvocation(new NixLiteral("hello"), [new NixLiteral("you")]).toString() -> hello you

class NixFunctionInvocation implements NixExpression {
  fun: NixExpression;
  params: NixExpression[];

  constructor(fun: NixExpression, params: NixExpression[]) {
    this.fun = fun;
    this.params = params;
  }

  toString() {
    return (
      this.fun.toString() +
      " " +
      this.params.map((item) => item.toString()).join(" ")
    );
  }
}

export {
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
};
