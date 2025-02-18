# ZkSync SSO social recovery circuits

This repo contains circuits to verify that a JWT was signed
by a given public key, and issues by a specific issuer,
to a given user in the context of a given app.

There is also code to generate to interact
with the circuits in nice way inside the user's
browser.

## Getting started

First, install dependencies:

```bash
pnpm install
```

Because working with cirom requires a ton of little steps, this
project has an internal CLI tool that can be used to perform
the steps needed to make the circuit work:

```bash
# Compile the circuit
pnpm tool compile <file.circom>

# Generate circuit input
pnpm tool compile <file.circom>

# Download powers of tau
pnpm tool download-ptau

# Generate zkey
pnpm tool zkey <file.circom>

# Prepare zkey
pnpm tool prepare-zkey <file.circom>

# Generate witness
pnpm tool witness <file.circom>

# Generate verifier
pnpm tool verifier <file.circom>

# Export verifier to sso contracts pacakage
pnpm tool export-verifier <file.circom>
```
