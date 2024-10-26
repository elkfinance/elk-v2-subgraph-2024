import { newMockEvent } from "matchstick-as"
import { ethereum } from "@graphprotocol/graph-ts"
import { Block } from "../generated/Contract/Contract"

export function createBlockEvent(): Block {
  let blockEvent = changetype<Block>(newMockEvent())

  blockEvent.parameters = new Array()

  return blockEvent
}
