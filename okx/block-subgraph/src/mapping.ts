import { ethereum } from "@graphprotocol/graph-ts";
import { Block } from "../generated/schema";

export function handleBlock(block: ethereum.Block): void {
  let blockEntity = new Block(block.hash.toHex()); // Create a new Block entity with the block hash as the ID
  blockEntity.number = block.number; // Store the block number
  blockEntity.timestamp = block.timestamp; // Store the block timestamp
  blockEntity.hash = block.hash; // Store the block hash
  blockEntity.save(); // Save the block entity to the database
}
