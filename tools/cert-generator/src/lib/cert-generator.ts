import {
  AuthorityKeyIdentifierExtension,
  BasicConstraintsExtension,
  ExtendedKeyUsage,
  ExtendedKeyUsageExtension,
  KeyUsageFlags,
  KeyUsagesExtension,
  SubjectKeyIdentifierExtension,
  X509CertificateGenerator,
} from '@peculiar/x509';

export async function generateTestCertificate(value = '') {
  // https://github.com/PeculiarVentures/x509/issues/67
  const rootKeys = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify'],
  );
  const rootCert = await X509CertificateGenerator.createSelfSigned(
    {
      serialNumber: '01',
      name: `C=NL, ST=Zuid-Holland, O=Dawn Technology${value}, OU=Development, CN=Root${value}`,
      keys: rootKeys,
      signingAlgorithm: {
        name: 'ECDSA',
        hash: 'SHA-256',
      },
      extensions: [
        new BasicConstraintsExtension(true, 3, true),
        new KeyUsagesExtension(
          KeyUsageFlags.digitalSignature +
            KeyUsageFlags.keyCertSign +
            KeyUsageFlags.cRLSign,
          true,
        ),
        await SubjectKeyIdentifierExtension.create(rootKeys.publicKey, false),
        await AuthorityKeyIdentifierExtension.create(rootKeys.publicKey, false),
      ],
    },
    crypto,
  );

  const intermediateKeys = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify'],
  );
  const intermediateCert = await X509CertificateGenerator.create(
    {
      serialNumber: '02',
      subject: `C=NL, ST=Zuid-Holland, O=Dawn Technology${value}, OU=Development, CN=Intermediate${value}`,
      issuer: rootCert.subject,
      signingKey: rootKeys.privateKey,
      publicKey: intermediateKeys.publicKey,
      signingAlgorithm: {
        name: 'ECDSA',
        hash: 'SHA-256',
      },
      extensions: [
        new BasicConstraintsExtension(false, 2, true),
        new ExtendedKeyUsageExtension([ExtendedKeyUsage.emailProtection], true),
        new KeyUsagesExtension(KeyUsageFlags.digitalSignature, true),
        await SubjectKeyIdentifierExtension.create(
          intermediateKeys.publicKey,
          false,
        ),
        await AuthorityKeyIdentifierExtension.create(rootKeys.publicKey, false),
      ],
    },
    crypto,
  );

  const leafKeys = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify'],
  );
  const leafCert = await X509CertificateGenerator.create(
    {
      serialNumber: '03',
      subject: `C=NL, ST=Zuid-Holland, O=Dawn Technology${value}, OU=Development, CN=Leaf${value}`,
      issuer: intermediateCert.subject,
      signingKey: intermediateKeys.privateKey,
      publicKey: leafKeys.publicKey,
      signingAlgorithm: {
        name: 'ECDSA',
        hash: 'SHA-256',
      },
      extensions: [
        new BasicConstraintsExtension(false, 1, true),
        new ExtendedKeyUsageExtension([ExtendedKeyUsage.emailProtection], true),
        new KeyUsagesExtension(KeyUsageFlags.digitalSignature, true),
        await SubjectKeyIdentifierExtension.create(leafKeys.publicKey, false),
        await AuthorityKeyIdentifierExtension.create(
          intermediateKeys.publicKey,
          false,
        ),
      ],
    },
    crypto,
  );

  console.log(
    [
      rootCert.toString('pem'),
      intermediateCert.toString('pem'),
      leafCert.toString('pem'),
    ].join('\n'),
  );

  // Log the private key in PKCS8 format
  const leafPrivateKeyPkcs8 = await toPkcs8Bytes(leafKeys.privateKey);
  console.log(
    '-----BEGIN PRIVATE KEY-----\n',
    Buffer.from(leafPrivateKeyPkcs8).toString('base64'),
    '\n-----END PRIVATE KEY-----',
  );

  return {
    leafCert,
    leafKeys,
    intermediateCert,
    intermediateKeys,
    rootCert,
    rootKeys,
  };
}

export async function toPkcs8Bytes(key: CryptoKey): Promise<Uint8Array> {
  const der = await crypto.subtle.exportKey('pkcs8', key); // ArrayBuffer (DER)
  return new Uint8Array(der);
}
