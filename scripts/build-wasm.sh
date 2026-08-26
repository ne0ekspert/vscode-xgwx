#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
extension_dir="$(cd "$script_dir/.." && pwd)"
library_dir="${LIBXGWX_DIR:-$extension_dir/../libxgwx}"
package_dir="$library_dir/web/dist/pkg"
output_dir="$extension_dir/media"
wasm_pack="${WASM_PACK:-$HOME/.cargo/bin/wasm-pack}"

# Gentoo's selected system Rust may omit the WASM standard library even when a
# rustup toolchain with the target is already installed. Prefer that local
# toolchain for this build instead of silently copying a stale package.
if [[ -x "$HOME/.cargo/bin/rustup" ]] \
  && "$HOME/.cargo/bin/rustup" target list --installed | grep -qx wasm32-unknown-unknown; then
  export PATH="$HOME/.cargo/bin:$PATH"
fi

if [[ -x "$wasm_pack" ]]; then
  build_dir="$(mktemp -d)"
  if "$wasm_pack" build "$library_dir" \
    --target web \
    --out-dir "$build_dir" \
    --out-name libxgwx \
    --features wasm,write \
    --no-default-features; then
    package_dir="$build_dir"
  else
    echo "wasm-pack could not rebuild libxgwx; refusing to copy a stale package." >&2
    exit 1
  fi
fi

for asset in libxgwx.js libxgwx_bg.wasm; do
  if [[ ! -f "$package_dir/$asset" ]]; then
    echo "missing libxgwx WASM asset: $package_dir/$asset" >&2
    exit 1
  fi
  install -m 0644 "$package_dir/$asset" "$output_dir/$asset"
done

echo "Copied libxgwx WASM assets into $output_dir"
