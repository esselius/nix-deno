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

      inherit (pkgs.nodePackages) nijs;

      nijsFunProxy = import "${nijs}/lib/node_modules/nijs/lib/funProxy.nix" {
        inherit (pkgs) stdenv nodejs;
        inherit nijs;
      };
    in
    pkgs.callPackage
      (nijsFunProxy {
        function = "require('${nix-ts}/libexec/nix-ts/deps/nix-ts/dist').flake";
        # function = ''() => new nijs.NixExpression("{ wget }: { packages.x86_64-darwin.wget = wget; }")'';
        # function = ''() => { let flake = () => new nijs.NixExpression("{ wget }: { packages.x86_64-darwin.wget = wget; }"); return flake(); }'';
        args = [ ];
      })
      { };
}
