import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const process = globalThis.process;

// Load environment variables from root .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Validate required environment variables
const requiredVars = ['JWT_SECRET', 'SESSION_SECRET', 'MONGO_URL'];
const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.warn(`  Warning: Missing environment variables: ${missingVars.join(', ')}`);
}

// Export to ensure this module runs
export default true;