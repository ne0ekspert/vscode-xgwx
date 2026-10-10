import os from "node:os";
import path from "node:path";

// Optional private fixtures retain their Downloads/ and VMs/ directory layout.
// Override the root when validation archives are stored outside the home directory.
export function nativeFixturePath(relativePath) {
  return path.join(process.env.XGWX_TEST_DATA_ROOT || os.homedir(), relativePath);
}
