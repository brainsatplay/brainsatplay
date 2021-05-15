""" 
This module defines :class:'Brain'
"""

import sys, signal
import numpy as np
import time
import os
import datetime
import websockets
from urllib.parse import urlparse
import json
import requests
from brainflow.board_shim import BoardShim, BrainFlowInputParams, LogLevels, BoardIds
from brainflow.data_filter import DataFilter, FilterTypes


class Brain(object):
    def __init__(self):
        """
        This is the constructor for the Brain data object
        """

        self.id = None
        self.all_channels = True
        self.channels = [-1] # Ignored if all_channels is True
        self.date = datetime.datetime.now().strftime("%d-%m-%Y_%I-%M-%S_%p")
        s = requests.Session()
        s.headers['mode'] = 'cors'
        s.headers['credentials'] = 'include'
        self.session = s
        self.reader = []
        self.data = []
        self.data_to_pass = {}

    def __repr__(self):
        return "Brain('{},'{}',{})".format(self.id, self.date)

    def __str__(self):
        return '{} _ {}'.format(self.id, self.date)


    def passData(self,name,val):
        self.data_to_pass[name] = val

    async def stream(self, url, login_data, game, access, consent, data_stream, arbitraryEventFunction=None, board=None, port=None):

        # Set default BCI message
        message = {
                    'destination': 'bci', 
                    'id': self.id            
                    }

        # Initialize stream based on data formats
        for item in data_stream:
            if item == 'brainflow':
                self.connect(board=board,port=port)
                self.board.start_stream(num_samples=450000)
                self.start_time = time.time()
                message['signal'] = None
                message['time'] = None
            else:
                self.data_to_pass[item] = None
                message[item] = None

        # Authenticate
        if url[-1] == '/':
            url = url[0:-1]
        res = self.session.post(url + '/login', login_data)
        res = json.loads(res.content)

        if res['result'] != 'OK':
            print('\n\n' + res['msg'] + '\n\n')
        else:
            cookieDict = {}
            cookieDict['connectionType'] = 'brains'
            cookieDict['channelNames'] = self.board.eeg_names
            cookieDict['access'] = access
            cookieDict['game'] = game
            self.id = res['msg']
            cookieDict['id'] = self.id

            # Convert Cookies into Proper Format
            cookies = ""        
            for cookie in cookieDict:
                if isinstance(cookieDict[cookie],list):
                    cookie_in_progress = str(cookie + '=')
                    for ind,val in enumerate(cookieDict[cookie]):
                        cookie_in_progress += str(val)
                        if (ind != len(cookieDict[cookie])-1):
                            cookie_in_progress +=  ','
                        else:
                            cookies += cookie_in_progress + '; '
                else:
                    cookies += str(cookie + '=' + cookieDict[cookie] + '; ')
                
            # Add connectionType Cookie
            o = urlparse(url)
            if (o.scheme == 'http'):
                uri = "ws://" + o.netloc
            elif (o.scheme == 'https'):
                uri = "wss://" + o.netloc
            else:
                print('not a valid url scheme')

            async with websockets.connect(uri,ping_interval=None, extra_headers=[('cookie', cookies)]) as websocket:
                
                msg = await websocket.recv()

                try: 
                    msg = json.loads(msg)
                    print('\n\n' + str(msg['msg']) + '\n\n')
                except:
                    print('\n\nError: ' + msg + '\n\n')
                    return

                # Specify stop command
                signal.signal(signal.SIGINT, self.stop)

                while True:

                    message = {
                            'destination': 'bci', 
                            'id': self.id
                    }

                    for item in data_stream:
                        if item == 'brainflow':
                            # Get Data
                            pass_data = []
                            rate = DataFilter.get_nearest_power_of_two(self.board.rate)
                            data = self.board.get_board_data()
                            t = data[self.board.time_channel]

                            if self.all_channels:
                                data = data[self.board.eeg_channels] 
                            else:
                                data = data[self.board.eeg_channels][self.channels]

                            for entry in data:
                                pass_data.append((entry).tolist())
                                
                            message['signal'] = pass_data
                            message['time'] = t.tolist()

                        else:
                            arbitraryEventFunction(self)
                            if (self.data_to_pass[item] != None):
                                message[item] = self.data_to_pass[item]
                                self.data_to_pass[item] = None

                        message['consent'] = consent


                    message = json.dumps(message, separators=(',', ':'))
                    
                    # (Re)Open Websocket Connection
                    if not websocket.open:
                        try:
                            print('Websocket is NOT connected. Reconnecting...')
                            websocket = await websockets.connect(uri,ping_interval=None, extra_headers=[('cookie', cookies)])
                        except:
                            print('Unable to reconnect, trying again.')

                    await websocket.send(message)


    def connect(self, board='SYNTHETIC_BOARD', port = None):
        
        params = BrainFlowInputParams()
        board_id = BoardIds[board].value

        if board == 'CYTON_DAISY_BOARD':
            params.serial_port = port

        # BoardShim.enable_dev_board_logger()
        self.board = BoardShim(board_id, params)
        self.board.rate = BoardShim.get_sampling_rate(board_id)
        self.board.channels = BoardShim.get_eeg_channels(board_id)
        self.board.time_channel = BoardShim.get_timestamp_channel(board_id)
        self.board.eeg_channels = BoardShim.get_eeg_channels(board_id)
        self.board.eeg_names = BoardShim.get_eeg_names(board_id)
        self.board.prepare_session()

    def stop(self, signal, frame):

        # Stop stream
        self.board.stop_stream()

        self.board.release_session()

        sys.exit('\n\nBrains-at-play data stream has been stopped.\n\n')