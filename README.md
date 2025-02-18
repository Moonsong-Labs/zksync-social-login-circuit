# ZkSync SSO social recovery circuits

This repo contains circuits to verify that a JWT was signed
by a given public key, and issues by a specific issuer,
to a given user in the context of a given app.

There is also code to interact
with the circuits in nice way inside the user's
browser.

## About the repo

This repo contains code writen using the [circom language](https://docs.circom.io/).
In order to generate proofs and verify those proofs several steps are needed:

1. Compile the circuit
2. Generate the input
3. Perform the trusted setup
4. Generate the zkey file
5. Prepare zkey file
6. Generate witness
7. Generate proof
8. Verify proof

This repo contains not only the circuits itself, but also
some tools to facilitate all those processes.

There is also a `lib` folder that contains helper
code to generate proofs for these circuits in the browser itself.

# Gettings started

First, install dependencies:

```bash
pnpm install
```

Because working with circom requires a ton of little steps, this
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


## Circuits

The main circuit for this project is: [`jwt-tx-validation.circom`](./jwt-tx-validation.circom)

That circuit is in charge of performing all the validations on the JWT.

Inside the `utils` folder we have several templates that are used as components of the main one.

Inside the `test` folder there are circuits used exclusively for testing purposes.

