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
    brainstorm = brainsatplay.Brainstorm('http://localhost','8000') # URL, Port

    ## Connect
    res = brainstorm.connect(username,password) # All optional (defaults to guest)

    '''
    Subscribe to a Particular Game
    '''   
    # # Connection Settings
    # appname = 'brainstorm'
    # devices = []
    # props = ['raw','times','sps','deviceType','format','eegChannelTags']
    # sessionid = None
    # spectating = False # Spectate to view data without sending it

    # res = brainstorm.getSessions(appname)
    
    # if res['msg'] != 'appNotFound':
    #     sessionid = res['sessions'][0]['id']
    # else:
    #     res = brainstorm.createSession(appname, devices, props)
    #     sessionid = res['sessionInfo']['id']

    # # Handle Data from Subscribed Games
    #     def newData(json):
    #         for user in json['userData']:
    #             name = user['username']
    #             print('Data for {}'.format(name))
    # res = brainstorm.subscribeToSession(sessionid,spectating, newData)
        

    '''
    Stream your Data
    '''

    starttime = time.time()

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
    def stop(self, signal):
        board.stop_stream()
        board.release_session()
        brainstorm.leaveSession(sessionid)
        sys.exit('\n\nYour data stream to the Brainstorm has been stopped.\n\n')
    signal.signal(signal.SIGINT, stop)

    loopCount = 0

    # Start Stream Loop
    while True:
        pass_data = []
        rate = DataFilter.get_nearest_power_of_two(board.rate)
        data = board.get_board_data()
        t = data[board.time_channel]

        data = data[board.eeg_channels] 

        for entry in data:
            pass_data.append((entry).tolist())
            
        message = {}
        message['raw'] = pass_data
        message['times'] = t.tolist()

        # Send Metadata on First Loop
        if loopCount == 0:
            message['sps'] = board.rate
            message['deviceType'] = 'eeg'
            message['format'] = 'brainflow'
            tags = []
            for i, channel in enumerate(board.eeg_channels):
                tags.append({'ch': channel-1, 'tag': board.eeg_names[i], 'analyze':True})

            message['eegChannelTags'] = tags

        res = brainstorm.streamData(message)
        time.sleep(0.1 - ((time.time() - starttime) % 0.1))

if __name__ == "__main__":
    main()