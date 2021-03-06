{
  outputs = inputs:
    {
      overlay = final: prev: {
        mkDenoDrv = { name, src, lockfile, entrypoint }@args:
          let
            inherit (builtins) split hashString;
            inherit (prev) lib fetchurl linkFarm writeText runCommand deno;
            inherit (prev.lib) elemAt flatten mapAttrsToList importJSON;
            inherit (prev.stdenv) mkDerivation;

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
          mkDerivation
            ({
              buildPhase = ''
                export DENO_DIR=`mktemp -d`
                ln -s "${deps}" "$DENO_DIR/deps"

                ${deno}/bin/deno compile --unstable --lock="$lockfile" --cached-only -o "$name" "$entrypoint"
              '';

              installPhase = ''
                mkdir -p "$out/bin"
                mv "$name" "$out/bin/"
              '';
            } // args);
      };
    };
}
