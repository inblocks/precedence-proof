[DRAFT]

```bash
npm link

# from file
precedence-proof ./example.json

# from stdin
cat example.json | precedence-proof
```

Example
```json
{
  "provable": {
    "id": "3a31d56747785fafe73bc6745a1d21c6b8c38d14b7573fa3fe30745aded1e2c4",
    "seed": "90588f44c4a6f06afe439975d5f8b02adb96f3f51766cc1edcb68833e522d45f",
    "hash": "ef070eeaea3484469a122936aaebef2b6691aa102214258a3db85436158b393a",
    "address": "cb5b88819991a4012c1eeb6d682218a7e13ed3c31108b1147553e6bc4a68aae5",
    "signature": "bb0d72a379bf5c4e815c9cac60f921629c725d7b1fae2962bbea0e5ef8a6c173",
    "chains": {},
    "previous": []
  },
  "timestamp": 1561538964626,
  "seed": "7d159e8715e23696785341484c7b46d168799790a353bf18cd297c6c3f613c73",
  "hash": "3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8",
  "address": "0x4592350babefcc849943db091b6c49f8b86f8aaa",
  "signature": "0xdb80ef509ff9936369c88442f1c20e7c7508b1d8337138b63d673229ddf379ef4ac56a98ba87f69e5d18a436c76a1c2688370c051336f8a3e931a9243b57a7d81b",
  "chains": {},
  "data": "dmFsdWUgNQ==",
  "block": {
    "root": "9e138e4dd388a80ef2019f61d0aa2b1a2845ee2bd795dd5de7bc87745b040efe",
    "proof": [
      "f8d1a078ff96f7bf777bfab5fe64d506e0876f64c53a9dbb593a21899525dfa5c74572a0a44b5d65dac1aeda03eea0911a80cba8f4e331b788a1dbed6e50cb2a3c1ba801a0ee4153966b8bc020d968edd5ebd55f95194d8a00af0abefa202801b8b0d7fe08a0e85e1d2fe6acc43bc49b8874b85e6a0525ce5b48b00105fec3c59b4b82fd50d2808080a012e31e9b9329ca4ec13723f4ed0639d7297b1718118ed0f98280762a1d08adcc80a01b1d1feb52fd96b0836d387d260c76e754fc41d01994a82892b4606b5384ff2780808080808080",
      "f842a03a31d56747785fafe73bc6745a1d21c6b8c38d14b7573fa3fe30745aded1e2c4a0fffa007b2555c4a3cd5e2d54db17f81d210461630b5cd18baa823e1caf053923"
    ]
  }
}
```

Verification steps:
- if the original data is provided (`dmFsdWUgNQ==`), we verify that its SHA-256 hash is equal to the `hash` value (`3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8`)
- we verify the signature ([https://etherscan.io/verifySig](https://etherscan.io/verifySig)):
  - address: `0x4592350babefcc849943db091b6c49f8b86f8aaa`
  - signature: `0xdb80ef509ff9936369c88442f1c20e7c7508b1d8337138b63d673229ddf379ef4ac56a98ba87f69e5d18a436c76a1c2688370c051336f8a3e931a9243b57a7d81b`
  - original message: the `hash` value (`3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8`)
- we verify that the obfuscated fingerprint of the `hash` value is included in the provable document: SHA-256 hash of `<seed> <hash>` (`7d159e8715e23696785341484c7b46d168799790a353bf18cd297c6c3f613c73 3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8`) is equal to the `provable.hash` value (`ef070eeaea3484469a122936aaebef2b6691aa102214258a3db85436158b393a`)
- we verify and extract the value from the [Merkle Patricia Trie](https://github.com/ethereumjs/merkle-patricia-tree) inputs:
  - root: `block.root` (`9e138e4dd388a80ef2019f61d0aa2b1a2845ee2bd795dd5de7bc87745b040efe`)
  - prove: `block.proof`
  - key: `provable.id` (`3a31d56747785fafe73bc6745a1d21c6b8c38d14b7573fa3fe30745aded1e2c4`)
- we verify that the extracted value is equal to the SHA-256 hash of `JSON.stringify(provable)` (`fffa007b2555c4a3cd5e2d54db17f81d210461630b5cd18baa823e1caf053923`)

Output:
- example.json
```json
{
  "WARNING": "Only the date of anchoring of the root block (9e138e4dd388a80ef2019f61d0aa2b1a2845ee2bd795dd5de7bc87745b040efe) by a trusted tier can be considered as the date of existence of the original document.",
  "verified": true
}
```
- example-without-data.json
```json
{
  "WARNING": "Only the date of anchoring of the root block (9e138e4dd388a80ef2019f61d0aa2b1a2845ee2bd795dd5de7bc87745b040efe) by a trusted tier can be considered as the date of existence of the original document.",
  "verified": true,
  "message": "The original document is not provided, so you must now verify that its SHA-256 hash is equal to 3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8."
}
```
