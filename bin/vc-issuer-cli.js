#!/usr/bin/env node

// vc-issuer-cli.js
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { ES256KSigner, ES256Signer } = require('did-jwt');
const {
  createVerifiableCredentialJwt,
  createVerifiablePresentationJwt,
} = require('did-jwt-vc');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '='.repeat(60));
  log(message, 'cyan');
  console.log('='.repeat(60) + '\n');
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.blue}${prompt}${colors.reset}`, (answer) => {
      resolve(answer);
    });
  });
}

// Step 1: Generate Keys
function generateKeys(outputDir) {
  header('Step 1: Generating Keys');

  log('Generating ES256 (P-256) key pair...', 'yellow');

  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-256',
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  // Save PEM files
  fs.writeFileSync(path.join(outputDir, 'private-key.pem'), privateKey);
  fs.writeFileSync(path.join(outputDir, 'public-key.pem'), publicKey);

  // Convert to JWK for DID document
  const publicKeyObject = crypto.createPublicKey(publicKey);
  const jwk = publicKeyObject.export({ format: 'jwk' });
  fs.writeFileSync(
    path.join(outputDir, 'public-key.jwk'),
    JSON.stringify(jwk, null, 2),
  );

  // Extract raw private key for ES256Signer
  const privateKeyObject = crypto.createPrivateKey(privateKey);
  const privateKeyJwk = privateKeyObject.export({ format: 'jwk' });

  // For ES256, the 'd' parameter in JWK is the private key (base64url encoded)
  const privateKeyBytes = Buffer.from(privateKeyJwk.d, 'base64url');
  const privateKeyHex = privateKeyBytes.toString('hex');

  fs.writeFileSync(path.join(outputDir, 'private-key.hex'), privateKeyHex);

  log('✓ Private key saved to: private-key.pem', 'green');
  log('✓ Public key saved to: public-key.pem', 'green');
  log('✓ Public key JWK saved to: public-key.jwk', 'green');
  log('✓ Private key hex saved to: private-key.hex', 'green');

  log(
    '\n⚠️  IMPORTANT: Keep private-key.pem and private-key.hex secure!',
    'red',
  );

  return { publicKey, privateKey, jwk, privateKeyHex };
}

// Step 2: Create DID Document
function createDIDDocument(domain, jwk, outputDir) {
  header('Step 2: Creating DID Document');

  // Encode colons for ports (e.g., localhost:3000 becomes localhost%3A3000)
  const encodedDomain = domain.replace(/:/g, '%3A');
  const did = `did:web:${encodedDomain}`;

  log(`Creating DID: ${did}`, 'yellow');

  const didDocument = {
    '@context': [
      'https://www.w3.org/ns/did/v1',
      'https://w3id.org/security/suites/jws-2020/v1',
    ],
    id: did,
    verificationMethod: [
      {
        id: `${did}#key-1`,
        type: 'JsonWebKey2020',
        controller: did,
        publicKeyJwk: jwk,
      },
    ],
    authentication: [`${did}#key-1`],
    assertionMethod: [`${did}#key-1`],
  };

  fs.writeFileSync(
    path.join(outputDir, 'did.json'),
    JSON.stringify(didDocument, null, 2),
  );

  log('✓ DID document saved to: did.json', 'green');

  const actualDomain = domain.replace(/%3A/g, ':');
  const protocol = actualDomain.includes('localhost') ? 'http' : 'https';

  log('\n📋 Next steps for deployment:', 'cyan');
  log(
    `   1. Upload did.json to: ${protocol}://${actualDomain}/.well-known/did.json`,
    'yellow',
  );
  log(
    `   2. Ensure CORS is enabled (Access-Control-Allow-Origin: *)`,
    'yellow',
  );
  log(
    `   3. Verify with: curl ${protocol}://${actualDomain}/.well-known/did.json`,
    'yellow',
  );

  return { didDocument, did };
}

