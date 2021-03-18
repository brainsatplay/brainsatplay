import {StateManager} from './utils/StateManager'

//Initial state values
export const State = new StateManager({

});

export const addEEGCoordToState = (bcisession, deviceIdx=0, tag='FP1') => { // Adds a subscribable reference in the state manager to the tagged EEG coordinate
    State.addToState(tag,bcisession.devices[deviceIdx].atlas.getEEGDataByTag(tag));
}
