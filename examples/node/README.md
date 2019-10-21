# AirSwap Maker: Node Example

```
yarn install
```

## Setup

Environment variables are loaded from a `.env` file in the root directory. The following must be set:

- `SWAP_ADDRESS` - The address of the Swap contract you intend to use.
- `PRIVATE_KEY` - The private key of an account to use for trading.
- `PORT` - The HTTP port that your server will run on.

## Example

```
SWAP_ADDRESS=0x6f337ba064b0a92538a4afdcf0e60f50eeae0d5b
PRIVATE_KEY=...
PORT=8000
```

# Running the Maker

```
yarn start
```

# Testing the Maker

```
yarn test
```
