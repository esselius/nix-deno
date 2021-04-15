{
  outputs = { nixpkgs, ... }:
    let
      pkgs = import nixpkgs {
        system = "x86_64-darwin";
      };

      nix-ts = pkgs.yarn2nix-moretea.mkYarnPackage {
        name = "nix-ts";
        src = ./.;

        buildPhase = "yarn build";
      };
    in
    pkgs.callPackage (pkgs.runCommand "nix-ts" { } "${nix-ts}/libexec/nix-ts/deps/nix-ts/bin/nix-ts > $out") { };
}
