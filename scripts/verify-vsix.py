#!/usr/bin/env python3
"""Check the distributable VSIX and write its release provenance beside it."""

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import zipfile


ROOT = Path(__file__).resolve().parents[1]


def command(*args, **kwargs):
    return subprocess.check_output(args, text=True, **kwargs).strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("vsix", type=Path)
    parser.add_argument("--library-source", required=True, type=Path)
    args = parser.parse_args()
    manifest = json.loads((ROOT / "package.json").read_text())
    notices = (ROOT / "THIRD_PARTY_NOTICES.md").read_text()
    revisions = re.findall(r"https://github\.com/ne0ekspert/libxgwx/tree/([0-9a-f]{40})\b", notices)
    revision = command("git", "rev-parse", "HEAD", cwd=args.library_source)
    if revisions != [revision]:
        raise SystemExit("WASM build source must match the commit in THIRD_PARTY_NOTICES.md")
    with zipfile.ZipFile(args.vsix) as archive:
        files = set(archive.namelist())
        required = [
            "package.json", "extension.js", "new-workspace.cjs", "explorer.cjs",
            "LICENSE", "LICENSES/Apache-2.0.txt", "THIRD_PARTY_NOTICES.md",
            "media/libxgwx.js", "media/libxgwx_bg.wasm",
            "media/vendor/picomatch/LICENSE", "media/vendor/picomatch/index.js",
        ]
        for directory in ("media", "snippets", "syntaxes", "LICENSES"):
            required.extend(
                path.relative_to(ROOT).as_posix()
                for path in sorted((ROOT / directory).rglob("*")) if path.is_file()
            )
        required = list(dict.fromkeys(required))
        archive_names = {name: f"extension/{name}" for name in required}
        # vsce canonicalizes the root license filename when creating a VSIX.
        if "extension/LICENSE.txt" in files:
            archive_names["LICENSE"] = "extension/LICENSE.txt"
        for name in required:
            if archive_names[name] not in files:
                raise SystemExit(f"VSIX is missing {name}")
        for name in files:
            relative = Path(name).relative_to("extension") if name.startswith("extension/") else Path(name)
            if (relative.parts and relative.parts[0] in {
                ".git", ".github", ".build", "dist", "test", "scripts", "node_modules",
            }) or name.lower().endswith((".xgwx", ".vsix")):
                raise SystemExit(f"VSIX contains repository-only content: {name}")
        packaged = json.loads(archive.read("extension/package.json"))
        for key in ("name", "publisher", "version"):
            if packaged[key] != manifest[key]:
                raise SystemExit(f"VSIX {key} differs from the source manifest")
        for name in required[1:]:
            if archive.read(archive_names[name]) != (ROOT / name).read_bytes():
                raise SystemExit(f"VSIX contains stale contents for {name}")
    metadata = {
        "name": manifest["name"], "version": manifest["version"],
        "extension_commit": command("git", "rev-parse", "HEAD", cwd=ROOT),
        "libxgwx_commit": revision, "libxgwx_features": ["wasm", "write", "il"],
        "vsix_sha256": hashlib.sha256(args.vsix.read_bytes()).hexdigest(),
        "wasm_sha256": hashlib.sha256((ROOT / "media/libxgwx_bg.wasm").read_bytes()).hexdigest(),
        "node": command("node", "--version"), "rustc": command("rustc", "--version"),
        "wasm_pack": command("wasm-pack", "--version"),
    }
    (args.vsix.parent / "BUILD.json").write_text(json.dumps(metadata, indent=2) + "\n")
    print(f"Verified {args.vsix}")


if __name__ == "__main__":
    main()
