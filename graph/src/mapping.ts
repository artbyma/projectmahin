import {
  Diagnosed,
  RollComplete,
  RollInProgress,
} from "../generated/ProjectMahinNFT/ProjectMahinNFT"
import {Diagnosis, Roll, State} from "../generated/schema";
import {RequestRollCall} from "../generated/DoctorV2/DoctorV2";


function getState(): State {
  let entity = State.load("global");
  if (!entity) {
    entity = new State("global");
    entity.rollCount = 0;
    entity.diagnosedCount = 0;
    entity.diagnosedTokenIds = [];
    entity.save();
  }
  return entity;
}


// call handler - runs after the event handlers in the same tx
export function handleRequestRoll(call: RequestRollCall): void {
  const state = getState();

  const roll = Roll.load(state.currentRoll!)!;
  roll.useFallback = call.inputs.useFallback
  roll.save();
}


// A roll is requested
export function handleRollInProgress(event: RollInProgress): void {
  const state = getState();

  const roll = new Roll('roll-' + state.rollCount.toString());
  roll.requestedAt = event.block.timestamp;
  roll.requestTxHash = event.transaction.hash.toHex();
  roll.probability = event.params.probability;
  roll.diagnoses = [];
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
  const tids = state.diagnosedTokenIds;
  tids.push(event.params.tokenId.toI32());
  state.diagnosedTokenIds = tids;
  state.save();

  const diagnosis = new Diagnosis(event.params.tokenId.toString());
  diagnosis.roll = state.currentRoll!;
  diagnosis.tokenId = event.params.tokenId.toI32();
  diagnosis.save();

  const roll = Roll.load(state.currentRoll!)!;
  const diagnoses = roll.diagnoses;
  diagnoses.push(diagnosis.id);
  roll.diagnoses = diagnoses;
  roll.save();
}