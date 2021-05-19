# brainsatplay.py
A Python library for interfacing with Brains@Play

* [Installation](#Installation)
* [Support](#Support)

## Installation

```bash
pip install brainsatplay
```

## Example (with Brainflow)
``` python
import brainsatplay 
import time
import math
from brainflow.board_shim import BoardShim, BrainFlowInputParams, LogLevels, BoardIds
from brainflow.data_filter import DataFilter, FilterTypes
import sys, signal

def main():

    '''
    Connect to the Brainstorm
    '''   
    # Authentication
    username = 'guest'
    password = ''

    ## Set Connection Details
    brainstorm = brainsatplay.Brainstorm('http://localhost','80') # URL, Port

    ## Connect
    res = brainstorm.connect(username,password) # All optional (defaults to guest)

    '''
    Subscribe to a Particular Game
    '''   
    # # Connection Settings
    appname = 'brainstorm'
    devices = []
    props = ['raw','times','sps','deviceType','format','eegChannelTags']
    sessionid = None
    spectating = False # Spectate to view data without sending it

    res = brainstorm.getSessions(appname)
    
    if res['msg'] != 'appNotFound':
        sessionid = res['sessions'][0]['id']
    else:
        res = brainstorm.createSession(appname, devices, props)
        sessionid = res['sessionInfo']['id']

    # Handle Data from Subscribed Games
        def newData(json):
            for user in json['userData']:
                name = user['username']
                print('Data for {}'.format(name))
    res = brainstorm.subscribeToSession(sessionid,spectating, newData)
        

    '''
    Stream your Data
    '''

    # Setup Brainflow
    params = BrainFlowInputParams()
    board_id = BoardIds['SYNTHETIC_BOARD'].value
    board = BoardShim(board_id, params)
    board.rate = BoardShim.get_sampling_rate(board_id)
    board.channels = BoardShim.get_eeg_channels(board_id)
    board.time_channel = BoardShim.get_timestamp_channel(board_id)
    board.eeg_channels = BoardShim.get_eeg_channels(board_id)
    board.eeg_names = BoardShim.get_eeg_names(board_id)
    board.prepare_session()
    board.start_stream(num_samples=450000)

    # Handle CTRL-C Exit
    def onStop():
        board.stop_stream()
        board.release_session()

    loopCount = 0

    # Start Stream Loop
    def streamLoop():
        pass_data = []
        rate = DataFilter.get_nearest_power_of_two(board.rate)
        data = board.get_board_data()
        t = data[board.time_channel]

        data = data[board.eeg_channels] 

        for entry in data:
            pass_data.append((entry).tolist())
            
        data = {}
        data['raw'] = pass_data
        data['times'] = t.tolist()

        # Send Metadata on First Loop
        if loopCount == 0:
            data['sps'] = board.rate
            data['deviceType'] = 'eeg'
            data['format'] = 'brainflow'
            tags = []
            for i, channel in enumerate(board.eeg_channels):
                tags.append({'ch': channel-1, 'tag': board.eeg_names[i], 'analyze':True})

            data['eegChannelTags'] = tags
        
        return data

    res = brainstorm.startStream(streamLoop, onStop)

if __name__ == "__main__":
    main()
```

## Support

If you are having issues, please email Garrett Flynn at gflynn@usc.edu
