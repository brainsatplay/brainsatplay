import brainsatplay 
import time
import math
from brainflow.board_shim import BoardShim, BrainFlowInputParams, LogLevels, BoardIds
from brainflow.data_filter import DataFilter, FilterTypes
import sys, signal

def main():

    # Subscription Details
    appname = 'brainflow'
    devices = []
    props = ['raw','times']
    sessionid = None

    # Initiailize Connection to the Brainstorm
    brainstorm = brainsatplay.Brainstorm('http://localhost','8000')
    res = brainstorm.connect()

    # Handle Data from Subscribed Games
    def newData(json):
        for user in json['userData']:
            name = user['username']
            print('Data for {}'.format(name))
            remove = ['username']
            mute = ['raw','times']
            for prop in user:
                if prop not in remove:
                    print(prop)
                    if prop not in mute:
                        print(prop)
                        print(user[prop])

    res = brainstorm.getSessions(appname)
    
    if res['msg'] != 'appNotFound':
        sessionid = res['sessions'][0]['id']
    else:
        res = brainstorm.createSession(appname, devices, props)
        sessionid = res['sessionInfo']['id']

    res = brainstorm.subscribeToSession(sessionid,newData)
        
    starttime = time.time()

    # Stream Your Own Data
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

    def stop(self, signal):
        board.stop_stream()
        board.release_session()
        brainstorm.leaveSession(sessionid)
        sys.exit('\n\nYour data stream to the Brainstorm has been stopped.\n\n')
        
    signal.signal(signal.SIGINT, stop)

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

        res = brainstorm.streamData(message)
        time.sleep(0.1 - ((time.time() - starttime) % 0.1))

if __name__ == "__main__":
    main()