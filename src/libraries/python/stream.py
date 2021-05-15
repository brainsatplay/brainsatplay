import sys
import os
from brainsatplay import Brainstorm 
import numpy as np
import asyncio
import time
import math

# async def beginStream(BOARD, PORT, URL, LOGIN_DATA, GAME, ACCESS, CONSENT, DATA_STREAM, ARBITRARY_EVENT_FUNCTION):

#     # Initialize the Trace
#     brain = Brain()

#     # Connect Websocket and (if applicable) start streaming a Brainflow-compatible EEG device
#     await brain.stream(url=URL,login_data=LOGIN_DATA,game=GAME,access=ACCESS, consent=CONSENT, data_stream=DATA_STREAM, arbitraryEventFunction=ARBITRARY_EVENT_FUNCTION, board=BOARD, port=PORT)

async def main():

    brainstorm = Brainstorm('http://localhost','8000')
    res = await brainstorm.connect('test')
    print(res)

    res = await brainstorm.sendCommand('ping')
    print(res)

    res = await brainstorm.subscribeToSession('My First Brainstorm_556284')
    print(res)

    # brain = asyncio.create_task(beginStream(BOARD, PORT, URL, LOGIN_DATA, GAME, ACCESS, CONSENT, DATA_STREAM,arbitraryEventFunction))
    # await brain

if __name__ == "__main__":
    asyncio.run(main())