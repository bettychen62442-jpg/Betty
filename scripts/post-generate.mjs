import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, "..", "node_modules", ".prisma", "client", "default");

// Create index.ts that re-exports the generated client
const indexContent = `// Re-export generated Prisma client
export { PrismaClient, Prisma, $Enums } from "./client.js";
export type * from "./client.js";
`;

writeFileSync(join(outputDir, "index.ts"), indexContent);
console.log("✓ Created Prisma client index.ts");

// Also create a package.json for proper module resolution
const pkgContent = JSON.stringify(
  {
    name: ".prisma/client",
    version: "0.0.0",
    private: true,
    main: "./index.ts",
    types: "./index.ts",
    exports: {
      ".": {
        types: "./index.ts",
        default: "./index.ts",
      },
    },
  },
  null,
  2
);
writeFileSync(join(outputDir, "package.json"), pkgContent);
console.log("✓ Created Prisma client package.json");
