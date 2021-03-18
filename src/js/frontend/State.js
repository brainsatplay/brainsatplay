import {StateManager} from './utils/StateManager'

//Initial state values, some of these will be updated from last saved settings
//Set General UI settings here
export const State = new StateManager({

});

// Adds a subscribable reference in the state manager to the tagged EEG coordinate
export const addEEGCoordToState = (bcisession, deviceIdx=0, tag='FP1') => {
    State.addToState(tag,bcisession.devices[deviceIdx].atlas.getEEGDataByTag(tag));
}
