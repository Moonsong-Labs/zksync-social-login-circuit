# ZKSync SSO social recovery circuits

This repo contains circuits to verify that a JWT was signed by a given public
key, and issued by a specific issuer, to a given user in the context of a given
app.

This repo also includes a library to interact with the circuit from typescript
in a confortable way, and a CLI to help with the development tasks


## About the repo

This repo contains code written using the
[circom language](https://docs.circom.io/). In order to generate and verify
proofs, several steps are required:

1. Compile the circuit
2. Generate the input
3. Perform the trusted setup
4. Generate the zkey file
5. Prepare zkey file
6. Generate witness
7. Generate proof
8. Verify proof

There is also another option that is download an already repared
zkey file. Then, that zkey file can be used.

## Gettings started

First, install dependencies:

```bash
pnpm install
```

You are going to also need circom installed:

https://docs.circom.io/getting-started/installation/

Because working with circom requires a ton of little steps, this project has an
internal CLI tool that can be used to perform the steps needed to make the
circuit work:

``` bash
pnpm tool --help
```

Some useful commands:

```bash
# Compile the circuit
pnpm tool compile <file.circom>

# Generate circuit input for the main circuit
pnpm tool input

# Download powers of tau
pnpm tool download-ptau # Use size 20 as default

# Generate zkey
pnpm tool zkey <file.circom>

# Prepare zkey
pnpm tool prepare-zkey <file.circom>

# Generate witness
pnpm tool witness <file.circom>

# Generate verifier
pnpm tool verifier <file.circom>

# Export verifier to sso contracts pacakage
pnpm tool export-verifier

# Export test verifier
pnpm tool export-verifier-test

# Exports circuit file
pnpm tool export-circuit
```

## Circuits

The main circuit for this project is:
[`jwt-tx-validation.circom`](./jwt-tx-validation.circom)

That circuit is in charge of performing all the validations on the JWT.

Inside the `utils` folder we have several templates that are used as components
of the main one.

Inside the `test` and `unit-tests` folder there are circuits used exclusively for testing
purposes.

## Upload prepared zkey to a bucket

The easiest way to make a prepared zkey file public is upload
it to a s3-like bucket. That can be done as follows.

First set the following environment variables:

```dotenv
BUCKET_ENDPOINT="<your-bucket-endpoint>"
BUCKET_KEY="<your-key-id>"
BUCKET_SECRET="<your-key-secret>"
```

Please also ensure that circom is installed:

https://docs.circom.io/getting-started/installation/

Once those are set you can run:

``` bash
pnpm tool upload-final-zkey -f
```

The `-f` flag is going to force the process to recompile the circuit
and recreate the contributions to the zkey file.

The process takes some time, but at the end both the zkey and the wasm
files will be uploaded to the bucket with public read settings.
