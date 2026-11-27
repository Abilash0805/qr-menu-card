// Builds supabase/schema.sql from the template + the starter menu in menu-data.js.
// Usage: node supabase/build-schema.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "menu-data.js"), "utf8"), ctx);
const json = JSON.stringify(ctx.window.MENU);
if (json.includes("$menu$")) throw new Error("menu text contains $menu$");
const tpl = fs.readFileSync(path.join(__dirname, "schema.template.sql"), "utf8");
fs.writeFileSync(path.join(__dirname, "schema.sql"), tpl.replace("__MENU_JSON__", json));
console.log("wrote supabase/schema.sql");
