// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
} from "@graphprotocol/graph-ts";

export class Block extends ethereum.Event {
  get params(): Block__Params {
    return new Block__Params(this);
  }
}

export class Block__Params {
  _event: Block;

  constructor(event: Block) {
    this._event = event;
  }
}

export class Block extends ethereum.SmartContract {
  static bind(address: Address): Block {
    return new Block("Block", address);
  }
}
