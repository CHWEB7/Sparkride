const fs = require("fs");
const path = require("path");

const required = [
  "app/_layout.tsx",
  "app/index.tsx",
  "app/book.tsx",
  "app/+not-found.tsx",
  "app/driver/_layout.tsx",
  "app/driver/index.tsx",
  "app/driver/[id].tsx",
];

const root = __dirname;
let ok = true;

for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    console.error("MISSING:", file);
    ok = false;
  } else {
    console.log("OK:", file);
  }
}

const tabsDir = path.join(root, "app", "(tabs)");
if (fs.existsSync(tabsDir)) {
  console.error("REMOVE OLD FOLDER: app/(tabs) still exists");
  ok = false;
} else {
  console.log("OK: no legacy (tabs) folder");
}

if (!ok) {
  process.exit(1);
}

console.log("\nRoute structure verified.");
