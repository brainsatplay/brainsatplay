import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { tap } from 'rxjs/operators/tap';
import { map } from 'rxjs/operators/map';
import { first } from 'rxjs/operators/first';
import { filter } from 'rxjs/operators/filter';
import { takeUntil } from 'rxjs/operators/takeUntil';
import { mergeMap } from 'rxjs/operators/mergeMap';
import { fromEvent } from 'rxjs/observable/fromEvent';
import { k } from './openbci_constants'
import { renameDataProp } from './utils';

import {
    DEVICE_OPTIONS as deviceOptions,
    GANGLION_SERVICE_ID as serviceId,
    CHARACTERISTICS as characteristicsByType,
    CHARACTERISTIC_EVENT as onCharacteristic,
    DISCONNECTED_EVENT as onDisconnected,
    COMMAND_STRINGS as commandStrings,
    BOARD_NAME as boardName
} from './constants/index.js';

function parseGanglion (o) {
    const byteId = parseInt(o.rawDataPacket[0]);
    if (byteId <= k.OBCIGanglionByteId19Bit.max) {
      return processRouteSampleData(o);
    } else {
      switch (byteId) {
        case k.OBCIGanglionByteIdMultiPacket:
          return processMultiBytePacket(o);
        case k.OBCIGanglionByteIdMultiPacketStop:
          return processMultiBytePacketStop(o);
        case k.OBCIGanglionByteIdImpedanceChannel1:
        case k.OBCIGanglionByteIdImpedanceChannel2:
        case k.OBCIGanglionByteIdImpedanceChannel3:
        case k.OBCIGanglionByteIdImpedanceChannel4:
        case k.OBCIGanglionByteIdImpedanceChannelReference:
          return processImpedanceData(o);
        default:
          return null;
      }
    }
  }
  

export class Ganglion {

    constructor (options = {}) {
        this.options = options;
        this.gatt = null;
        this.device = null;
        this.deviceName = null;
        this.service = null;
        this.characteristics = null;
        this.onDisconnect$ = new Subject();
        this.boardName = boardName;
        this.channelSize = 4;

        function channelSettingsObjectDefault (channelNumber) {
            return {
              channelNumber: channelNumber,
              powerDown: false,
              gain: 24,
              inputType: 'normal',
              bias: true,
              srb2: true,
              srb1: false
            };
          }

        const channelSettingsArrayInit = (numberOfChannels) => {
            var newChannelSettingsArray = [];
            for (var i = 0; i < numberOfChannels; i++) {
              newChannelSettingsArray.push(channelSettingsObjectDefault(i));
            }
            return newChannelSettingsArray;
        }

        function decompressedSamplesInit (numChannels) {
            let output = [];
            for (let i = 0; i < 3; i++) {
              output.push(new Array(numChannels));
            }
            return output;
          }

        this.rawDataPacketToSample = {
            accelArray: [0, 0, 0],
            channelSettings: channelSettingsArrayInit(4),
            decompressedSamples: decompressedSamplesInit(4),
            lastSampleNumber: 0,
            rawDataPacket: new Uint8Array(33).buffer,
            rawDataPackets: [],
            scale: true,
            sendCounts: false,
            timeOffset: 0,
            verbose: false
          };
        this.connectionStatus = new BehaviorSubject(false);
        this.stream = new Subject().pipe(
            map(event => this.eventToBufferMapper(event)),
            tap(buffer => this.setRawDataPacket(buffer)),
            map(() => parseGanglion(this.rawDataPacketToSample)),
            mergeMap(x => x),
            map(renameDataProp),
            takeUntil(this.onDisconnect$)
        );
        this.accelData = this.stream.pipe(
            filter(sample => sample.accelData.length)
        );
    }

    eventToBufferMapper (event) {
        return new Uint8Array(event.target.value.buffer);
    }

    setRawDataPacket (buffer) {
        this.rawDataPacketToSample.rawDataPacket = buffer;
    }
    
    async connect () {
        this.device = await navigator.bluetooth.requestDevice(deviceOptions);
        this.addDisconnectedEvent();
        this.gatt = await this.device.gatt.connect();
        this.deviceName = this.gatt.device.name;
        this.service = await this.gatt.getPrimaryService(serviceId);
        this.setCharacteristics(await this.service.getCharacteristics());
        this.connectionStatus.next(true);
    }

    setCharacteristics (characteristics) {
        this.characteristics = Object
            .entries(characteristicsByType)
            .reduce((map, [ name, uuid ]) => ({
                ...map,
                [name]: characteristics.find(c => c.uuid === uuid)
            }), {});
    }

    async start () {
        const { reader, writer } = this.characteristics;
        const commands = Object.entries(commandStrings)
            .reduce((acc, [ key, command ]) => ({
                ...acc,
                [key]: new TextEncoder().encode(command)
            }), {});

        reader.startNotifications();
        reader.addEventListener(onCharacteristic, event => {
            this.stream.next(event);
        });

        if (this.options.accelData) {
            await writer.writeValue(commands.accelData);
            reader.readValue();
        }
        await writer.writeValue(commands.start);
        reader.readValue();
    }

    addDisconnectedEvent () {
        fromEvent(this.device, onDisconnected)
            .pipe(first())
            .subscribe(() => {
                this.gatt = null;
                this.device = null;
                this.deviceName = null;
                this.service = null;
                this.characteristics = null;
                this.connectionStatus.next(false);
            });
    }

    disconnect () {
        if (!this.gatt) { return };
        this.onDisconnect$.next();
        this.gatt.disconnect();
    }
}

export default Ganglion;
