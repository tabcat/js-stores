/* eslint-disable no-console */
// import { IDBBlockstore as Blockstore } from 'blockstore-idb'
import { LevelBlockstore as Blockstore } from 'blockstore-level'
// import { OpfsBlockstore as Blockstore } from 'blockstore-opfs'
import { CID } from 'multiformats'
import { code } from 'multiformats/codecs/raw'
import { sha256 } from 'multiformats/hashes/sha2'
import { Bench } from 'tinybench'

let cid: CID
let bytes: Uint8Array

async function setup (): Promise<void> {
  bytes = new Uint8Array(32000).map(() => Math.floor(Math.random() * 256)) // random 256kb chunks
  cid = CID.create(1, code, await sha256.digest(bytes))
}
const bench = new Bench({ time: 1000, setup })

const blockstore = new Blockstore('asdf')

void bench
  .add('put', async () => {
    await blockstore.put(cid, bytes)
  })
  .add('has', async () => {
    await blockstore.has(cid)
  })
  .add('get', async () => {
    await blockstore.get(cid).catch(e => e.name === 'NotFoundError')
  })
  .add('delete', async () => {
    await blockstore.delete(cid)
  })

async function main (): Promise<void> {
  try {
    await blockstore.open()
    await bench.warmup() // make results more reliable, ref: https://github.com/tinylibs/tinybench/pull/50
    await bench.run()
    console.info(JSON.stringify(bench.table()))
  } catch (e) {
    console.error(String(e))
  }
}
void main()
