{
  outputs = { nixpkgs, ... }:
    let
      pkgs = import nixpkgs {
        system = "x86_64-darwin";
      };

      mkDenoDrv = { name, src, lockfile, entrypoint }:
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
        runCommand name { inherit src lockfile entrypoint; } ''
          export DENO_DIR=`mktemp -d`
          ln -s "${deps}" "$DENO_DIR/deps"
          mkdir -p "$out/bin"

          cd $src

          ${deno}/bin/deno compile --unstable --lock="$lockfile" --cached-only -o "$out/bin/$name" "$entrypoint"
        '';
    in
    {
      defaultPackage.x86_64-darwin = mkDenoDrv {
        name = "welcome";
        src = ./.;
        entrypoint = "./src/index.ts";
        lockfile = ./lock.json;
      };
    };
}