// Step 3: Issue Employment Credential using did-jwt-vc
async function issueCredential(
  issuerDID,
  credentialData,
  privateKeyHex,
  outputDir,
) {
  log('Step 3: Issuing Employment Credential (JWT)');

  log('Creating credential payload...', 'yellow');

  const subjectDID =
    credentialData.subjectDID || `did:example:employee${Date.now()}`;

  // Create the VC payload
  const vcPayload = {
    sub: subjectDID,
    nbf: Math.floor(Date.now() / 1000), // Not before (now)
    exp: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // Expires in 1 year
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', 'EmploymentCredential'],
      credentialSubject: {
        id: subjectDID,
        name: credentialData.name,
        employedBy: credentialData.company,
        role: credentialData.role,
        department: credentialData.department,
        employeeId: credentialData.employeeId,
        startDate: credentialData.startDate,
      },
    },
  };

  log('Signing credential with did-jwt-vc...', 'yellow');

  // Create signer from private key - ES256Signer expects Uint8Array, not hex string
  const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');
  const signer = ES256Signer(privateKeyBytes);

  // Create issuer object
  const issuer = {
    did: issuerDID,
    signer,
    alg: 'ES256',
  };

  // Sign the credential
  const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer);

  log('✓ Credential signed successfully!', 'green');

  // Save JWT credential
  const jwtFilename = `credential-${credentialData.employeeId || Date.now()}.jwt`;
  fs.writeFileSync(path.join(outputDir, jwtFilename), vcJwt);
  log(`✓ JWT credential saved to: ${jwtFilename}`, 'green');

  // Also save as JSON with embedded JWT (some wallets prefer this format)
  const vcJson = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: ['VerifiableCredential', 'EmploymentCredential'],
    issuer: issuerDID,
    issuanceDate: new Date(vcPayload.nbf * 1000).toISOString(),
    expirationDate: new Date(vcPayload.exp * 1000).toISOString(),
    credentialSubject: vcPayload.vc.credentialSubject,
    proof: {
      type: 'JwtProof2020',
      jwt: vcJwt,
    },
  };

  const jsonFilename = `credential-${credentialData.employeeId || Date.now()}.json`;
  fs.writeFileSync(
    path.join(outputDir, jsonFilename),
    JSON.stringify(vcJson, null, 2),
  );
  log(`✓ JSON credential saved to: ${jsonFilename}`, 'green');

  // Decode JWT for display purposes
  const [header, payload, signature] = vcJwt.split('.');
  const decodedPayload = JSON.parse(Buffer.from(payload, 'base64').toString());

  // Create a summary file
  const summary = {
    format: 'JWT (JSON Web Token)',
    jwt: vcJwt.substring(0, 50) + '...',
    issuer: issuerDID,
    subject: subjectDID,
    employee: {
      name: credentialData.name,
      role: credentialData.role,
      company: credentialData.company,
      employeeId: credentialData.employeeId,
    },
    issuedAt: new Date(vcPayload.nbf * 1000).toISOString(),
    expiresAt: new Date(vcPayload.exp * 1000).toISOString(),
    verificationMethod: `${issuerDID}#key-1`,
  };

  fs.writeFileSync(
    path.join(outputDir, 'credential-summary.json'),
    JSON.stringify(summary, null, 2),
  );

  log('✓ Summary saved to: credential-summary.json', 'green');

  return { vcJwt, vcJson, decodedPayload };
}

