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
    "seed": "08c380616cdbe84d56285d2a8783ccf519a0ae997489e6e37d914ef0922fbd74",
    "hash": "dbfe294e9f655e21f7205696eb8b944f92dea3202eb2c98f46dcb3cc77281c97",
    "address": "48c60c9225d911fd18dcc988b05aae7b25f5d37ce236564798ec1e625a829c2d",
    "signature": "6fd0fb182480081a82e001a9c79e87e04ddd06a8516f58a01f2914194ee3dbde",
    "chains": {},
    "previous": []
  },
  "timestamp": 1577720391853,
  "seed": "8ba9716fb0205c621b14960c1a2e51110b294c357216402f313caf7c52c19c51",
  "hash": "3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8",
  "address": "0x4592350babefcc849943db091b6c49f8b86f8aaa",
  "signature": "0x7c6d80cf86f8c5b096d1761eaedb9835896c0ccd839722d4197b268ba8e7c568154bf8bf701ba689dd68e5d8f3f7528d721c35ca87e79021a447587f2966d0c61b",
  "chains": {},
  "data": "dmFsdWUgNQ==",
  "block": {
    "root": "67dd95107b4e561e764deb01ae297ed67e447065f0ec7560dbdeab555d83dc99",
    "proof": [
      "f8918080a0855a3f11b2dc89e3f59ec34108b1e7cd53410d2b57a0842ed0c00bf425928135a0bbc1a92a348ca32ffc159830c67179cd9efd99287231ceb948496c3e88cf1fa9808080a0278dea63527c2b7d1c49f4f6e6758384c5c4d12f5385f051c29a72cc198172a880808080a09b345d14fe65a3b8e5951e167891fa1bebb075c5845f74338a284b4e59a0267680808080",
      "f851808080a01adacbf2fe70dbd1ed13fc56eec04304caeb542c3a0769d493b904dfd155b9cf808080808080a08909229ff08c6d78c6578d558126c77b3d9190d6b324a7411edd45adb3b8199b808080808080",
      "f842a02031d56747785fafe73bc6745a1d21c6b8c38d14b7573fa3fe30745aded1e2c4a04e35dc0823e18afeb44538400ea6e62beada0e335e6408094148e38ca99a4035"
    ]
  }
}
```

Verification steps:
- if the original data is provided (`dmFsdWUgNQ==`), we verify that its SHA-256 hash is equal to the `hash` value (`3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8`)
- we verify the signature ([https://etherscan.io/verifySig](https://etherscan.io/verifySig)):
  - address: `0x4592350babefcc849943db091b6c49f8b86f8aaa`
  - signature: `0x7c6d80cf86f8c5b096d1761eaedb9835896c0ccd839722d4197b268ba8e7c568154bf8bf701ba689dd68e5d8f3f7528d721c35ca87e79021a447587f2966d0c61b`
  - original message: the `hash` value (`3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8`)
- we verify that the obfuscated fingerprint of the `hash` value is included in the provable document: SHA-256 hash of `<seed> <hash>` (`8ba9716fb0205c621b14960c1a2e51110b294c357216402f313caf7c52c19c51 3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8`) is equal to the `provable.hash` value (`dbfe294e9f655e21f7205696eb8b944f92dea3202eb2c98f46dcb3cc77281c97`)
- we verify and extract the value from the [Merkle Patricia Trie](https://github.com/ethereumjs/merkle-patricia-tree) inputs:
  - root: `block.root` (`67dd95107b4e561e764deb01ae297ed67e447065f0ec7560dbdeab555d83dc99`)
  - prove: `block.proof`
  - key: `provable.id` (`3a31d56747785fafe73bc6745a1d21c6b8c38d14b7573fa3fe30745aded1e2c4`)
- we verify that the extracted value is equal to the SHA-256 hash of `JSON.stringify(provable)` (`4e35dc0823e18afeb44538400ea6e62beada0e335e6408094148e38ca99a4035`)

Output:
- example.json
```json
{
  "WARNING": "Only the date of anchoring of the root block (67dd95107b4e561e764deb01ae297ed67e447065f0ec7560dbdeab555d83dc99) by a trusted tier can be considered as the date of existence of the original document.",
  "verified": true
}
```
- example-without-data.json
```json
{
  "WARNING": "Only the date of anchoring of the root block (67dd95107b4e561e764deb01ae297ed67e447065f0ec7560dbdeab555d83dc99) by a trusted tier can be considered as the date of existence of the original document.",
  "verified": true,
  "message": "The original document is not provided, so you must now verify that its SHA-256 hash is equal to 3db104a9dc47163e43226d0b25c4cabf082d1813a80d4d217b75a9c2b1e49ae8."
}
```
