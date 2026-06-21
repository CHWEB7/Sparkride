const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "assets");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64"
);

for (const name of ["icon.png", "splash-icon.png", "adaptive-icon.png"]) {
  fs.writeFileSync(path.join(dir, name), png);
}

console.log("Created placeholder assets in mobile/assets/");
