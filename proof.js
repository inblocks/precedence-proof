#!/usr/bin/env node

const crypto = require('crypto')
const fs = require('fs')

const { fromRpcSig, publicToAddress, ecrecover, hashPersonalMessage } = require('ethereumjs-util')
const Trie = require('merkle-patricia-tree')

const usage = () => {
  console.log(`USAGE:

      - From file:
      $ precedence-proof [FILE]

      - From stdin:
      $ cat FILE | precedence-proof
`)
  process.exit(1)
}

const printResultAndExit = (result) => {
  console.log(JSON.stringify(result, null, 2))
  process.exit(result.verified ? 0 : 1)
}

const sha256 = value => {
  return crypto.createHash('sha256').update(value).digest('hex')
}

!(async () => {
  if (process.argv.some((arg) => arg === '-h' || arg === '--help')) {
    usage()
  }

  // input from Precedence
  let input
  if (process.argv.length === 2) {
    const timeout = setTimeout(() => {
      usage()
    }, 100)
    input = await new Promise(resolve => {
      const chuncks = []
      process.stdin.on('data', chunck => {
        clearTimeout(timeout)
        chuncks.push(chunck)
      })
      process.stdin.on('end', () => {
        resolve(Buffer.concat(chuncks))
      })
    })
  } else if (process.argv.length === 3) {
    input = fs.readFileSync(process.argv[2])
  } else {
    usage()
  }
  input = JSON.parse(input)

  const result = {
    WARNING: `Only the date of anchoring of the root block (${input.block.root}) by a trusted tier can be considered as the date of existence of the original document.`,
    verified: false,
    value: undefined,
    message: undefined,
    error: undefined,
  }

  // verify that the SHA-256 of the provided data is equal to the provided hash
  if (input.data) {
    const hash = sha256(Buffer.from(input.data, 'base64'))
    if (hash !== input.hash) {
      result.error = `The SHA-256 hash of the provided data (${hash}) is not equal to the provided hash (${input.hash}).`
      printResultAndExit(result)
    }
  } else {
    result.message = `The original document is not provided, so you must now verify that its SHA-256 hash is equal to ${input.hash}.`
  }

  // verify that the provided hash is signed
  try {
    const vrs = fromRpcSig(input.signature)
    if ('0x' + publicToAddress(ecrecover(hashPersonalMessage(Buffer.from(input.hash, 'hex')), vrs.v, vrs.r, vrs.s)).toString('hex') !== input.address) {
      result.error = `The provided hash is not signed.`
      printResultAndExit(result)
    }
  } catch (e) {
    result.error = `Ethereum signature error: ${e.message}`
    printResultAndExit(result)
  }

  // verify that the SHA-256 hash of '<input.seed> <input.hash>' is equal to the 'input.provable.hash' value
  if (sha256(`${input.seed} ${input.hash}`) !== input.provable.hash) {
    result.error = `The provided hash (${input.hash}) is not included in the provided provable document.`
    printResultAndExit(result)
  }

  // verify the Merkle Patricia Trie proof, extracting the value
  let value
  {
    // Merkle Patricia Trie root hash
    const root = Buffer.from(input.block.root, 'hex')

    // Merkle Patricia Trie key
    const key = Buffer.from(input.provable.id, 'hex')

    // Merkle Patricia Trie prove
    const proof = input.block.proof.map(hex => Buffer.from(hex, 'hex'))

    try {
      value = await new Promise((resolve, reject) => {
        try {
          Trie.verifyProof(root, key, proof, (error, value) => {
            if (error) {
              return reject(error)
            }
            resolve(value.toString('hex'))
          })
        } catch (e) {
          reject(e)
        }
      })
    } catch (e) {
      result.error = `Merkle Patricia Trie error: ${e.message}`
      printResultAndExit(result)
    }
  }

  // verify that the extracted value from the proof is equal to the SHA-256 hash of the provided provable document
  if (value !== sha256(JSON.stringify(input.provable))) {
    result.error = `The value extracted from the proof (${value}) is not equal to the SHA-256 hash of the provided provable document (${expectedValue})`
    printResultAndExit(result)
  }

  // verified!
  result.verified = true
  printResultAndExit(result)
})()
