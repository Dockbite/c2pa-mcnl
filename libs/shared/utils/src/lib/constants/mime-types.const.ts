export const MIME_TYPES = {
  IMAGE_JPEG: 'image/jpeg',
  IMAGE_PNG: 'image/png',
  IMAGE_HEIC: 'image/heic',
  IMAGE_HEIF: 'image/heif',
  VIDEO_MP4: 'video/mp4',
  AUDIO_MPEG: 'audio/mpeg',
  APPLICATION_JSON: 'application/json',
  APPLICATION_LD_JSON: 'application/ld+json',
  APPLICATION_X_X509_CA_CERT: 'application/x-x509-ca-cert',
  APPLICATION_X_PEM_FILE: 'application/x-pem-file',
};

export const CERTIFICATE_MIME_TYPES = [
  MIME_TYPES.APPLICATION_X_X509_CA_CERT,
  MIME_TYPES.APPLICATION_X_PEM_FILE,
];

export const DID_MIME_TYPES = [
  MIME_TYPES.APPLICATION_JSON,
  MIME_TYPES.APPLICATION_LD_JSON,
];

export const ASSET_MIME_TYPES = [
  MIME_TYPES.IMAGE_JPEG,
  MIME_TYPES.IMAGE_PNG,
  MIME_TYPES.IMAGE_HEIC,
  MIME_TYPES.IMAGE_HEIF,
  MIME_TYPES.VIDEO_MP4,
  MIME_TYPES.AUDIO_MPEG,
];
