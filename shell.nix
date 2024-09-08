{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    pkgs.python3
    pkgs.python3Packages.pip
    pkgs.python3Packages.virtualenv
    pkgs.sqlite
    pkgs.gcc
    pkgs.gnumake
    pkgs.pnpm
    pkgs.wrangler
  ];
}
