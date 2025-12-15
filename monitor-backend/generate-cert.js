// generate-cert.js
const fs = require("fs");
const selfsigned = require("selfsigned");

const attrs = [{ name: "commonName", value: "192.168.100.5" }]; // <-- tu IP local
const pems = selfsigned.generate(attrs, {
  days: 365,
  keySize: 2048,
  algorithm: "sha256",
  extensions: [
    {
      name: "basicConstraints",
      cA: true,
    },
    {
      name: "keyUsage",
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true,
    },
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" },
        { type: 7, ip: "192.168.100.5" }, // tu IP local
      ],
    },
  ],
});

fs.writeFileSync("server.key", pems.private);
fs.writeFileSync("server.cert", pems.cert);

console.log("✅ Certificados creados correctamente:");
console.log("   → server.key");
console.log("   → server.cert");
console.log("\nAhora puedes iniciar el servidor con:");
console.log("   npm start");
