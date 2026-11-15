// Read from stdin so the password is not a command-line argument or stored in history.
const { randomBytes, scryptSync } = require("node:crypto");
let password = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { password += chunk; });
process.stdin.on("end", () => {
  password = password.replace(/\r?\n$/, "");
  if (password.length < 12 || password.length > 256) throw new Error("Use 12–256 characters");
  const salt = randomBytes(16).toString("hex");
  console.log(`${salt}:${scryptSync(password, salt, 64).toString("hex")}`);
});
