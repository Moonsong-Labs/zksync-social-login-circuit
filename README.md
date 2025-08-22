# ZKSync SSO social recovery circuits

This repo contains circuits to verify that a JWT was signed by a given public
key, and issued by a specific issuer, to a given user in the context of a given
app.

There is also code to interact with the circuits in a user-friendly way directly
from the browser.

## About the repo

This repo contains code written using the
[circom language](https://docs.circom.io/). In order to generate and verify
proofs, several steps are required:

This repo contains not only the circuits itself, but also some tools to
facilitate input generation, testing and development.

There is also a `lib` folder that contains helper code to generate proofs for
these circuits in the browser itself.

## Gettings started

First, install dependencies:

## Circom

https://docs.circom.io/getting-started/installation/

## Snarkjs

``` bash
npm i -g snarkjs
```

## Node dependencies

```bash
pnpm install
```

Because working with circom requires a ton of little steps, this project has an
internal CLI tool that can be used to perform the steps needed to make the
circuit work:

```bash
pnpm tool --help
```

# Prepare inputs

In order to run the circuit for the first time, you need to generate all the inputs. The internal cli
facilitates the process, but still it requires several steps.

## Step 1: Preparation

Before executing the circuit it has to be compiled and prepared:

``` shell
pnpm tool compile
```

No, we need to derive all the key files:

``` shell
pnpm tool download-ptau # This has to download a 1.1gb file. It might take a while.
pnpm tool zkey
pnpm tool prepare-zkey
pnpm tool vkey
```

In a production environment, this circuit is verified inside a contract. The contract defines
a lot of values, like a nonce to avoid replay attacks or the address of the contracts.

During cirtuit development and test these values can be hand-picked:

``` sh
echo "BLINDING_FACTOR=0x01" >> .env
echo "SALT=0x0202" >> .env
echo "PASSKEY_HASH=0x030303" >> .env
echo "CONTRACT_NONCE=0x04040404" >> .env
echo "TIMESTAMP_LIMIT=0x111111" >> .env
echo "SENDER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" >> .env
echo "TARGET_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8" >> .env
```

Once this is set, we need get our nonce:

``` shelll
pnpm tool create-nonce
```

This prints 2 values: Packed nonce and senderHash. The packed nonce is the combination
between the blinding factor and the senderHash. We only need to store the senderHash to move forward:

```shell
echo "NONCE_CONTENT=<senderHash>" >> .env
```


Now we can get a valid jwt:

```shell
pnpm tool get-jwt
```

This is going to print a link to login to a dummy google app.
After a jwt and a jwk modulus are going to be printed in the terminal. Both need to
be saved as en vars

``` shell
echo 'RAW_JWT=<jwt_value>' >> .env
echo 'JWK_MODULUS=<jwt_value>' >> .env
```

At this point the .env file should look like this:

``` dotenv
BLINDING_FACTOR=0x01
SALT=0x0202
PASSKEY_HASH=0x030303
CONTRACT_NONCE=0x04040404
TIMESTAMP_LIMIT=0x111111
SENDER_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
TARGET_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
NONCE_CONTENT=0xb81fa6134c853763ec7997b08889d6b8b5a77bef655ddd5a9b46a9ad03980adb
RAW_JWT=eyJhbGciOiJSUzI1NiIsImtpZCI6IjE0OTljMTU0Y2NjOGEyNWUyNGQ4ZGU4YjFhOWY4NDVhZWZiNmYzY2EiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI4NjYwNjg1MzU4MjEtZTllbTBoNzNwZWU5M3E0ZXZvYWp0bm5rbGRzamhxZGsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI4NjYwNjg1MzU4MjEtZTllbTBoNzNwZWU5M3E0ZXZvYWp0bm5rbGRzamhxZGsuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDc3ODAwMjQ4NDAzODY4NDA5MDEiLCJub25jZSI6IkptYlZxYmJHM1kwZDVGR0ZzVmM3dkxPaTZka003Z1AwTm5NS3lIWVR2VEE9IiwibmJmIjoxNzU1ODYzMTI1LCJpYXQiOjE3NTU4NjM0MjUsImV4cCI6MTc1NTg2NzAyNSwianRpIjoiNWFiNTExZGNhYjcyNTI2OTRjMDllOTYzYzQzZTU4MzBkZDA4NjE3ZSJ9.HB9IEfGMRXJ7exPkp66Bvh92dqUGd9PXDNXprU8AeJUhD76XUpIUvwdTlA2u50Gj4pwwnb3VaTnVXtyZniLMOVaOm6cbPQNXbWZaHmjeLya-NjiW1NWCFaV0laUA05sPiPtbNjwPN6xTTyJ0tTIJdUxni-Hmo_1ETnKx6HTFrqCRvhZ69gT0v9EuJ9MN7XMCA7XCOVUEhUWa00kPP6u_ezlcQNBd8vPBOwA3FLcPi2jOgXCnimA_tLQVJx547jLK0SqaJ4X9NqrOLb6t8MX1neS8evqX_aSD75fxPKdJnZ8fRuKmD1wofLJnaahzD3zvlq2LXDxgNs9dvyn-r4EdZQ
JWK_MODULUS=tH5pdWojgagY73Hy2WtH8vhoKpGAmP01E1CSuZn-02U_hTjFzAoDAiT6d7CcP14VHg4AGRWY82NCw5HL9vapXilR0Y1g3lFWwRCU1oXjApzhkTt3RVbM-jPWr5aEC_QN6yTE9qK1lwz1_x03rPMOuSP7BcDQCNazPLPwIDxMtzT47asH25OrtiN-nFA_imMAMrqKEBhmYtutGqKqhs6vI_PsNHxLFyR26Z-CgGrQ21Eensu0jl29vl0uYBfVUG4XpzOp7A5_rwVPaHx5ZibUSVG-eVu0RYObSKJTXQg8NKs3bEUHk9Z563PgTA9mf5VsvenNm6DxCJrvztxKvhg1Nw
```


With this, the witness can be calculated:

```shell
pnpm tool input
pnpm tool witness
```

With the witness the proof can be generated

```shell
pnpm tool prove
```

Lastly it can be verified:

```shell
pnpm tool verify
```

## Circuits

The main circuit for this project is:
[`jwt-tx-validation.circom`](./jwt-tx-validation.circom)

That circuit is in charge of performing all the validations on the JWT.

Inside the `utils` folder we have several templates that are used as components
of the main one.

Inside the `test` folder there are circuits used exclusively for testing
purposes.