// Generate QR Code
async function generateQRCode(vcJwt, vcJson, outputDir) {
  try {
    const QRCode = require('qrcode');

    header('Step 4: Generating QR Code');

    log('Creating QR code for credential import...', 'yellow');

    // Use JWT for QR code (more compact)
    const qrPath = path.join(outputDir, 'credential-qr.png');

    await QRCode.toFile(qrPath, vcJwt, {
      errorCorrectionLevel: 'M',
      type: 'png',
      width: 400,
      margin: 2,
    });

    log(`✓ QR code saved to: credential-qr.png`, 'green');

    // Create data URL for HTML embedding
    const qrDataUrl = await QRCode.toDataURL(vcJwt, {
      errorCorrectionLevel: 'M',
      width: 400,
    });

    // Create an HTML page with the QR code
    const credSubject = vcJson.credentialSubject;
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Employment Credential - ${credSubject.name}</title>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
      padding: 40px;
    }
    h1 {
      color: #333;
      border-bottom: 3px solid #4CAF50;
      padding-bottom: 15px;
      margin-bottom: 30px;
    }
    .qr-section {
      text-align: center;
      background: #f9f9f9;
      padding: 30px;
      border-radius: 10px;
      margin: 30px 0;
    }
    .qr-section img {
      max-width: 100%;
      height: auto;
      border: 3px solid #ddd;
      border-radius: 8px;
      background: white;
      padding: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 150px 1fr;
      gap: 15px;
      margin: 20px 0;
    }
    .info-label {
      font-weight: bold;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    .buttons {
      display: flex;
      gap: 10px;
      margin: 30px 0;
      flex-wrap: wrap;
    }
    button {
      background: #4CAF50;
      color: white;
      border: none;
      padding: 12px 24px;
      font-size: 16px;
      cursor: pointer;
      border-radius: 6px;
      flex: 1;
      min-width: 150px;
      transition: background 0.3s;
    }
    button:hover {
      background: #45a049;
    }
    button.secondary {
      background: #2196F3;
    }
    button.secondary:hover {
      background: #0b7dda;
    }
    .instructions {
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2196F3;
      margin: 20px 0;
    }
    .instructions h3 {
      margin-top: 0;
      color: #1976D2;
    }
    .instructions ol {
      margin: 10px 0;
      padding-left: 20px;
    }
    .instructions li {
      margin: 8px 0;
    }
    .jwt-display {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 5px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      word-break: break-all;
      margin: 10px 0;
      max-height: 200px;
      overflow-y: auto;
    }
    .badge {
      display: inline-block;
      background: #4CAF50;
      color: white;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 14px;
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎓 Employment Credential</h1>

    <div class="badge">Verifiable Credential (W3C Standard)</div>
    <div class="badge">Format: JWT</div>

    <div class="info-grid">
      <div class="info-label">Employee:</div>
      <div class="info-value">${credSubject.name}</div>

      <div class="info-label">Role:</div>
      <div class="info-value">${credSubject.role}</div>

      <div class="info-label">Company:</div>
      <div class="info-value">${credSubject.employedBy}</div>

      <div class="info-label">Department:</div>
      <div class="info-value">${credSubject.department}</div>

      <div class="info-label">Employee ID:</div>
      <div class="info-value">${credSubject.employeeId}</div>

      <div class="info-label">Start Date:</div>
      <div class="info-value">${credSubject.startDate}</div>

      <div class="info-label">Issued:</div>
      <div class="info-value">${new Date(vcJson.issuanceDate).toLocaleDateString()}</div>

      <div class="info-label">Expires:</div>
      <div class="info-value">${new Date(vcJson.expirationDate).toLocaleDateString()}</div>

      <div class="info-label">Issuer DID:</div>
      <div class="info-value" style="word-break: break-all; font-family: monospace; font-size: 12px;">${vcJson.issuer}</div>
    </div>

    <div class="qr-section">
      <h2>📱 Scan to Import to Wallet</h2>
      <p>Use any W3C Verifiable Credentials compatible wallet</p>
      <img src="${qrDataUrl}" alt="QR Code">
    </div>

    <div class="buttons">
      <button onclick="downloadJWT()">Download JWT</button>
      <button onclick="downloadJSON()" class="secondary">Download JSON</button>
      <button onclick="copyJWT()" class="secondary">Copy JWT</button>
    </div>

    <div class="instructions">
      <h3>How to Import:</h3>
      <ol>
        <li><strong>Scan QR Code:</strong> Open your wallet app and scan the QR code above</li>
        <li><strong>Import File:</strong> Download the JWT or JSON file and import via your wallet's import function</li>
        <li><strong>Copy/Paste:</strong> Copy the JWT and paste it into your wallet</li>
      </ol>
      <p><strong>Compatible Wallets:</strong> Lissi Wallet, Esatus Wallet, Walt.id Wallet, Veramo Agent, and any W3C VC-compliant wallet supporting did:web</p>
    </div>

    <details style="margin-top: 30px;">
      <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: #f5f5f5; border-radius: 5px;">
        🔍 View JWT (Click to expand)
      </summary>
      <div class="jwt-display">${vcJwt}</div>
    </details>

    <details style="margin-top: 15px;">
      <summary style="cursor: pointer; font-weight: bold; padding: 10px; background: #f5f5f5; border-radius: 5px;">
        📄 View JSON Format (Click to expand)
      </summary>
      <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto;">${JSON.stringify(vcJson, null, 2)}</pre>
    </details>
  </div>

  <script>
    const vcJwt = ${JSON.stringify(vcJwt)};
    const vcJson = ${JSON.stringify(vcJson, null, 2)};

    function downloadJWT() {
      const blob = new Blob([vcJwt], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employment-credential.jwt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function downloadJSON() {
      const blob = new Blob([JSON.stringify(vcJson, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'employment-credential.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    function copyJWT() {
      navigator.clipboard.writeText(vcJwt)
        .then(() => {
          alert('✅ JWT copied to clipboard!');
        })
        .catch(err => {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = vcJwt;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          alert('✅ JWT copied to clipboard!');
        });
    }
  </script>
</body>
</html>
    `;

    fs.writeFileSync(path.join(outputDir, 'credential-display.html'), html);
    log('✓ Display page saved to: credential-display.html', 'green');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      log(
        '\n⚠️  QR code generation skipped (install qrcode package: npm install qrcode)',
        'yellow',
      );
    } else {
      log('\n⚠️  QR code generation failed: ' + err.message, 'yellow');
    }
  }
}

// Main CLI function
async function main() {
  console.clear();
  log(
    '╔════════════════════════════════════════════════════════════╗',
    'bright',
  );
  log(
    '║     Verifiable Credentials Issuer CLI Tool (did-jwt-vc)   ║',
    'bright',
  );
  log(
    '║        Create Keys, DID, and Issue Employment VCs          ║',
    'bright',
  );
  log(
    '╚════════════════════════════════════════════════════════════╝',
    'bright',
  );

  try {
    // Setup
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, -5);
    const outputDir = path.join(process.cwd(), 'bin', 'vc-output', timestamp);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    log(`\n📁 Output directory: ${outputDir}\n`, 'cyan');

    // Get domain
    log(
      '═══════════════════════════════════════════════════════════',
      'bright',
    );
    const domain = await question(
      'Enter your domain (e.g., yourcompany.com or localhost:3000): ',
    );

    if (!domain) {
      log('❌ Domain is required!', 'red');
      rl.close();
      return;
    }

    // Step 1: Generate keys
    const { publicKey, privateKey, jwk, privateKeyHex } =
      generateKeys(outputDir);

    // Step 2: Create DID
    const { didDocument, did } = createDIDDocument(domain, jwk, outputDir);

    // Get credential details
    log(
      '\n═══════════════════════════════════════════════════════════',
      'bright',
    );
    log("Now let's create an employment credential", 'cyan');
    log(
      '═══════════════════════════════════════════════════════════\n',
      'bright',
    );

    const name = await question('Employee name: ');
    const role = await question('Role/Job title: ');
    const department = await question('Department: ');
    const employeeId = await question('Employee ID: ');
    const company = await question('Company name: ');
    const startDate =
      (await question('Start date (YYYY-MM-DD) [press Enter for today]: ')) ||
      new Date().toISOString().split('T')[0];
    const subjectDID = await question(
      'Employee DID (optional, press Enter to auto-generate): ',
    );

    const credentialData = {
      name: name || 'John Doe',
      role: role || 'Software Engineer',
      department: department || 'Engineering',
      employeeId: employeeId || 'EMP001',
      company: company || 'Your Company Inc',
      startDate: startDate,
      subjectDID: subjectDID || null,
    };

    // Step 3: Issue credential
    const { vcJwt, vcJson, decodedPayload } = await issueCredential(
      did,
      credentialData,
      privateKeyHex,
      outputDir,
    );

    // Step 4: Generate QR code
    await generateQRCode(vcJwt, vcJson, outputDir);

    // Final summary
    header('✅ Complete!');

    log('All files have been generated in:', 'green');
    log(`   ${outputDir}\n`, 'bright');

    log('Generated files:', 'cyan');
    log('   📄 private-key.pem       - Private key (keep secure!)', 'yellow');
    log(
      '   📄 private-key.hex       - Private key hex format (for signing)',
      'yellow',
    );
    log('   📄 public-key.pem        - Public key', 'yellow');
    log('   📄 public-key.jwk        - Public key in JWK format', 'yellow');
    log(
      '   📄 did.json              - DID document (upload to server)',
      'yellow',
    );
    log(
      '   📄 credential-*.jwt      - Verifiable Credential (JWT format)',
      'yellow',
    );
    log(
      '   📄 credential-*.json     - Verifiable Credential (JSON format)',
      'yellow',
    );
    log('   📄 credential-summary.json - Credential overview', 'yellow');
    log('   📄 credential-qr.png     - QR code for wallet import', 'yellow');
    log('   📄 credential-display.html - Display page with QR code', 'yellow');

    const actualDomain = domain.replace(/%3A/g, ':');
    const protocol = actualDomain.includes('localhost') ? 'http' : 'https';

    log('\n📋 Next steps:', 'cyan');
    log(
      `   1. Upload did.json to: ${protocol}://${actualDomain}/.well-known/did.json`,
      'blue',
    );
    log('   2. Ensure CORS headers are set on your server:', 'blue');
    log('      Access-Control-Allow-Origin: *', 'yellow');
    log('      Content-Type: application/json', 'yellow');
    log('   3. Test DID resolution:', 'blue');
    log(
      `      curl ${protocol}://${actualDomain}/.well-known/did.json`,
      'yellow',
    );
    log(
      '   4. Open credential-display.html to view/share the credential',
      'blue',
    );
    log('   5. Import credential to a wallet:', 'blue');
    log('      - Scan the QR code with a wallet app', 'yellow');
    log('      - Upload the .jwt or .json file', 'yellow');
    log('      - Copy/paste the JWT string', 'yellow');

    log('\n🔍 Verification:', 'cyan');
    log('   Wallets will:', 'blue');
    log(`   1. Resolve your DID: ${did}`, 'yellow');
    log(
      `   2. Fetch: ${protocol}://${actualDomain}/.well-known/did.json`,
      'yellow',
    );
    log('   3. Extract the public key', 'yellow');
    log('   4. Verify the JWT signature', 'yellow');
    log('   5. Display the credential if valid ✓', 'yellow');

    log('\n⚠️  Security reminders:', 'red');
    log('   - Never commit private keys to version control', 'yellow');
    log('   - Store private keys in a secure secrets manager', 'yellow');
    log('   - Use HTTPS for production DID hosting', 'yellow');
    log('   - Only share credentials with intended recipients', 'yellow');

    log('\n💡 Compatible Wallets:', 'cyan');
    log('   - Lissi Wallet (iOS/Android)', 'blue');
    log('   - Esatus Wallet (iOS/Android)', 'blue');
    log('   - Walt.id Web Wallet', 'blue');
    log('   - Veramo Agent', 'blue');
    log('   - Any W3C VC wallet supporting did:web + JWT format', 'blue');
  } catch (error) {
    log('\n❌ Error: ' + error.message, 'red');
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    rl.close();
  }
}

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateKeys, createDIDDocument, issueCredential };
