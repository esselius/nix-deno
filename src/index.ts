type NixExpression = string | Record<string, string>;

function toNix(x: NixExpression): string {
  switch (typeof x) {
    case "object": {
      return "{" + Object.keys(x).map((y) => y + "=" + toNix(x[y]) + ";") + "}";
    }
    case "string": {
      return '"' + x + '"';
    }
  }
}

export { toNix };
