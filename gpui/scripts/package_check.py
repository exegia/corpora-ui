#!/usr/bin/env python3
"""Build the actual crate archive from an independent consumer workspace."""
import argparse
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tarfile
import tempfile

if sys.version_info < (3, 12):
    raise SystemExit("Use Python 3.12 or newer (for example python3.14 on this development Mac)")

import tomllib

ROOT = Path(__file__).resolve().parents[1]


def run(*args, cwd=ROOT, env=None):
    subprocess.run(args, cwd=cwd, env=env, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--allow-dirty", action="store_true")
    args = parser.parse_args()
    command = ["cargo", "package", "-p", "corpora-ui", "--no-verify"]
    if args.allow_dirty:
        command.append("--allow-dirty")
    run(*command)
    metadata = json.loads(subprocess.check_output(
        ["cargo", "metadata", "--no-deps", "--format-version", "1"], cwd=ROOT
    ))
    package = next(p for p in metadata["packages"] if p["name"] == "corpora-ui")
    target = Path(metadata["target_directory"])
    archive = target / "package" / f"corpora-ui-{package['version']}.crate"
    with tempfile.TemporaryDirectory(prefix="corpora-ui-consumer-") as temp:
        temp = Path(temp)
        with tarfile.open(archive) as bundle:
            bundle.extractall(temp, filter="data")
        extracted = temp / f"corpora-ui-{package['version']}"
        manifest = tomllib.loads((extracted / "Cargo.toml").read_text())
        if manifest.get("example") or (extracted / "examples").exists():
            raise RuntimeError("Gallery examples must not ship in the library archive")
        if manifest.get("patch"):
            raise RuntimeError("The published package must not depend on workspace patches")
        consumer = temp / "consumer"
        (consumer / "src").mkdir(parents=True)
        common = (
            '[package]\nname = "corpora-ui-consumer-check"\nversion = "0.0.0"\nedition = "2024"\n'
            '[workspace]\n[dependencies]\ngpui-kit = "0.10"\n'
            f'corpora-ui = {{ path = {json.dumps(str(extracted))} }}\n'
        )
        (consumer / "Cargo.toml").write_text(common)
        (consumer / "src/main.rs").write_text(
            'fn main() { let _assets = corpora_ui::Assets; let _init: fn(&mut gpui_kit::App) = corpora_ui::init; }\n'
        )
        env = dict(os.environ, CARGO_TARGET_DIR=str(target))
        print("Checking the packaged default crate with registry-only dependencies", flush=True)
        run("cargo", "check", cwd=consumer, env=env)
        if sys.platform == "darwin":
            readme = (extracted / "README.md").read_text()
            pin = re.search(r"git -C corpora-ui-renderer checkout ([0-9a-f]{40})", readme)
            if not pin:
                raise RuntimeError("The crate README must pin the glass renderer revision")
            # Fail if CI's renderer differs from the downstream instructions.
            run("git", "diff", "--exit-code", pin[1], "--", "vendor")
            # Exactly the two required overrides from the crate README. The
            # optional caret patch is deliberately absent.
            glass = common.replace(
                f'path = {json.dumps(str(extracted))} }}',
                f'path = {json.dumps(str(extracted))}, features = ["glass"] }}',
            )
            glass += (
                '\n[patch.crates-io]\n'
                f'gpui-pre = {{ path = {json.dumps(str(ROOT / "vendor/gpui-pre"))} }}\n'
                f'gpui-pre-apple = {{ path = {json.dumps(str(ROOT / "vendor/gpui-pre-apple"))} }}\n'
            )
            (consumer / "Cargo.toml").write_text(glass)
            print("Checking the packaged full-glass crate with documented renderer overrides", flush=True)
            run("cargo", "update", "-p", "gpui-pre", "-p", "gpui-pre-apple", cwd=consumer, env=env)
            run("cargo", "check", cwd=consumer, env=env)
        print(f"Verified {archive}", flush=True)


if __name__ == "__main__":
    main()
