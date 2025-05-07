// Directories and files
import path from "node:path";

import { ROOT_DIR } from "./lib/cmd.js";

export const MAIN_CIRCUIT_NAME = "jwt-tx-validation";
export const MAIN_CIRCUIT_FILE = `${MAIN_CIRCUIT_NAME}.circom`;
export const MAIN_CIRCUIT_PATH = path.join(ROOT_DIR, MAIN_CIRCUIT_FILE);
export const TARGET_DIR = "target";
