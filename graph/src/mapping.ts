import {BigInt, ethereum} from "@graphprotocol/graph-ts"
import {
  ProjectMahinNFT,
  Approval,
  ApprovalForAll,
  Diagnosed,
  OwnershipTransferred,
  RollComplete,
  RollInProgress,
  TokenDataStorage,
  Transfer
} from "../generated/ProjectMahinNFT/ProjectMahinNFT"
import {Diagnosis, Roll, State} from "../generated/schema";


function getState(): State {
  let entity = State.load("global");
  if (!entity) {
    entity = new State("global");
    entity.rollCount = 0;
    entity.diagnosedCount = 0;
    entity.save();
  }
  return entity;
}


// A roll is requested
export function handleRollInProgress(event: RollInProgress): void {
  const state = getState();

  const roll = new Roll('roll-' + state.rollCount.toString());
  roll.requestedAt = event.block.timestamp;
  roll.requestTxHash = event.transaction.hash.toHex();
  roll.save();

  state.rollCount += 1;
  state.currentRoll = roll.id;
  state.save();
}

// A roll is applied
export function handleRollComplete(event: RollComplete): void {
  const state = getState();

  const roll = Roll.load(state.currentRoll!)!;
  roll.appliedAt = event.block.timestamp;
  roll.applyTxHash = event.transaction.hash.toHex();
  roll.save();

  state.currentRoll = null;
  state.save();
}

export function handleDiagnosed(event: Diagnosed): void {
  const state = getState();
  state.diagnosedCount  += 1;
  state.save();

  const diagnosis = new Diagnosis(event.params.tokenId.toString());
  diagnosis.roll = state.currentRoll!;
  diagnosis.tokenId = event.params.tokenId.toI32();
}