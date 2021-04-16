{
  outputs = { nixpkgs, ... }:
    let
      pkgs = import nixpkgs {
        system = "x86_64-darwin";
      };

      mkDenoDrv = { name, lockfile, entrypoint }@args:
        let
          inherit (builtins) split hashString;
          inherit (pkgs) lib fetchurl linkFarm writeText runCommand deno;
          inherit (pkgs.lib) elemAt flatten mapAttrsToList importJSON;

          urlPart = url: elemAt (flatten (split "://([a-z0-9\.]*)" url));
          artifactPath = url: "${urlPart url 0}/${urlPart url 1}/${hashString "sha256" (urlPart url 2)}";

          dep = url: sha256: [
            {
              name = artifactPath url;
              path = fetchurl { inherit url sha256; };
            }
            {
              name = (artifactPath url) + ".metadata.json";
              path = writeText "metadata.json" ''{"headers": {}, "url": ""}'';
            }
          ];

          deps = linkFarm "deps" (flatten (mapAttrsToList dep (importJSON lockfile)));
        in
        runCommand name ({ DENO_DIR = "deno"; } // args) ''
          mkdir -p "$DENO_DIR" "$out/bin"
          ln -s "${deps}" "$DENO_DIR/deps"

          ${deno}/bin/deno compile --unstable --lock="$lockfile" --cached-only -o "$out/bin/$name" "$entrypoint"
        '';
    in
    {
      defaultPackage.x86_64-darwin = mkDenoDrv {
        name = "welcome";
        entrypoint = ./src/index.ts;
        lockfile = ./lock.json;
      };
    };
}
