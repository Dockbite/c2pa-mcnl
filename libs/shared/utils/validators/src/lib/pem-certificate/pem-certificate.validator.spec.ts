import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { pemCertificateValidator } from './pem-certificate.validator';

// Helper to create a File with working text() method for Node.js
function createTestFile(content: string, name: string, type: string): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });

  // Ensure text() method works in Node environment
  if (!file.text) {
    (file as any).text = () => Promise.resolve(content);
  }

  return file;
}

describe('pemCertificateValidator', () => {
  let certificateModel: ReturnType<typeof signal<{ certificate: File | null }>>;
  let certificateForm: ReturnType<typeof form<{ certificate: File | null }>>;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    TestBed.runInInjectionContext(() => {
      certificateModel = signal<{ certificate: File | null }>({
        certificate: null,
      });

      certificateForm = form(certificateModel, (schemaPath) => {
        pemCertificateValidator(schemaPath.certificate);
      });
    });
  });

  async function flushAsync() {
    await TestBed.tick();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await TestBed.tick();
  }

  it('should return no errors for empty value', async () => {
    certificateModel.set({ certificate: null });
    await flushAsync();

    expect(certificateForm.certificate().errors()).toEqual([]);
  });

  it('should return error for non-file value', async () => {
    certificateModel.set({ certificate: 'not a file' as any });
    await flushAsync();

    expect(certificateForm.certificate().errors()).toContainEqual(
      expect.objectContaining({ kind: 'pemCertificate' }),
    );
  });

  it('should return error for invalid PEM certificate', async () => {
    const invalidFile = createTestFile(
      'invalid content',
      'cert.pem',
      'text/plain',
    );
    certificateModel.set({ certificate: invalidFile });
    await flushAsync();

    expect(certificateForm.certificate().errors()).toContainEqual(
      expect.objectContaining({
        kind: 'pemCertificate',
        message: 'Enter a valid PEM certificate',
      }),
    );
  });

  it('should return no errors for valid PEM certificate', async () => {
    const validPem =
      '-----BEGIN CERTIFICATE-----\n' +
      'MIICNzCCAd6gAwIBAgIBAzAKBggqhkjOPQQDAjBrMQswCQYDVQQGEwJOTDEVMBMG\n' +
      'A1UECBMMWnVpZC1Ib2xsYW5kMRMwEQYDVQQKEwpNeSBDb21wYW55MRYwFAYDVQQL\n' +
      'Ew1JVCBEZXBhcnRtZW50MRgwFgYDVQQDEw9JbnRlcm1lZGlhdGUgQ0EwHhcNMjYw\n' +
      'MjA1MTAzOTQzWhcNMjcwMjA1MTAzOTQzWjBjMQswCQYDVQQGEwJOTDEVMBMGA1UE\n' +
      'CBMMWnVpZC1Ib2xsYW5kMRMwEQYDVQQKEwpNeSBDb21wYW55MRYwFAYDVQQLEw1J\n' +
      'VCBEZXBhcnRtZW50MRAwDgYDVQQDEwdMZWFmIENBMFkwEwYHKoZIzj0CAQYIKoZI\n' +
      'zj0DAQcDQgAE3Jx6t7DcBD6z9tnpFCJ4FlAN+RN3byMMjOciYM/M68ilKeEIa+D+\n' +
      'wBlK5cJKDhPZSQKqet4LJUS9AKB1kOLYcaN7MHkwDwYDVR0TAQH/BAUwAwIBADAW\n' +
      'BgNVHSUBAf8EDDAKBggrBgEFBQcDBDAOBgNVHQ8BAf8EBAMCB4AwHQYDVR0OBBYE\n' +
      'FLl1SyrQ35Ui79+o/b06PahrH46FMB8GA1UdIwQYMBaAFF5XbzoU2QGJs6bBjV9c\n' +
      'r+NialcHMAoGCCqGSM49BAMCA0cAMEQCIEN06EocL2SGzd0u/dwXhYLERXBu6cOH\n' +
      'Owtv4A2coxbrAiABuu0/qhpbBigYJpQnceuXmfXKjvAev1meH89WdQ5oqQ==\n' +
      '-----END CERTIFICATE-----';

    const validFile = createTestFile(
      validPem,
      'cert.pem',
      'application/x-x509-ca-cert',
    );
    certificateModel.set({ certificate: validFile });
    await flushAsync();

    expect(certificateForm.certificate().errors()).toEqual([]);
  });
});
