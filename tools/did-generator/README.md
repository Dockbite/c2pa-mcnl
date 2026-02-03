# DID Generator CLI

CLI tool for generating DIDs, keys, and issuing credentials.

### Caveat

Be aware, the generated `dist/did-generator` folder is not automatically re-generated. This is so that multiple output folders can be created without overwriting previous outputs. If you want to regenerate the `dist/did-generator` folder, you will need to delete it manually before running the build command again.

### CLI Usage

```bash
# Generate everything interactively
nx run did-generator:generate

# Generate with options
nx run did-generator:generate --domain example.com --name "John Doe"

# Generate keys only (interactive by default)
nx run did-generator:keys

# Generate keys with options
nx run did-generator:keys --output ./my-keys --no-interactive

# Generate DID from existing keys (interactive by default)
nx run did-generator:did

# Generate DID with options
nx run did-generator:did --domain example.com --key-file ./public-key.jwk

# Issue credential with existing DID (interactive by default)
nx run did-generator:credential

# Issue credential with options
nx run did-generator:credential --did "did:web:example.com" --key-file ./private-key.hex

# Use --no-interactive flag to disable interactive prompts (all commands)
nx run did-generator:keys --no-interactive
nx run did-generator:did --domain example.com --key-file ./public-key.jwk --no-interactive
nx run did-generator:credential --did "did:web:example.com" --key-file ./private-key.hex --no-interactive
```
