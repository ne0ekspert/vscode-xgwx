#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
extension_dir="$(cd "$script_dir/.." && pwd)"
library_dir="${LIBXGWX_DIR:-$extension_dir/../libxgwx}"
package_dir="$library_dir/web/dist/pkg"
output_dir="$extension_dir/media"
wasm_pack="${WASM_PACK:-$HOME/.cargo/bin/wasm-pack}"
wasm_opt="${WASM_OPT:-$(command -v wasm-opt || true)}"
wasm_bindgen="${WASM_BINDGEN:-$(command -v wasm-bindgen || true)}"
if [[ -z "$wasm_opt" ]]; then
  for candidate in "$HOME"/.cache/.wasm-pack/wasm-opt-*/bin/wasm-opt; do
    if [[ -x "$candidate" ]]; then
      wasm_opt="$candidate"
      break
    fi
  done
fi
if [[ -z "$wasm_bindgen" ]]; then
  for candidate in "$HOME"/.cache/.wasm-pack/wasm-bindgen-*/wasm-bindgen; do
    if [[ -x "$candidate" ]]; then
      wasm_bindgen="$candidate"
      break
    fi
  done
fi

# Gentoo's selected system Rust may omit the WASM standard library even when a
# rustup toolchain with the target is already installed. Prefer that local
# toolchain for this build instead of silently copying a stale package.
if [[ -x "$HOME/.cargo/bin/rustup" ]] \
  && "$HOME/.cargo/bin/rustup" target list --installed | grep -qx wasm32-unknown-unknown; then
  export PATH="$HOME/.cargo/bin:$PATH"
fi

# Keep compiler diagnostic paths portable in the published WASM bundle.
# Encoded flags take precedence over RUSTFLAGS when callers supply them.
if [[ -n "${CARGO_ENCODED_RUSTFLAGS:-}" ]]; then
  export CARGO_ENCODED_RUSTFLAGS="${CARGO_ENCODED_RUSTFLAGS}"$'\x1f'"--remap-path-prefix=$HOME=/build/home"
else
  export RUSTFLAGS="${RUSTFLAGS:-} --remap-path-prefix=$HOME=/build/home"
fi

if [[ -x "$wasm_pack" ]]; then
  build_dir="$(mktemp -d)"
  if "$wasm_pack" build "$library_dir" \
    --target web \
    --out-dir "$build_dir" \
    --out-name libxgwx \
    --features wasm,write,il \
    --no-default-features; then
    package_dir="$build_dir"
  else
    if [[ -z "$wasm_bindgen" ]]; then
      echo "wasm-pack failed and no wasm-bindgen fallback is available." >&2
      exit 1
    fi
    cargo build \
      --manifest-path "$library_dir/Cargo.toml" \
      --release \
      --target wasm32-unknown-unknown \
      --features wasm,write,il \
      --no-default-features
    "$wasm_bindgen" \
      "$library_dir/target/wasm32-unknown-unknown/release/xgwx.wasm" \
      --target web \
      --out-dir "$build_dir" \
      --out-name libxgwx
    package_dir="$build_dir"
  fi
fi

for asset in libxgwx.js libxgwx_bg.wasm; do
  if [[ ! -f "$package_dir/$asset" ]]; then
    echo "missing libxgwx WASM asset: $package_dir/$asset" >&2
    exit 1
  fi
done

install -m 0644 "$package_dir/libxgwx.js" "$output_dir/libxgwx.js"
if [[ -n "$wasm_opt" ]]; then
  "$wasm_opt" -Oz "$package_dir/libxgwx_bg.wasm" -o "$output_dir/libxgwx_bg.wasm"
  chmod 0644 "$output_dir/libxgwx_bg.wasm"
else
  install -m 0644 "$package_dir/libxgwx_bg.wasm" "$output_dir/libxgwx_bg.wasm"
  echo "wasm-opt not found; copied the unoptimized WASM bundle." >&2
fi

echo "Copied libxgwx WASM assets into $output_dir"
