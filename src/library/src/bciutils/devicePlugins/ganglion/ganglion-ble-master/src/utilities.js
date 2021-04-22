'use strict';

import gaussian from 'gaussian';
import k from './openbci_constants';
import StreamSearch from 'streamsearch';
//import { Buffer } from 'buffer/';

/** Constants for interpreting the EEG data */
// Reference voltage for ADC in ADS1299.
//   Set by its hardware.
const ADS1299_VREF = 4.5;
// Scale factor for aux data
const SCALE_FACTOR_ACCEL = 0.002 / Math.pow(2, 4);
// X, Y, Z
const ACCEL_NUMBER_AXIS = 3;
// Default ADS1299 gains array

let utilitiesModule = {

  /**
   * @typedef {Object} ProcessedBuffer
   * @property {Buffer|SafeBuffer|Buffer2} buffer The remaining buffer. Can be null.
   * @property {Array} rawDataPackets The extracted raw data packets
   */
  /**
   * @typedef {Object} Sample
   * @property {Array} accelData of floats of accel data. not always present in object.
   * @property {Number} sampleNumber The sample number
   * @property {Array} channelData The extracted channel data
   * @property {Buffer} rawDataPacket The raw data packet
   * @property {Boolean} valid If the sample is valid
   */
  /**
   * @typedef {Object} Impedance
   * @property {Number} channelNumber The channel number
   * @property {Number} impedanceValue The impedance in ohms
   */
  /**
   * @typedef {Object} RawDataToSample
   * @property {Array} rawDataPackets - An array of rawDataPackets
   * @property {Buffer} rawDataPacket - A single raw data packet
   * @property {Buffer} multiPacketBuffer - This buffer is used to build up multiple messages over ble and emit them at once
   * @property {Array} channelSettings - The channel settings array
   * @property {Number} timeOffset (optional) for non time stamp use cases i.e. 0xC0 or 0xC1 (default and raw aux)
   * @property {Array} accelArray (optional) for non time stamp use cases
   * @property {Boolean} verbose (optional) for verbose output
   * @property {Number} lastSampleNumber (optional) - The last sample number
   * @property {Boolean} scale (optional) Default `true`. A gain of 24 for Cyton will be used and 51 for ganglion by default.
   * @property {Array} decompressedSamples - An array to hold delta compression items
   * @property {Boolean} sendCounts - True if you want raw A/D counts or scaled counts in samples
   */

  /**
   * @description Used to extract samples out of a buffer of unknown length
   * @param dataBuffer {Buffer} - A buffer to parse for samples
   * @returns {ProcessedBuffer} - Object with parsed raw packets and remaining buffer. Calling function shall maintain
   *  the buffer in it's scope.
   * @author AJ Keller (@aj-ptw)
   */
  extractRawDataPackets: (dataBuffer) => {
    if (!dataBuffer) {
      return {
        'buffer': dataBuffer,
        'rawDataPackets': []
      };
    }
    let bytesToParse = dataBuffer.length;
    let rawDataPackets = [];
    // Exit if we have a buffer with less data than a packet
    if (bytesToParse < k.OBCIPacketSize) {
      return {
        'buffer': dataBuffer,
        'rawDataPackets': rawDataPackets
      };
    }

    let parsePosition = 0;
    // Begin parseing
    while (parsePosition <= bytesToParse - k.OBCIPacketSize) {
      // Is the current byte a head byte that looks like 0xA0
      if (dataBuffer[parsePosition] === k.OBCIByteStart) {
        // Now that we know the first is a head byte, let's see if the last one is a
        //  tail byte 0xCx where x is the set of numbers from 0-F (hex)
        if (isStopByte(dataBuffer[parsePosition + k.OBCIPacketSize - 1])) {
          // console.log(dataBuffer[parsePosition+1]);
          /** We just qualified a raw packet */
          // This could be a time set packet!
          // this.timeOfPacketArrival = this.time();
          // Grab the raw packet, make a copy of it.
          let rawPacket;
          rawPacket = Buffer.from(dataBuffer.slice(parsePosition, parsePosition + k.OBCIPacketSize));

          // Emit that buffer
          // this.emit('rawDataPacket', rawPacket);
          rawDataPackets.push(rawPacket);
          // Submit the packet for processing
          // this._processQualifiedPacket(rawPacket);
          // Overwrite the dataBuffer with a new buffer
          let tempBuf;
          if (parsePosition > 0) {
            tempBuf = Buffer.concat([
              Buffer.from(dataBuffer.slice(0, parsePosition)),
              Buffer.from(dataBuffer.slice(parsePosition + k.OBCIPacketSize))
            ]);
          } else {
            tempBuf = Buffer.from(dataBuffer.slice(k.OBCIPacketSize));
          }
          if (tempBuf.length === 0) {
            dataBuffer = null;
          } else {
            dataBuffer = Buffer.from(tempBuf);
          }
          // Move the parse position up one packet
          parsePosition = -1;
          bytesToParse -= k.OBCIPacketSize;
        }
      }
      parsePosition++;
    }
    return {
      'buffer': dataBuffer,
      'rawDataPackets': rawDataPackets
    };
  },
  extractRawBLEDataPackets: (dataBuffer) => {
    let rawDataPackets = [];
    if (k.isNull(dataBuffer)) return rawDataPackets;
    // Verify the packet is of length 20
    if (dataBuffer.byteLength !== k.OBCIPacketSizeBLECyton) return rawDataPackets;
    let sampleNumbers = [0, 0, 0];
    sampleNumbers[0] = dataBuffer[1];
    sampleNumbers[1] = sampleNumbers[0] + 1;
    if (sampleNumbers[1] > 255) sampleNumbers[1] -= 256;
    sampleNumbers[2] = sampleNumbers[1] + 1;
    if (sampleNumbers[2] > 255) sampleNumbers[2] -= 256;
    for (let i = 0; i < k.OBCICytonBLESamplesPerPacket; i++) {
      let rawDataPacket = utilitiesModule.samplePacketZero(sampleNumbers[i]);
      rawDataPacket[0] = k.OBCIByteStart;
      rawDataPacket[k.OBCIPacketPositionStopByte] = dataBuffer[0];
      dataBuffer.copy(rawDataPacket, k.OBCIPacketPositionChannelDataStart, k.OBCIPacketPositionChannelDataStart + (i * 6), k.OBCIPacketPositionChannelDataStart + 6 + (i * 6));
      rawDataPackets.push(rawDataPacket);
    }
    return rawDataPackets;
  },
  transformRawDataPacketToSample,
  transformRawDataPacketsToSample,
  convertGanglionArrayToBuffer,
  getRawPacketType,
  getFromTimePacketAccel,
  getFromTimePacketTime,
  getFromTimePacketRawAux,
  ganglionFillRawDataPacket,
  parsePacketStandardAccel,
  parsePacketStandardRawAux,
  parsePacketTimeSyncedAccel,
  parsePacketTimeSyncedRawAux,
  parsePacketImpedance,
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into a std OpenBCI V3 Packet
  * @param sample - A sample object
  * @returns {Buffer}
  */
  convertSampleToPacketStandard: (sample) => {
    let packetBuffer = new Buffer(k.OBCIPacketSize);
    packetBuffer.fill(0);

    // start byte
    packetBuffer[0] = k.OBCIByteStart;

    // sample number
    packetBuffer[1] = sample.sampleNumber;

    // channel data
    for (let i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
      let threeByteBuffer = floatTo3ByteBuffer(sample.channelData[i]);

      threeByteBuffer.copy(packetBuffer, 2 + (i * 3));
    }

    for (let j = 0; j < 3; j++) {
      let twoByteBuffer = floatTo2ByteBuffer(sample.auxData[j]);

      twoByteBuffer.copy(packetBuffer, (k.OBCIPacketSize - 1 - 6) + (j * 2));
    }

    // stop byte
    packetBuffer[k.OBCIPacketSize - 1] = k.OBCIByteStop;

    return packetBuffer;
  },
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into a std OpenBCI V3 Packet
  * @param sample - A sample object
  * @param rawAux {Buffer} - A 6 byte long buffer to insert into raw buffer
  * @returns {Buffer} - A 33 byte long buffer
  */
  convertSampleToPacketRawAux: (sample, rawAux) => {
    let packetBuffer = new Buffer(k.OBCIPacketSize);
    packetBuffer.fill(0);

    // start byte
    packetBuffer[0] = k.OBCIByteStart;

    // sample number
    packetBuffer[1] = sample.sampleNumber;

    // channel data
    for (let i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
      let threeByteBuffer = floatTo3ByteBuffer(sample.channelData[i]);

      threeByteBuffer.copy(packetBuffer, 2 + (i * 3));
    }

    // Write the raw aux bytes
    rawAux.copy(packetBuffer, 26);

    // stop byte
    packetBuffer[k.OBCIPacketSize - 1] = makeTailByteFromPacketType(k.OBCIStreamPacketStandardRawAux);

    return packetBuffer;
  },
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into an accel time sync set buffer
  * @param sample {Buffer} - A sample object
  * @param time {Number} - The time to inject into the sample.
  * @returns {Buffer} - A time sync accel packet
  */
  convertSampleToPacketAccelTimeSyncSet: (sample, time) => {
    let buf = convertSampleToPacketAccelTimeSynced(sample, time);
    buf[k.OBCIPacketPositionStopByte] = makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSyncSet);
    return buf;
  },
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into an accel time synced buffer
  * @param sample {Buffer} - A sample object
  * @param time {Number} - The time to inject into the sample.
  * @returns {Buffer} - A time sync accel packet
  */
  convertSampleToPacketAccelTimeSynced,
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into a raw aux time sync set packet
  * @param sample {Buffer} - A sample object
  * @param time {Number} - The time to inject into the sample.
  * @param rawAux {Buffer} - 2 byte buffer to inject into sample
  * @returns {Buffer} - A time sync raw aux packet
  */
  convertSampleToPacketRawAuxTimeSyncSet: (sample, time, rawAux) => {
    let buf = convertSampleToPacketRawAuxTimeSynced(sample, time, rawAux);
    buf[k.OBCIPacketPositionStopByte] = makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSyncSet);
    return buf;
  },
  convertSampleToPacketRawAuxTimeSynced,
  debugPrettyPrint: (sample) => {
    if (sample === null || sample === undefined) {
      console.log('== Sample is undefined ==');
    } else {
      console.log('-- Sample --');
      console.log('---- Start Byte: ' + sample.startByte);
      console.log('---- Sample Number: ' + sample.sampleNumber);
      for (let i = 0; i < 8; i++) {
        console.log('---- Channel Data ' + (i + 1) + ': ' + sample.channelData[i]);
      }
      if (sample.accelData) {
        for (let j = 0; j < 3; j++) {
          console.log('---- Accel Data ' + j + ': ' + sample.accelData[j]);
        }
      }
      if (sample.auxData) {
        console.log('---- Aux Data ' + sample.auxData);
      }
      console.log('---- Stop Byte: ' + sample.stopByte);
    }
  },
  samplePrintHeader: () => {
    return (
      'All voltages in Volts!' +
      'sampleNumber, channel1, channel2, channel3, channel4, channel5, channel6, channel7, channel8, aux1, aux2, aux3\n');
  },
  samplePrintLine: sample => {
    return new Promise((resolve, reject) => {
      if (sample === null || sample === undefined) reject(Error('undefined sample'));

      resolve(
        sample.sampleNumber + ',' +
        sample.channelData[0].toFixed(8) + ',' +
        sample.channelData[1].toFixed(8) + ',' +
        sample.channelData[2].toFixed(8) + ',' +
        sample.channelData[3].toFixed(8) + ',' +
        sample.channelData[4].toFixed(8) + ',' +
        sample.channelData[5].toFixed(8) + ',' +
        sample.channelData[6].toFixed(8) + ',' +
        sample.channelData[7].toFixed(8) + ',' +
        sample.auxData[0].toFixed(8) + ',' +
        sample.auxData[1].toFixed(8) + ',' +
        sample.auxData[2].toFixed(8) + '\n'
      );
    });
  },
  floatTo3ByteBuffer,
  floatTo2ByteBuffer,
  /**
  * @description Calculate the impedance for one channel only.
  * @param sampleObject - Standard OpenBCI sample object
  * @param channelNumber - Number, the channel you want to calculate impedance for.
  * @returns {Promise} - Fulfilled with impedance value for the specified channel.
  * @author AJ Keller
  */
  impedanceCalculationForChannel: (sampleObject, channelNumber) => {
    const sqrt2 = Math.sqrt(2);
    return new Promise((resolve, reject) => {
      if (sampleObject === undefined || sampleObject === null) reject(Error('Sample Object cannot be null or undefined'));
      if (sampleObject.channelData === undefined || sampleObject.channelData === null) reject(Error('Channel cannot be null or undefined'));
      if (channelNumber < 1 || channelNumber > k.OBCINumberOfChannelsDefault) reject(Error('Channel number invalid.'));

      let index = channelNumber - 1;

      if (sampleObject.channelData[index] < 0) {
        sampleObject.channelData[index] *= -1;
      }
      let impedance = (sqrt2 * sampleObject.channelData[index]) / k.OBCILeadOffDriveInAmps;
      // if (index === 0) console.log("Voltage: " + (sqrt2*sampleObject.channelData[index]) + " leadoff amps: " + k.OBCILeadOffDriveInAmps + " impedance: " + impedance)
      resolve(impedance);
    });
  },
  /**
  * @description Calculate the impedance for all channels.
  * @param sampleObject - Standard OpenBCI sample object
  * @returns {Promise} - Fulfilled with impedances for the sample
  * @author AJ Keller
  */
  impedanceCalculationForAllChannels: sampleObject => {
    const sqrt2 = Math.sqrt(2);
    return new Promise((resolve, reject) => {
      if (sampleObject === undefined || sampleObject === null) reject(Error('Sample Object cannot be null or undefined'));
      if (sampleObject.channelData === undefined || sampleObject.channelData === null) reject(Error('Channel cannot be null or undefined'));

      let sampleImpedances = [];
      let numChannels = sampleObject.channelData.length;
      for (let index = 0; index < numChannels; index++) {
        if (sampleObject.channelData[index] < 0) {
          sampleObject.channelData[index] *= -1;
        }
        let impedance = (sqrt2 * sampleObject.channelData[index]) / k.OBCILeadOffDriveInAmps;
        sampleImpedances.push(impedance);

      // if (index === 0) console.log("Voltage: " + (sqrt2*sampleObject.channelData[index]) + " leadoff amps: " + k.OBCILeadOffDriveInAmps + " impedance: " + impedance)
      }

      sampleObject.impedances = sampleImpedances;

      resolve(sampleObject);
    });
  },
  interpret16bitAsInt32: twoByteBuffer => {
    let prefix = 0;

    if (twoByteBuffer[0] > 127) {
      // console.log('\t\tNegative number')
      prefix = 65535; // 0xFFFF
    }

    return (prefix << 16) | (twoByteBuffer[0] << 8) | twoByteBuffer[1];
  },
  interpret24bitAsInt32: threeByteBuffer => {
    let prefix = 0;

    if (threeByteBuffer[0] > 127) {
      // console.log('\t\tNegative number')
      prefix = 255;
    }

    return (prefix << 24) | (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];
  },
  impedanceArray: numberOfChannels => {
    let impedanceArray = [];
    for (let i = 0; i < numberOfChannels; i++) {
      impedanceArray.push(newImpedanceObject(i + 1));
    }
    return impedanceArray;
  },
  impedanceObject: newImpedanceObject,
  impedanceSummarize: singleInputObject => {
    if (singleInputObject.raw > k.OBCIImpedanceThresholdBadMax) { // The case for no load (super high impedance)
      singleInputObject.text = k.OBCIImpedanceTextNone;
    } else {
      singleInputObject.text = k.getTextForRawImpedance(singleInputObject.raw); // Get textual impedance
    }
  },
  newSample,
  newSampleNoScale,
  /**
  * @description Create a configurable function to return samples for a simulator. This implements 1/f filtering injection to create more brain like data.
  * @param numberOfChannels {Number} - The number of channels in the sample... either 8 or 16
  * @param sampleRateHz {Number} - The sample rate
  * @param injectAlpha {Boolean} (optional) - True if you want to inject noise
  * @param lineNoise {String} (optional) - A string that can be either:
  *              `60Hz` - 60Hz line noise (Default) (ex. __United States__)
  *              `50Hz` - 50Hz line noise (ex. __Europe__)
  *              `none` - Do not inject line noise.
  *
  * @returns {Function}
  */
  randomSample: (numberOfChannels, sampleRateHz, injectAlpha, lineNoise) => {
    const distribution = gaussian(0, 1);
    const sineWaveFreqHz10 = 10;
    const sineWaveFreqHz50 = 50;
    const sineWaveFreqHz60 = 60;
    const uVolts = 1000000;

    let sinePhaseRad = new Array(numberOfChannels + 1); // prevent index error with '+1'
    sinePhaseRad.fill(0);

    let auxData = [0, 0, 0];
    let accelCounter = 0;
    // With 250Hz, every 10 samples, with 125Hz, every 5...
    let samplesPerAccelRate = Math.floor(sampleRateHz / 25); // best to make this an integer
    if (samplesPerAccelRate < 1) samplesPerAccelRate = 1;

    // Init arrays to hold coefficients for each channel and init to 0
    //  This gives the 1/f filter memory on each iteration
    let b0 = new Array(numberOfChannels).fill(0);
    let b1 = new Array(numberOfChannels).fill(0);
    let b2 = new Array(numberOfChannels).fill(0);

    /**
    * @description Use a 1/f filter
    * @param previousSampleNumber {Number} - The previous sample number
    */
    return previousSampleNumber => {
      let sample = newSample();
      let whiteNoise;
      for (let i = 0; i < numberOfChannels; i++) { // channels are 0 indexed
        // This produces white noise
        whiteNoise = distribution.ppf(Math.random()) * Math.sqrt(sampleRateHz / 2) / uVolts;

        switch (i) {
          case 0: // Add 10Hz signal to channel 1... brainy
          case 1:
            if (injectAlpha) {
              sinePhaseRad[i] += 2 * Math.PI * sineWaveFreqHz10 / sampleRateHz;
              if (sinePhaseRad[i] > 2 * Math.PI) {
                sinePhaseRad[i] -= 2 * Math.PI;
              }
              whiteNoise += (5 * Math.SQRT2 * Math.sin(sinePhaseRad[i])) / uVolts;
            }
            break;
          default:
            if (lineNoise === k.OBCISimulatorLineNoiseHz60) {
              // If we're in murica we want to add 60Hz line noise
              sinePhaseRad[i] += 2 * Math.PI * sineWaveFreqHz60 / sampleRateHz;
              if (sinePhaseRad[i] > 2 * Math.PI) {
                sinePhaseRad[i] -= 2 * Math.PI;
              }
              whiteNoise += (8 * Math.SQRT2 * Math.sin(sinePhaseRad[i])) / uVolts;
            } else if (lineNoise === k.OBCISimulatorLineNoiseHz50) {
              // add 50Hz line noise if we are not in america
              sinePhaseRad[i] += 2 * Math.PI * sineWaveFreqHz50 / sampleRateHz;
              if (sinePhaseRad[i] > 2 * Math.PI) {
                sinePhaseRad[i] -= 2 * Math.PI;
              }
              whiteNoise += (8 * Math.SQRT2 * Math.sin(sinePhaseRad[i])) / uVolts;
            }
        }
        /**
        * See http://www.firstpr.com.au/dsp/pink-noise/ section "Filtering white noise to make it pink"
        */
        b0[i] = 0.99765 * b0[i] + whiteNoise * 0.0990460;
        b1[i] = 0.96300 * b1[i] + whiteNoise * 0.2965164;
        b2[i] = 0.57000 * b2[i] + whiteNoise * 1.0526913;
        sample.channelData[i] = b0[i] + b1[i] + b2[i] + whiteNoise * 0.1848;
      }
      if (previousSampleNumber === 255) {
        sample.sampleNumber = 0;
      } else {
        sample.sampleNumber = previousSampleNumber + 1;
      }

      /**
      * Sample rate of accelerometer is 25Hz... when the accelCounter hits the relative sample rate of the accel
      *  we will output a new accel value. The approach will be to consider that Z should be about 1 and X and Y
      *  should be somewhere around 0.
      */
      if (accelCounter === samplesPerAccelRate) {
        // Initialize a new array
        let accelArray = [0, 0, 0];
        // Calculate X
        accelArray[0] = (Math.random() * 0.1 * (Math.random() > 0.5 ? -1 : 1));
        // Calculate Y
        accelArray[1] = (Math.random() * 0.1 * (Math.random() > 0.5 ? -1 : 1));
        // Calculate Z, this is around 1
        accelArray[2] = 1 - ((Math.random() * 0.4) * (Math.random() > 0.5 ? -1 : 1));
        // Store the newly calculated value
        sample.auxData = accelArray;
        // Reset the counter
        accelCounter = 0;
      } else {
        // Increment counter
        accelCounter++;
        // Store the default value
        sample.auxData = auxData;
      }

      return sample;
    };
  },
  scaleFactorAux: SCALE_FACTOR_ACCEL,
  /**
   * Calculate the impedance
   * @param sample {Object} - Standard sample
   * @param impedanceTest {Object} - Impedance Object from openBCIBoard.js
   * @return {null | Object} - Null if not enough samples have passed to calculate an accurate
   */
  impedanceCalculateArray: (sample, impedanceTest) => {
    impedanceTest.buffer.push(sample.channelData);
    impedanceTest.count++;

    if (impedanceTest.count >= impedanceTest.window) {
      let output = [];
      for (let i = 0; i < sample.channelData.length; i++) {
        let max = 0.0; // sumSquared
        for (let j = 0; j < impedanceTest.window; j++) {
          if (impedanceTest.buffer[i][j] > max) {
            max = impedanceTest.buffer[i][j];
          }
        }
        let min = 0.0;
        for (let j = 0; j < impedanceTest.window; j++) {
          if (impedanceTest.buffer[i][j] < min) {
            min = impedanceTest.buffer[i][j];
          }
        }
        const vP2P = max - min; // peak to peak

        output.push(vP2P / 2 / k.OBCILeadOffDriveInAmps);
      }
      impedanceTest.count = 0;
      return output;
    }
    return null;
  },
  impedanceTestObjDefault: (impedanceTestObj) => {
    let newObj = impedanceTestObj || {};
    newObj['active'] = false;
    newObj['buffer'] = [];
    newObj['count'] = 0;
    newObj['isTestingPInput'] = false;
    newObj['isTestingNInput'] = false;
    newObj['onChannel'] = 0;
    newObj['sampleNumber'] = 0;
    newObj['continuousMode'] = false;
    newObj['impedanceForChannel'] = 0;
    newObj['window'] = 40;
    return newObj;
  },
  samplePacket: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0, 0, 0, 1, 0, 2, makeTailByteFromPacketType(k.OBCIStreamPacketStandardAccel)]);
  },
  samplePacketZero: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, makeTailByteFromPacketType(k.OBCIStreamPacketStandardAccel)]);
  },
  samplePacketReal: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0x8F, 0xF2, 0x40, 0x8F, 0xDF, 0xF4, 0x90, 0x2B, 0xB6, 0x8F, 0xBF, 0xBF, 0x7F, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0x94, 0x25, 0x34, 0x20, 0xB6, 0x7D, 0, 0xE0, 0, 0xE0, 0x0F, 0x70, makeTailByteFromPacketType(k.OBCIStreamPacketStandardAccel)]);
  },
  samplePacketStandardRawAux: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0, 1, 2, 3, 4, 5, makeTailByteFromPacketType(k.OBCIStreamPacketStandardRawAux)]);
  },
  samplePacketAccelTimeSyncSet: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0, 1, 0, 0, 0, 1, makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSyncSet)]);
  },
  samplePacketAccelTimeSynced: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0, 1, 0, 0, 0, 1, makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSynced)]);
  },
  samplePacketRawAuxTimeSyncSet: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0x00, 0x01, 0, 0, 0, 1, makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSyncSet)]);
  },
  samplePacketRawAuxTimeSynced: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0x00, 0x01, 0, 0, 0, 1, makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSynced)]);
  },
  samplePacketImpedance: channelNumber => {
    return new Buffer([0xA0, channelNumber, 54, 52, 49, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, makeTailByteFromPacketType(k.OBCIStreamPacketImpedance)]);
  },
  samplePacketUserDefined: () => {
    return new Buffer([0xA0, 0x00, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, makeTailByteFromPacketType(k.OBCIStreamPacketUserDefinedType)]);
  },
  samplePacketCytonBLE: sampleNumber => {
    return new Buffer([0xC0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 10, 0, 0, 20, 0, 0, 100, 0, 0, 200]);
  },
  countADSPresent,
  doesBufferHaveEOT,
  getBiasSetFromADSRegisterQuery,
  getBooleanFromRegisterQuery,
  getChannelDataArray,
  getChannelDataArrayNoScale,
  getDataArrayAccel,
  getDataArrayAccelNoScale,
  getFirmware,
  getSRB1FromADSRegisterQuery,
  getNumFromThreeCSVADSRegisterQuery,
  isEven,
  isFailureInBuffer,
  isOdd,
  isStopByte,
  isSuccessInBuffer,
  isTimeSyncSetConfirmationInBuffer,
  makeDaisySampleObject,
  makeDaisySampleObjectWifi,
  makeTailByteFromPacketType,
  newSyncObject,
  setChSetFromADSRegisterQuery,
  stripToEOTBuffer,
  syncChannelSettingsWithRawData,
  /**
  * @description Checks to make sure the previous sample number is one less
  *  then the new sample number. Takes into account sample numbers wrapping
  *  around at 255.
  * @param `previousSampleNumber` {Number} - An integer number of the previous
  *  sample number.
  * @param `newSampleNumber` {Number} - An integer number of the new sample
  *  number.
  * @returns {Array} - Returns null if there is no dropped packets, otherwise,
  *  or on a missed packet, an array of their packet numbers is returned.
  */
  droppedPacketCheck: (previousSampleNumber, newSampleNumber) => {
    if (previousSampleNumber === k.OBCISampleNumberMax && newSampleNumber === 0) {
      return null;
    }

    if (newSampleNumber - previousSampleNumber === 1) {
      return null;
    }

    let missedPacketArray = [];

    if (previousSampleNumber > newSampleNumber) {
      let numMised = k.OBCISampleNumberMax - previousSampleNumber;
      for (let i = 0; i < numMised; i++) {
        missedPacketArray.push(previousSampleNumber + i + 1);
      }
      previousSampleNumber = -1;
    }

    for (let j = 1; j < (newSampleNumber - previousSampleNumber); j++) {
      missedPacketArray.push(previousSampleNumber + j);
    }
    return missedPacketArray;
  },
  convert18bitAsInt32,
  convert19bitAsInt32,
  decompressDeltas18Bit,
  decompressDeltas19Bit,
  sampleCompressedData: (sampleNumber) => {
    return new Buffer(
      [
        sampleNumber, // 0
        0b00000000, // 0
        0b00000000, // 1
        0b00000000, // 2
        0b00000000, // 3
        0b00001000, // 4
        0b00000000, // 5
        0b00000101, // 6
        0b00000000, // 7
        0b00000000, // 8
        0b01001000, // 9
        0b00000000, // 10
        0b00001001, // 11
        0b11110000, // 12
        0b00000001, // 13
        0b10110000, // 14
        0b00000000, // 15
        0b00110000, // 16
        0b00000000, // 17
        0b00001000  // 18
      ]);
  },
  sampleBLERaw: () => {
    return new Buffer([0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4]);
  },
  sampleImpedanceChannel1: () => {
    return new Buffer([k.OBCIGanglionByteIdImpedanceChannel1, 0, 0, 1]);
  },
  sampleImpedanceChannel2: () => {
    return new Buffer([k.OBCIGanglionByteIdImpedanceChannel2, 0, 0, 1]);
  },
  sampleImpedanceChannel3: () => {
    return new Buffer([k.OBCIGanglionByteIdImpedanceChannel3, 0, 0, 1]);
  },
  sampleImpedanceChannel4: () => {
    return new Buffer([k.OBCIGanglionByteIdImpedanceChannel4, 0, 0, 1]);
  },
  sampleImpedanceChannelReference: () => {
    return new Buffer([k.OBCIGanglionByteIdImpedanceChannelReference, 0, 0, 1]);
  },
  sampleMultiBytePacket: (data) => {
    const bufPre = new Buffer([k.OBCIGanglionByteIdMultiPacket]);
    return Buffer.concat([bufPre, data]);
  },
  sampleMultiBytePacketStop: (data) => {
    const bufPre = new Buffer([k.OBCIGanglionByteIdMultiPacketStop]);
    return Buffer.concat([bufPre, data]);
  },
  sampleOtherData: (data) => {
    const bufPre = new Buffer([255]);
    return Buffer.concat([bufPre, data]);
  },
  sampleUncompressedData: () => {
    return new Buffer(
      [
        0b00000000, // 0
        0b00000000, // 1
        0b00000000, // 2
        0b00000001, // 3
        0b00000000, // 4
        0b00000000, // 5
        0b00000010, // 6
        0b00000000, // 7
        0b00000000, // 8
        0b00000011, // 9
        0b00000000, // 10
        0b00000000, // 11
        0b00000100, // 12
        0b00000001, // 13
        0b00000010, // 14
        0b00000011, // 15
        0b00000100, // 16
        0b00000101, // 17
        0b00000110, // 18
        0b00000111  // 19
      ]);
  },
  parseGanglion,
  processMultiBytePacket,
  processMultiBytePacketStop
};

/**
 * @description Used transform raw data packets into fully qualified packets
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @return {Array} samples An array of {Sample}
 * @author AJ Keller (@aj-ptw)
 */
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

/**
 * Process an compressed packet of data.
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @private
 */
function processCompressedData (o) {
  // Save the packet counter
  o.lastSampleNumber = parseInt(o.rawDataPacket[0]);

  const samples = [];
  // Decompress the buffer into array
  if (o.lastSampleNumber <= k.OBCIGanglionByteId18Bit.max) {
    decompressSamples(o, decompressDeltas18Bit(o.rawDataPacket.slice(k.OBCIGanglionPacket18Bit.dataStart, k.OBCIGanglionPacket18Bit.dataStop)));
    samples.push(buildSample(o.lastSampleNumber * 2 - 1, o.decompressedSamples[1], o.sendCounts));
    samples.push(buildSample(o.lastSampleNumber * 2, o.decompressedSamples[2], o.sendCounts));

    switch (o.lastSampleNumber % 10) {
      case k.OBCIGanglionAccelAxisX:
        o.accelArray[0] = o.sendCounts ? o.rawDataPacket.readInt8(k.OBCIGanglionPacket18Bit.auxByte - 1) : o.rawDataPacket.readInt8(k.OBCIGanglionPacket18Bit.auxByte - 1) * k.OBCIGanglionAccelScaleFactor;
        break;
      case k.OBCIGanglionAccelAxisY:
        o.accelArray[1] = o.sendCounts ? o.rawDataPacket.readInt8(k.OBCIGanglionPacket18Bit.auxByte - 1) : o.rawDataPacket.readInt8(k.OBCIGanglionPacket18Bit.auxByte - 1) * k.OBCIGanglionAccelScaleFactor;
        break;
      case k.OBCIGanglionAccelAxisZ:
        o.accelArray[2] = o.sendCounts ? o.rawDataPacket.readInt8(k.OBCIGanglionPacket18Bit.auxByte - 1) : o.rawDataPacket.readInt8(k.OBCIGanglionPacket18Bit.auxByte - 1) * k.OBCIGanglionAccelScaleFactor;
        if (o.sendCounts) {
          samples[0].accelData = o.accelArray;
        } else {
          samples[0].accelDataCounts = o.accelArray;
        }
        break;
      default:
        break;
    }
  } else {
    decompressSamples(o, decompressDeltas19Bit(o.rawDataPacket.slice(k.OBCIGanglionPacket19Bit.dataStart, k.OBCIGanglionPacket19Bit.dataStop)));

    samples.push(buildSample((o.lastSampleNumber - 100) * 2 - 1, o.decompressedSamples[1], o.sendCounts));
    samples.push(buildSample((o.lastSampleNumber - 100) * 2, o.decompressedSamples[2], o.sendCounts));
  }

  // Rotate the 0 position for next time
  for (let i = 0; i < k.OBCINumberOfChannelsGanglion; i++) {
    o.decompressedSamples[0][i] = o.decompressedSamples[2][i];
  }

  return samples;
}

/**
 * Process and emit an impedance value
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @private
 */
function processImpedanceData (o) {
  const byteId = parseInt(o.rawDataPacket[0]);
  let channelNumber;
  switch (byteId) {
    case k.OBCIGanglionByteIdImpedanceChannel1:
      channelNumber = 1;
      break;
    case k.OBCIGanglionByteIdImpedanceChannel2:
      channelNumber = 2;
      break;
    case k.OBCIGanglionByteIdImpedanceChannel3:
      channelNumber = 3;
      break;
    case k.OBCIGanglionByteIdImpedanceChannel4:
      channelNumber = 4;
      break;
    case k.OBCIGanglionByteIdImpedanceChannelReference:
      channelNumber = 0;
      break;
  }

  let output = {
    channelNumber: channelNumber,
    impedanceValue: 0
  };

  let end = o.rawDataPacket.length;

  while (Number.isNaN(Number(o.rawDataPacket.slice(1, end))) && end !== 0) {
    end--;
  }

  if (end !== 0) {
    output.impedanceValue = Number(o.rawDataPacket.slice(1, end));
  }

  return output;
}

/**
 * Used to stack multi packet buffers into the multi packet buffer. This is finally emitted when a stop packet byte id
 *  is received.
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @private
 */
function processMultiBytePacket (o) {
  if (o.multiPacketBuffer) {
    o.multiPacketBuffer = Buffer.concat([Buffer.from(o.multiPacketBuffer), Buffer.from(o.rawDataPacket.slice(k.OBCIGanglionPacket19Bit.dataStart, k.OBCIGanglionPacket19Bit.dataStop))]);
  } else {
    o.multiPacketBuffer = o.rawDataPacket.slice(k.OBCIGanglionPacket19Bit.dataStart, k.OBCIGanglionPacket19Bit.dataStop);
  }
}

/**
 * Adds the `data` buffer to the multi packet buffer and emits the buffer as 'message'
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @private
 */
function processMultiBytePacketStop (o) {
  processMultiBytePacket(o);
  const str = o.multiPacketBuffer.toString();
  o.multiPacketBuffer = null;
  return {
    'message': str
  };
}

/**
 * Utilize `receivedDeltas` to get actual count values.
 * @param receivedDeltas {Array} - An array of deltas
 *  of shape 2x4 (2 samples per packet and 4 channels per sample.)
 * @private
 */
function decompressSamples (o, receivedDeltas) {
  // add the delta to the previous value
  for (let i = 1; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      o.decompressedSamples[i][j] = o.decompressedSamples[i - 1][j] - receivedDeltas[i - 1][j];
    }
  }
}

/**
 * Builds a sample object from an array and sample number.
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @return {Array}
 * @private
 */
function buildSample (sampleNumber, rawData, sendCounts) {
  let sample;
  if (sendCounts) {
    sample = newSampleNoScale(sampleNumber);
    sample.channelDataCounts = rawData;
  } else {
    sample = newSample(sampleNumber);
    for (let j = 0; j < k.OBCINumberOfChannelsGanglion; j++) {
      sample.channelData.push(rawData[j] * k.OBCIGanglionScaleFactorPerCountVolts);
    }
  }
  sample.timestamp = Date.now();
  return sample;
}

/**
 * Used to route samples for Ganglion
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @returns {*}
 */
function processRouteSampleData (o) {
  if (parseInt(o.rawDataPacket[0]) === k.OBCIGanglionByteIdUncompressed) {
    return processUncompressedData(o);
  } else {
    return processCompressedData(o);
  }
}

/**
 * Process an uncompressed packet of data.
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @private
 */
function processUncompressedData (o) {
  // Resets the packet counter back to zero
  o.lastSampleNumber = k.OBCIGanglionByteIdUncompressed;  // used to find dropped packets

  for (let i = 0; i < 4; i++) {
    o.decompressedSamples[0][i] = utilitiesModule.interpret24bitAsInt32(o.rawDataPacket.slice(1 + (i * 3), 1 + (i * 3) + 3));  // seed the decompressor
  }

  return [buildSample(0, o.decompressedSamples[0], o.sendCounts)];
}

/**
 * Converts a special ganglion 18 bit compressed number
 *  The compressions uses the LSB, bit 1, as the signed bit, instead of using
 *  the MSB. Therefore you must not look to the MSB for a sign extension, one
 *  must look to the LSB, and the same rules applies, if it's a 1, then it's a
 *  negative and if it's 0 then it's a positive number.
 * @param threeByteBuffer {Buffer}
 *  A 3-byte buffer with only 18 bits of actual data.
 * @return {number} A signed integer.
 */
function convert18bitAsInt32 (threeByteBuffer) {
  let prefix = 0;

  if (threeByteBuffer[2] & 0x01 > 0) {
    // console.log('\t\tNegative number')
    prefix = 0b11111111111111;
  }

  return (prefix << 18) | (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];
}

/**
 * Converts a special ganglion 19 bit compressed number
 *  The compressions uses the LSB, bit 1, as the signed bit, instead of using
 *  the MSB. Therefore you must not look to the MSB for a sign extension, one
 *  must look to the LSB, and the same rules applies, if it's a 1, then it's a
 *  negative and if it's 0 then it's a positive number.
 * @param threeByteBuffer {Buffer}
 *  A 3-byte buffer with only 19 bits of actual data.
 * @return {number} A signed integer.
 */
function convert19bitAsInt32 (threeByteBuffer) {
  let prefix = 0;

  if (threeByteBuffer[2] & 0x01 > 0) {
    // console.log('\t\tNegative number')
    prefix = 0b1111111111111;
  }

  return (prefix << 19) | (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];
}

/**
 * Called to when a compressed packet is received.
 * @param buffer {Buffer} Just the data portion of the sample. So 18 bytes.
 * @return {Array} - An array of deltas of shape 2x4 (2 samples per packet
 *  and 4 channels per sample.)
 * @private
 */
function decompressDeltas18Bit (buffer) {
  let D = new Array(k.OBCIGanglionSamplesPerPacket); // 2
  D[0] = [0, 0, 0, 0];
  D[1] = [0, 0, 0, 0];

  let receivedDeltas = [];
  for (let i = 0; i < k.OBCIGanglionSamplesPerPacket; i++) {
    receivedDeltas.push([0, 0, 0, 0]);
  }

  let miniBuf;

  // Sample 1 - Channel 1
  miniBuf = new Buffer(
    [
      (buffer[0] >> 6),
      ((buffer[0] & 0x3F) << 2) | (buffer[1] >> 6),
      ((buffer[1] & 0x3F) << 2) | (buffer[2] >> 6)
    ]
  );
  receivedDeltas[0][0] = convert18bitAsInt32(miniBuf);

  // Sample 1 - Channel 2
  miniBuf = new Buffer(
    [
      (buffer[2] & 0x3F) >> 4,
      (buffer[2] << 4) | (buffer[3] >> 4),
      (buffer[3] << 4) | (buffer[4] >> 4)
    ]);
  // miniBuf = new Buffer([(buffer[2] & 0x1F), buffer[3], buffer[4] >> 2]);
  receivedDeltas[0][1] = convert18bitAsInt32(miniBuf);

  // Sample 1 - Channel 3
  miniBuf = new Buffer(
    [
      (buffer[4] & 0x0F) >> 2,
      (buffer[4] << 6) | (buffer[5] >> 2),
      (buffer[5] << 6) | (buffer[6] >> 2)
    ]);
  receivedDeltas[0][2] = convert18bitAsInt32(miniBuf);

  // Sample 1 - Channel 4
  miniBuf = new Buffer(
    [
      (buffer[6] & 0x03),
      buffer[7],
      buffer[8]
    ]);
  receivedDeltas[0][3] = convert18bitAsInt32(miniBuf);

  // Sample 2 - Channel 1
  miniBuf = new Buffer(
    [
      (buffer[9] >> 6),
      ((buffer[9] & 0x3F) << 2) | (buffer[10] >> 6),
      ((buffer[10] & 0x3F) << 2) | (buffer[11] >> 6)
    ]);
  receivedDeltas[1][0] = convert18bitAsInt32(miniBuf);

  // Sample 2 - Channel 2
  miniBuf = new Buffer(
    [
      (buffer[11] & 0x3F) >> 4,
      (buffer[11] << 4) | (buffer[12] >> 4),
      (buffer[12] << 4) | (buffer[13] >> 4)
    ]);
  receivedDeltas[1][1] = convert18bitAsInt32(miniBuf);

  // Sample 2 - Channel 3
  miniBuf = new Buffer(
    [
      (buffer[13] & 0x0F) >> 2,
      (buffer[13] << 6) | (buffer[14] >> 2),
      (buffer[14] << 6) | (buffer[15] >> 2)
    ]);
  receivedDeltas[1][2] = convert18bitAsInt32(miniBuf);

  // Sample 2 - Channel 4
  miniBuf = new Buffer([(buffer[15] & 0x03), buffer[16], buffer[17]]);
  receivedDeltas[1][3] = convert18bitAsInt32(miniBuf);

  return receivedDeltas;
}

/**
 * Called to when a compressed packet is received.
 * @param buffer {Buffer} Just the data portion of the sample. So 19 bytes.
 * @return {Array} - An array of deltas of shape 2x4 (2 samples per packet
 *  and 4 channels per sample.)
 * @private
 */
function decompressDeltas19Bit (buffer) {
  let D = new Array(k.OBCIGanglionSamplesPerPacket); // 2
  D[0] = [0, 0, 0, 0];
  D[1] = [0, 0, 0, 0];

  let receivedDeltas = [];
  for (let i = 0; i < k.OBCIGanglionSamplesPerPacket; i++) {
    receivedDeltas.push([0, 0, 0, 0]);
  }

  let miniBuf;

  // Sample 1 - Channel 1
  miniBuf = new Buffer(
    [
      (buffer[0] >> 5),
      ((buffer[0] & 0x1F) << 3) | (buffer[1] >> 5),
      ((buffer[1] & 0x1F) << 3) | (buffer[2] >> 5)
    ]
  );
  receivedDeltas[0][0] = convert19bitAsInt32(miniBuf);

  // Sample 1 - Channel 2
  miniBuf = new Buffer(
    [
      (buffer[2] & 0x1F) >> 2,
      (buffer[2] << 6) | (buffer[3] >> 2),
      (buffer[3] << 6) | (buffer[4] >> 2)
    ]);
  // miniBuf = new Buffer([(buffer[2] & 0x1F), buffer[3], buffer[4] >> 2]);
  receivedDeltas[0][1] = convert19bitAsInt32(miniBuf);

  // Sample 1 - Channel 3
  miniBuf = new Buffer(
    [
      ((buffer[4] & 0x03) << 1) | (buffer[5] >> 7),
      ((buffer[5] & 0x7F) << 1) | (buffer[6] >> 7),
      ((buffer[6] & 0x7F) << 1) | (buffer[7] >> 7)
    ]);
  receivedDeltas[0][2] = convert19bitAsInt32(miniBuf);

  // Sample 1 - Channel 4
  miniBuf = new Buffer(
    [
      ((buffer[7] & 0x7F) >> 4),
      ((buffer[7] & 0x0F) << 4) | (buffer[8] >> 4),
      ((buffer[8] & 0x0F) << 4) | (buffer[9] >> 4)
    ]);
  receivedDeltas[0][3] = convert19bitAsInt32(miniBuf);

  // Sample 2 - Channel 1
  miniBuf = new Buffer(
    [
      ((buffer[9] & 0x0F) >> 1),
      (buffer[9] << 7) | (buffer[10] >> 1),
      (buffer[10] << 7) | (buffer[11] >> 1)
    ]);
  receivedDeltas[1][0] = convert19bitAsInt32(miniBuf);

  // Sample 2 - Channel 2
  miniBuf = new Buffer(
    [
      ((buffer[11] & 0x01) << 2) | (buffer[12] >> 6),
      (buffer[12] << 2) | (buffer[13] >> 6),
      (buffer[13] << 2) | (buffer[14] >> 6)
    ]);
  receivedDeltas[1][1] = convert19bitAsInt32(miniBuf);

  // Sample 2 - Channel 3
  miniBuf = new Buffer(
    [
      ((buffer[14] & 0x38) >> 3),
      ((buffer[14] & 0x07) << 5) | ((buffer[15] & 0xF8) >> 3),
      ((buffer[15] & 0x07) << 5) | ((buffer[16] & 0xF8) >> 3)
    ]);
  receivedDeltas[1][2] = convert19bitAsInt32(miniBuf);

  // Sample 2 - Channel 4
  miniBuf = new Buffer([(buffer[16] & 0x07), buffer[17], buffer[18]]);
  receivedDeltas[1][3] = convert19bitAsInt32(miniBuf);

  return receivedDeltas;
}

function newImpedanceObject (channelNumber) {
  return {
    channel: channelNumber,
    P: {
      raw: -1,
      text: k.OBCIImpedanceTextInit
    },
    N: {
      raw: -1,
      text: k.OBCIImpedanceTextInit
    }
  };
}

function newSyncObject () {
  return {
    boardTime: 0,
    correctedTransmissionTime: false,
    error: null,
    timeSyncSent: 0,
    timeSyncSentConfirmation: 0,
    timeSyncSetPacket: 0,
    timeRoundTrip: 0,
    timeTransmission: 0,
    timeOffset: 0,
    timeOffsetMaster: 0,
    valid: false
  };
}

/**
 * @description Used transform raw data packets into fully qualified packets
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @return {Array} samples An array of {Sample}
 * @author AJ Keller (@aj-ptw)
 */
function transformRawDataPacketsToSample (o) {
  let samples = [];
  for (let i = 0; i < o.rawDataPackets.length; i++) {
    o.rawDataPacket = o.rawDataPackets[i];
    const sample = transformRawDataPacketToSample(o);
    samples.push(sample);
    if (sample.hasOwnProperty('sampleNumber')) {
      o['lastSampleNumber'] = sample.sampleNumber;
    } else if (!sample.hasOwnProperty('impedanceValue')) {
      o['lastSampleNumber'] = o.rawDataPacket[k.OBCIPacketPositionSampleNumber];
    }
  }
  return samples;
}

/**
 * @description Used transform raw data packets into fully qualified packets
 * @param o {RawDataToSample} - Used to hold data and configuration settings
 * @return {Array} samples An array of {Sample}
 * @author AJ Keller (@aj-ptw)
 */
function transformRawDataPacketToSample (o) {
  let sample;
  try {
    const packetType = getRawPacketType(o.rawDataPacket[k.OBCIPacketPositionStopByte]);
    switch (packetType) {
      case k.OBCIStreamPacketStandardAccel:
        sample = utilitiesModule.parsePacketStandardAccel(o);
        break;
      case k.OBCIStreamPacketStandardRawAux:
        sample = utilitiesModule.parsePacketStandardRawAux(o);
        break;
      case k.OBCIStreamPacketAccelTimeSyncSet:
      case k.OBCIStreamPacketAccelTimeSynced:
        sample = utilitiesModule.parsePacketTimeSyncedAccel(o);
        break;
      case k.OBCIStreamPacketRawAuxTimeSyncSet:
      case k.OBCIStreamPacketRawAuxTimeSynced:
        sample = utilitiesModule.parsePacketTimeSyncedRawAux(o);
        break;
      case k.OBCIStreamPacketImpedance:
        sample = utilitiesModule.parsePacketImpedance(o);
        break;
      default:
        // Don't do anything if the packet is not defined
        sample = {
          error: `bad stop byte ${o.rawDataPacket.slice(32, 33).toString('hex')}`,
          valid: false,
          rawDataPacket: o.rawDataPacket
        };
        if (o.verbose) console.log(sample.error);
        break;
    }
  } catch (err) {
    sample = {
      error: err,
      valid: false,
      rawDataPacket: o.rawDataPacket
    };
    if (o.verbose) console.log(err);
  }
  return sample;
}

/**
 * Used to convert a ganglions decompressed back into a buffer
 * @param arr {Array} - An array of four numbers
 * @param data {Buffer} - A buffer to store into
 */
function convertGanglionArrayToBuffer (arr, data) {
  for (let i = 0; i < k.OBCINumberOfChannelsGanglion; i++) {
    data.writeInt16BE(arr[i] >> 8, (i * 3));
    data.writeInt8(arr[i] & 255, (i * 3) + 2);
  }
}

/**
 * @description This function takes a raw data buffer of 4 3-byte signed integers for ganglion
 * @param o {Object} - The input object
 * @param o.data {Buffer} - An allocated and filled buffer of length 12
 * @param o.rawDataPacket {Buffer} - An allocated buffer of length 33
 * @param o.sampleNumber {Number} - The sample number to load into the `rawDataPacket`
 */
function ganglionFillRawDataPacket (o) {
  // Check to make sure data is not null.
  if (k.isUndefined(o) || k.isUndefined(o.rawDataPacket) || k.isNull(o.rawDataPacket) || k.isUndefined(o.data) || k.isNull(o.data)) throw new Error(k.OBCIErrorUndefinedOrNullInput);
  // Check to make sure sampleNumber is inside object
  if (!o.hasOwnProperty('sampleNumber')) throw new Error(k.OBCIErrorUndefinedOrNullInput);
  // Check to make sure the rawDataPacket buffer is the right size.
  if (o.rawDataPacket.byteLength !== k.OBCIPacketSize) throw new Error(k.OBCIErrorInvalidByteLength);
  // Check to make sure the rawDataPacket buffer is the right size.
  if (o.data.byteLength !== k.OBCIPacketSizeBLERaw) throw new Error(k.OBCIErrorInvalidByteLength);

  o.data.copy(o.rawDataPacket, k.OBCIPacketPositionChannelDataStart);
  o.rawDataPacket[k.OBCIPacketPositionSampleNumber] = o.sampleNumber;
  o.rawDataPacket[k.OBCIPacketPositionStartByte] = k.OBCIByteStart;
  o.rawDataPacket[k.OBCIPacketPositionStopByte] = k.OBCIStreamPacketStandardRawAux;
}

/**
 * @description This method parses a 33 byte OpenBCI V3 packet and converts to a sample object
 * @param o {Object} - The input object
 * @param o.rawDataPacket {Buffer} - The 33byte raw packet
 * @param o.channelSettings {Array} - An array of channel settings that is an Array that has shape similar to the one
 *                  calling k.channelSettingsArrayInit(). The most important rule here is that it is
 *                  Array of objects that have key-value pair {gain:NUMBER}
 * @param o.scale {Boolean} - Do you want to scale the results? Default true
 * @param o.lastSampleNumber {Number} - The last sample number
 * @returns {Sample} - A sample object. NOTE: Only has accelData if this is a Z axis packet.
 */
function parsePacketStandardAccel (o) {
  // Check to make sure data is not null.
  if (k.isUndefined(o) || k.isUndefined(o.rawDataPacket) || k.isNull(o.rawDataPacket)) throw new Error(k.OBCIErrorUndefinedOrNullInput);
  // Check to make sure the buffer is the right size.
  if (o.rawDataPacket.byteLength !== k.OBCIPacketSize) throw new Error(k.OBCIErrorInvalidByteLength);
  // Verify the correct stop byte.
  if (o.rawDataPacket[0] !== k.OBCIByteStart) throw new Error(k.OBCIErrorInvalidByteStart);

  const sampleObject = {};

  if (k.isUndefined(o.scale) || k.isNull(o.scale)) o.scale = true;

  if (o.scale) sampleObject.accelData = getDataArrayAccel(o.rawDataPacket.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));
  else sampleObject.accelDataCounts = getDataArrayAccelNoScale(o.rawDataPacket.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));

  if (o.scale) sampleObject.channelData = getChannelDataArray(o);
  else sampleObject.channelDataCounts = getChannelDataArrayNoScale(o);

  sampleObject.auxData = Buffer.from(o.rawDataPacket.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));

  // Get the sample number
  sampleObject.sampleNumber = o.rawDataPacket[k.OBCIPacketPositionSampleNumber];
  // Get the start byte
  sampleObject.startByte = o.rawDataPacket[0];
  // Get the stop byte
  sampleObject.stopByte = o.rawDataPacket[k.OBCIPacketPositionStopByte];

  sampleObject.valid = true;

  sampleObject.timestamp = Date.now();
  sampleObject.boardTime = 0;

  return sampleObject;
}

/**
 * @description This method parses a 33 byte OpenBCI V3 packet and converts to a sample object
 * @param o {Object} - The input object
 * @param o.rawDataPacket {Buffer} - The 33byte raw packet
 * @param o.channelSettings {Array} - An array of channel settings that is an Array that has shape similar to the one
 *                  calling k.channelSettingsArrayInit(). The most important rule here is that it is
 *                  Array of objects that have key-value pair {gain:NUMBER}
 * @param o.scale {Boolean} - Do you want to scale the results? Default is true
 * @param o.lastSampleNumber {Number} - The last sample number
 * @returns {Sample} - A sample object. NOTE: Only has accelData if this is a Z axis packet.
 */
function parsePacketStandardRawAux (o) {
  // Check to make sure data is not null.
  if (k.isUndefined(o) || k.isUndefined(o.rawDataPacket) || k.isNull(o.rawDataPacket)) throw new Error(k.OBCIErrorUndefinedOrNullInput);
  // Check to make sure the buffer is the right size.
  if (o.rawDataPacket.byteLength !== k.OBCIPacketSize) throw new Error(k.OBCIErrorInvalidByteLength);
  // Verify the correct stop byte.
  if (o.rawDataPacket[0] !== k.OBCIByteStart) throw new Error(k.OBCIErrorInvalidByteStart);

  const sampleObject = {};

  // Store the channel data
  if (k.isUndefined(o.scale) || k.isNull(o.scale)) o.scale = true;
  if (o.scale) sampleObject.channelData = getChannelDataArray(o);
  else sampleObject.channelDataCounts = getChannelDataArrayNoScale(o);

  // Slice the buffer for the aux data
  sampleObject.auxData = Buffer.from(o.rawDataPacket.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));

  // Get the sample number
  sampleObject.sampleNumber = o.rawDataPacket[k.OBCIPacketPositionSampleNumber];
  // Get the start byte
  sampleObject.startByte = o.rawDataPacket[0];
  // Get the stop byte
  sampleObject.stopByte = o.rawDataPacket[k.OBCIPacketPositionStopByte];

  sampleObject.valid = true;

  sampleObject.timestamp = Date.now();
  sampleObject.boardTime = 0;

  return sampleObject;
}

/**
 * @description Grabs an accel value from a raw but time synced packet. Important that this utilizes the fact that:
 *      X axis data is sent with every sampleNumber % 10 === 0
 *      Y axis data is sent with every sampleNumber % 10 === 1
 *      Z axis data is sent with every sampleNumber % 10 === 2
 * @param o {Object} - The input object
 * @param o.rawDataPacket {Buffer} - The 33byte raw time synced accel packet
 * @param o.channelSettings {Array} - An array of channel settings that is an Array that has shape similar to the one
 *                  calling OpenBCIConstans.channelSettingsArrayInit(). The most important rule here is that it is
 *                  Array of objects that have key-value pair {gain:NUMBER}
 * @param o.timeOffset {Number} - The difference between board time and current time calculated with sync methods.
 * @param o.accelArray {Array} - A 3 element array that allows us to have inter packet memory of x and y axis data and emit only on the z axis packets.
 * @param o.scale {Boolean} - Do you want to scale the results? Default is true
 * @returns {Sample} - A sample object. NOTE: Only has accelData if this is a Z axis packet.
 */
function parsePacketTimeSyncedAccel (o) {
  // Ths packet has 'A0','00'....,'AA','AA','FF','FF','FF','FF','C4'
  //  where the 'AA's form an accel 16bit num and 'FF's form a 32 bit time in ms
  // The sample object we are going to build
  // Check to make sure data is not null.
  if (k.isUndefined(o) || k.isUndefined(o.rawDataPacket) || k.isNull(o.rawDataPacket)) throw new Error(k.OBCIErrorUndefinedOrNullInput);
  // Check to make sure the buffer is the right size.
  if (o.rawDataPacket.byteLength !== k.OBCIPacketSize) throw new Error(k.OBCIErrorInvalidByteLength);
  // Verify the correct stop byte.
  if (o.rawDataPacket[0] !== k.OBCIByteStart) throw new Error(k.OBCIErrorInvalidByteStart);

  let sampleObject = {};

  // Get the sample number
  sampleObject.sampleNumber = o.rawDataPacket[k.OBCIPacketPositionSampleNumber];
  // Get the start byte
  sampleObject.startByte = o.rawDataPacket[0];
  // Get the stop byte
  sampleObject.stopByte = o.rawDataPacket[k.OBCIPacketPositionStopByte];

  // Get the board time
  sampleObject.boardTime = getFromTimePacketTime(o.rawDataPacket);
  if (o.hasOwnProperty('timeOffset')) {
    sampleObject.timestamp = sampleObject.boardTime + o.timeOffset;
  } else {
    sampleObject.timestamp = Date.now();
  }

  // Extract the aux data
  sampleObject.auxData = getFromTimePacketRawAux(o.rawDataPacket);

  if (k.isUndefined(o.scale) || k.isNull(o.scale)) o.scale = true;
  if (o.scale) sampleObject.channelData = getChannelDataArray(o);
  else sampleObject.channelDataCounts = getChannelDataArrayNoScale(o);

  // Grab the accelData only if `getFromTimePacketAccel` returns true.
  if (getFromTimePacketAccel(o)) {
    if (o.scale) sampleObject.accelData = o.accelArray;
    else sampleObject.accelDataCounts = o.accelArray;
  }

  sampleObject.valid = true;

  return sampleObject;
}

/**
 * @description Raw aux
 * @param o {Object} - The input object
 * @param o.rawDataPacket {Buffer} - The 33byte raw time synced accel packet
 * @param o.channelSettings {Array} - An array of channel settings that is an Array that has shape similar to the one
 *                  calling k.channelSettingsArrayInit(). The most important rule here is that it is
 *                  Array of objects that have key-value pair {gain:NUMBER}
 * @param o.timeOffset {Number} - The difference between board time and current time calculated with sync methods.
 * @param o.scale {Boolean} - Do you want to scale the results? Default is true
 * @param o.lastSampleNumber {Number} - The last sample number
 * @returns {Sample} - A sample object. NOTE: The aux data is placed in a 2 byte buffer
 */
function parsePacketTimeSyncedRawAux (o) {
  // Ths packet has 'A0','00'....,'AA','AA','FF','FF','FF','FF','C4'
  //  where the 'AA's form an accel 16bit num and 'FF's form a 32 bit time in ms
  // Check to make sure data is not null.
  if (k.isUndefined(o) || k.isUndefined(o.rawDataPacket) || k.isNull(o.rawDataPacket)) throw new Error(k.OBCIErrorUndefinedOrNullInput);
  // Check to make sure the buffer is the right size.
  if (o.rawDataPacket.byteLength !== k.OBCIPacketSize) throw new Error(k.OBCIErrorInvalidByteLength);
  // Verify the correct stop byte.
  if (o.rawDataPacket[0] !== k.OBCIByteStart) throw new Error(k.OBCIErrorInvalidByteStart);

  // The sample object we are going to build
  let sampleObject = {};

  // Get the sample number
  sampleObject.sampleNumber = o.rawDataPacket[k.OBCIPacketPositionSampleNumber];
  // Get the start byte
  sampleObject.startByte = o.rawDataPacket[0];
  // Get the stop byte
  sampleObject.stopByte = o.rawDataPacket[k.OBCIPacketPositionStopByte];

  // Get the board time
  sampleObject.boardTime = getFromTimePacketTime(o.rawDataPacket);
  if (o.hasOwnProperty('timeOffset')) {
    sampleObject.timestamp = sampleObject.boardTime + o.timeOffset;
  } else {
    sampleObject.timestamp = Date.now();
  }

  // Extract the aux data
  sampleObject.auxData = getFromTimePacketRawAux(o.rawDataPacket);

  // Grab the channel data.
  if (k.isUndefined(o.scale) || k.isNull(o.scale)) o.scale = true;
  if (o.scale) sampleObject.channelData = getChannelDataArray(o);
  else sampleObject.channelDataCounts = getChannelDataArrayNoScale(o);

  sampleObject.valid = true;

  return sampleObject;
}

/**
 * @description Raw aux
 * @param o {Object} - The input object
 * @param o.rawDataPacket {Buffer} - The 33byte raw time synced accel packet
 * @returns {Impedance} - An impedance object.
 */
function parsePacketImpedance (o) {
  // Ths packet has 'A0','00'....,'AA','AA','FF','FF','FF','FF','C4'
  //  where the 'AA's form an accel 16bit num and 'FF's form a 32 bit time in ms
  // Check to make sure data is not null.
  if (k.isUndefined(o) || k.isUndefined(o.rawDataPacket) || k.isNull(o.rawDataPacket)) throw new Error(k.OBCIErrorUndefinedOrNullInput);
  // Check to make sure the buffer is the right size.
  if (o.rawDataPacket.byteLength !== k.OBCIPacketSize) throw new Error(k.OBCIErrorInvalidByteLength);

  let impedanceObject = {};

  impedanceObject.channelNumber = o.rawDataPacket[1];
  if (impedanceObject.channelNumber === 5) {
    impedanceObject.channelNumber = 0;
  }
  impedanceObject.impedanceValue = Number(o.rawDataPacket.toString().match(/\d+/)[0]);

  return impedanceObject;
}

/**
 * Use reg ex to parse a `str` register query for a boolean `offset` from index. Throws errors
 * @param str {String} - The string to search
 * @param regEx {RegExp} - The key to match to
 * @param offset {Number} - The number of bytes to offset from the index of the reg ex hit
 * @returns {boolean} The converted and parsed value from `str`
 */
function getBooleanFromRegisterQuery (str, regEx, offset) {
  let regExArr = str.match(regEx);
  if (regExArr) {
    const num = parseInt(str.charAt(regExArr.index + offset));
    if (!Number.isNaN(num)) {
      return Boolean(num);
    } else {
      throw new Error(k.OBCIErrorInvalidData);
    }
  } else {
    throw new Error(k.OBCIErrorMissingRegisterSetting);
  }
}

/**
 * Used to get the truth value fo srb1 within the system
 * @param str {String} - The raw query data
 * @returns {boolean}
 */
function getSRB1FromADSRegisterQuery (str) {
  return getBooleanFromRegisterQuery(str, k.OBCIRegisterQueryNameMISC1, 21);
}

/**
 * Used to get bias setting from raw query
 * @param str {String} - The raw query data
 * @param channelNumber {Number} - Zero indexed, please send `channelNumber` directly to this function.
 * @returns {boolean}
 */
function getBiasSetFromADSRegisterQuery (str, channelNumber) {
  return getBooleanFromRegisterQuery(str, k.OBCIRegisterQueryNameBIASSENSP, 20 + (channelNumber * 3));
}

/**
 * Used to get a number from the raw query data
 * @param str {String} - The raw query data
 * @param regEx {RegExp} - The regular expression to index off of
 * @param offset {Number} - The number of bytes offset from index to start
 */
function getNumFromThreeCSVADSRegisterQuery (str, regEx, offset) {
  let regExArr = str.match(regEx);
  if (regExArr) {
    const bit2 = parseInt(str.charAt(regExArr.index + offset));
    const bit1 = parseInt(str.charAt(regExArr.index + offset + 3));
    const bit0 = parseInt(str.charAt(regExArr.index + offset + 6));
    if (!Number.isNaN(bit2) && !Number.isNaN(bit1) && !Number.isNaN(bit0)) {
      return bit2 << 2 | bit1 << 1 | bit0;
    } else {
      throw new Error(k.OBCIErrorInvalidData);
    }
  } else {
    throw new Error(k.OBCIErrorMissingRegisterSetting);
  }
}

/**
 * Used to get bias setting from raw query
 * @param str {String} - The raw query data
 * @param channelSettings {ChannelSettingsObject} - Just your standard channel setting object
 * @returns {boolean}
 */
function setChSetFromADSRegisterQuery (str, channelSettings) {
  let key = k.OBCIRegisterQueryNameCHnSET[channelSettings.channelNumber];
  if (key === undefined) key = k.OBCIRegisterQueryNameCHnSET[channelSettings.channelNumber - k.OBCINumberOfChannelsCyton];
  channelSettings.powerDown = getBooleanFromRegisterQuery(str, key, 16);
  channelSettings.gain = k.gainForCommand(getNumFromThreeCSVADSRegisterQuery(str, key, 19));
  channelSettings.inputType = k.inputTypeForCommand(getNumFromThreeCSVADSRegisterQuery(str, key, 31));
  channelSettings.srb2 = getBooleanFromRegisterQuery(str, key, 28);
}

/**
 *
 * @param o {Object}
 * @param o.channelSettings {Array} - The standard channel settings object
 * @param o.data {Buffer} - The buffer of raw query data
 */
function syncChannelSettingsWithRawData (o) {
  // Check to make sure data is not null.
  if (k.isUndefined(o) || k.isUndefined(o.channelSettings) || k.isNull(o.channelSettings) || k.isUndefined(o.data) || k.isNull(o.data)) throw new Error(k.OBCIErrorUndefinedOrNullInput);
  // Check to make sure channel settings is array
  if (!Array.isArray(o.channelSettings)) throw new Error(`${k.OBCIErrorInvalidType} channelSettings`);
  // Check to make sure the rawDataPacket buffer is the right size.

  if (o.channelSettings.length === k.OBCINumberOfChannelsCyton) {
    if (o.data.toString().match(/Daisy ADS/)) throw new Error('raw data mismatch - expected only cyton register info but also found daisy');
    if (o.data.toString().match(/Board ADS/) == null) throw new Error(k.OBCIErrorInvalidData);
  } else {
    if (o.data.toString().match(/Daisy ADS/) == null) throw new Error('raw data mismatch - expected daisy register info but none found');
    if (o.data.toString().match(/Board ADS/) == null) throw new Error('no Board ADS info found');
  }

  o.channelSettings.forEach(cs => {
    if (!cs.hasOwnProperty('channelNumber') || !cs.hasOwnProperty('powerDown') || !cs.hasOwnProperty('gain') || !cs.hasOwnProperty('inputType') || !cs.hasOwnProperty('bias') || !cs.hasOwnProperty('srb2') || !cs.hasOwnProperty('srb1')) {
      throw new Error(k.OBCIErrorMissingRequiredProperty);
    }
  });

  let adsDaisy = null;
  let usingSRB1Cyton = false;
  let usingSRB1Daisy = false;
  let regExArr = o.data.toString().match(/Board ADS/);
  let adsCyton = o.data.toString().slice(regExArr.index, k.OBCIRegisterQueryCyton.length);
  if (getSRB1FromADSRegisterQuery(adsCyton)) {
    usingSRB1Cyton = true;
  }
  if (o.channelSettings.length > k.OBCINumberOfChannelsCyton) {
    let regExArrDaisy = o.data.toString().match(/Daisy ADS/);
    adsDaisy = o.data.toString().slice(regExArrDaisy.index, regExArrDaisy.index + k.OBCIRegisterQueryCytonDaisy.length);
    if (getSRB1FromADSRegisterQuery(adsCyton)) {
      usingSRB1Daisy = true;
    }
  }
  o.channelSettings.forEach(
    /**
     * Set each channel
     * @param cs {ChannelSettingsObject}
     */
    cs => {
      if (cs.channelNumber < k.OBCINumberOfChannelsCyton) {
        setChSetFromADSRegisterQuery(adsCyton, cs);
        cs.bias = getBiasSetFromADSRegisterQuery(adsCyton, cs.channelNumber);
        cs.srb1 = usingSRB1Cyton;
      } else {
        setChSetFromADSRegisterQuery(adsDaisy, cs);
        cs.bias = getBiasSetFromADSRegisterQuery(adsDaisy, cs.channelNumber - k.OBCINumberOfChannelsCyton);
        cs.srb1 = usingSRB1Daisy;
      }
    });
}

/**
* @description Extract a time from a time packet in ms.
* @param dataBuf - A raw packet with 33 bytes of data
* @returns {Number} - Board time in milli seconds
* @author AJ Keller (@aj-ptw)
*/
function getFromTimePacketTime (dataBuf) {
  // Ths packet has 'A0','00'....,'00','00','FF','FF','FF','FF','C3' where the 'FF's are times
  const lastBytePosition = k.OBCIPacketSize - 1; // This is 33, but 0 indexed would be 32 minus 1 for the stop byte and another two for the aux channel or the
  if (dataBuf.byteLength !== k.OBCIPacketSize) {
    throw new Error(k.OBCIErrorInvalidByteLength);
  } else {
    // Grab the time from the packet
    return dataBuf.readUInt32BE(lastBytePosition - k.OBCIStreamPacketTimeByteSize);
  }
}

/**
 * @description Grabs an accel value from a raw but time synced packet. Important that this utilizes the fact that:
 *      X axis data is sent with every sampleNumber % 10 === 7
 *      Y axis data is sent with every sampleNumber % 10 === 8
 *      Z axis data is sent with every sampleNumber % 10 === 9
 * @param o {Object}
 * @param o.accelArray {Array} - A 3 element array that allows us to have inter packet memory of x and y axis data and emit only on the z axis packets.
 * @param o.rawDataPacket {Buffer} - The 33byte raw time synced accel packet
 * @param o.scale {Boolean} - Do you want to scale the results? Default is true
 * @returns {boolean} - A boolean that is true only when the accel array is ready to be emitted... i.e. when this is a Z axis packet
 */
function getFromTimePacketAccel (o) {
  const accelNumBytes = 2;
  const lastBytePosition = k.OBCIPacketSize - 1 - k.OBCIStreamPacketTimeByteSize - accelNumBytes; // This is 33, but 0 indexed would be 32 minus

  if (o.rawDataPacket.byteLength !== k.OBCIPacketSize) {
    throw new Error(k.OBCIErrorInvalidByteLength);
  }

  let sampleNumber = o.rawDataPacket[k.OBCIPacketPositionSampleNumber];
  let accelCountValue = utilitiesModule.interpret16bitAsInt32(o.rawDataPacket.slice(lastBytePosition, lastBytePosition + 2));
  switch (sampleNumber % 10) { // The accelerometer is on a 25Hz sample rate, so every ten channel samples, we can get new data
    case k.OBCIAccelAxisX:
      o.accelArray[0] = o.scale ? accelCountValue * SCALE_FACTOR_ACCEL : accelCountValue; // slice is not inclusive on the right
      return false;
    case k.OBCIAccelAxisY:
      o.accelArray[1] = o.scale ? accelCountValue * SCALE_FACTOR_ACCEL : accelCountValue; // slice is not inclusive on the right
      return false;
    case k.OBCIAccelAxisZ:
      o.accelArray[2] = o.scale ? accelCountValue * SCALE_FACTOR_ACCEL : accelCountValue; // slice is not inclusive on the right
      return true;
    default:
      return false;
  }
}

/**
* @description Grabs a raw aux value from a raw but time synced packet.
* @param dataBuf {Buffer} - The 33byte raw time synced raw aux packet
* @returns {Buffer|SafeBuffer|Buffer2} - Fulfills a 2 byte buffer
*/
function getFromTimePacketRawAux (dataBuf) {
  if (dataBuf.byteLength !== k.OBCIPacketSize) {
    throw new Error(k.OBCIErrorInvalidByteLength);
  }
  return Buffer.from(dataBuf.slice(k.OBCIPacketPositionTimeSyncAuxStart, k.OBCIPacketPositionTimeSyncAuxStop));
}

/**
* @description Takes a buffer filled with 3 16 bit integers from an OpenBCI device and converts based on settings
*                  of the MPU, values are in ?
* @param dataBuf - Buffer that is 6 bytes long
* @returns {Array} - Array of floats 3 elements long
* @author AJ Keller (@aj-ptw)
*/
function getDataArrayAccel (dataBuf) {
  let accelData = [];
  for (let i = 0; i < ACCEL_NUMBER_AXIS; i++) {
    let index = i * 2;
    accelData.push(utilitiesModule.interpret16bitAsInt32(dataBuf.slice(index, index + 2)) * SCALE_FACTOR_ACCEL);
  }
  return accelData;
}

/**
 * @description Takes a buffer filled with 3 16 bit integers from an OpenBCI device and converts based on settings
 *                  to an int
 * @param dataBuf - Buffer that is 6 bytes long
 * @returns {Array} - Array of floats 3 elements long
 * @author AJ Keller (@aj-ptw)
 */
function getDataArrayAccelNoScale (dataBuf) {
  let accelData = [];
  for (let i = 0; i < ACCEL_NUMBER_AXIS; i++) {
    let index = i * 2;
    accelData.push(utilitiesModule.interpret16bitAsInt32(dataBuf.slice(index, index + 2)));
  }
  return accelData;
}

/**
 * @description Takes a buffer filled with 24 bit signed integers from an OpenBCI device with gain settings in
 *                  channelSettingsArray[index].gain and converts based on settings of ADS1299... spits out an
 *                  array of floats in VOLTS
 * @param o {Object} - The input object
 * @param o.rawDataPacket {Buffer} - The 33byte raw time synced accel packet
 * @param o.channelSettings {Array} - An array of channel settings that is an Array that has shape similar to the one
 *                  calling k.channelSettingsArrayInit(). The most important rule here is that it is
 *                  Array of objects that have key-value pair {gain:NUMBER}
 * @param o.scale {Boolean} - Do you want to scale the results? Default is true
 * @param o.lastSampleNumber {Number} - The last sample number
 * @param o.protocol {String} - Either `Serial` or `Wifi` (Default is `Wifi`)
 * @returns {Array} - Array filled with floats for each channel's voltage in VOLTS
 * @author AJ Keller (@aj-ptw)
 */
function getChannelDataArray (o) {
  if (!Array.isArray(o.channelSettings)) {
    throw new Error('Error [getChannelDataArray]: Channel Settings must be an array!');
  }
  if (!o.hasOwnProperty('protocol')) {
    o.protocol = k.OBCIProtocolSerial;
  }
  let channelData = [];
  // Grab the sample number from the buffer
  const numChannels = o.channelSettings.length;
  const sampleNumber = o.rawDataPacket[k.OBCIPacketPositionSampleNumber];
  const daisy = numChannels === k.OBCINumberOfChannelsDaisy;
  let channelsInPacket = k.OBCINumberOfChannelsCyton;
  if (!daisy) channelsInPacket = o.channelSettings.length;
  // Channel data arrays are always 8 long
  for (let i = 0; i < channelsInPacket; i++) {
    if (!o.channelSettings[i].hasOwnProperty('gain')) {
      throw new Error(`Error [getChannelDataArray]: Invalid channel settings object at index ${i}`);
    }
    if (!k.isNumber(o.channelSettings[i].gain)) {
      throw new Error('Error [getChannelDataArray]: Property gain of channelSettingsObject not or type Number');
    }

    let scaleFactor = 0;

    if (o.protocol === k.OBCIProtocolSerial) {
      if (isEven(sampleNumber) && daisy) {
        scaleFactor = ADS1299_VREF / o.channelSettings[i + k.OBCINumberOfChannelsDefault].gain / (Math.pow(2, 23) - 1);
      } else {
        scaleFactor = ADS1299_VREF / o.channelSettings[i].gain / (Math.pow(2, 23) - 1);
      }
    } else if (o.protocol === k.OBCIProtocolWifi) {
      if (daisy) {
        if (o.lastSampleNumber === sampleNumber) {
          scaleFactor = ADS1299_VREF / o.channelSettings[i + k.OBCINumberOfChannelsDefault].gain / (Math.pow(2, 23) - 1);
        } else {
          scaleFactor = ADS1299_VREF / o.channelSettings[i].gain / (Math.pow(2, 23) - 1);
        }
      } else if (o.channelSettings.length === k.OBCINumberOfChannelsCyton) {
        scaleFactor = ADS1299_VREF / o.channelSettings[i].gain / (Math.pow(2, 23) - 1);
      } else {
        scaleFactor = k.OBCIGanglionScaleFactorPerCountVolts;
      }
    } else if (o.protocol === k.OBCIProtocolBLE) { // For cyton ble not ganglion
      scaleFactor = ADS1299_VREF / o.channelSettings[i].gain / (Math.pow(2, 23) - 1);
    } else {
      throw new Error('Error [getChannelDataArray]: Invalid protocol must be wifi or serial');
    }

    // Convert the three byte signed integer and convert it
    channelData.push(scaleFactor * utilitiesModule.interpret24bitAsInt32(o.rawDataPacket.slice((i * 3) + k.OBCIPacketPositionChannelDataStart, (i * 3) + k.OBCIPacketPositionChannelDataStart + 3)));
  }
  return channelData;
}

/**
 * @description Takes a buffer filled with 24 bit signed integers from an OpenBCI device converts to array of counts
 * @param o {Object} - The input object
 * @param o.rawDataPacket {Buffer} - The 33byte raw time synced accel packet
 * @param o.channelSettings {Array} - An array of channel settings that is an Array that has shape similar to the one
 *                  calling k.channelSettingsArrayInit(). The most important rule here is that it is
 *                  Array of objects that have key-value pair {gain:NUMBER}
 * @returns {Array} - Array filled with floats for each channel's voltage in VOLTS
 * @author AJ Keller (@aj-ptw)
 */
function getChannelDataArrayNoScale (o) {
  if (!Array.isArray(o.channelSettings)) {
    throw new Error('Error [getChannelDataArrayNoScale]: Channel Settings must be an array!');
  }
  let channelData = [];
  let numChannels = o.channelSettings.length;
  if (numChannels > k.OBCINumberOfChannelsDefault) {
    numChannels = k.OBCINumberOfChannelsDefault;
  }
  // Channel data arrays cannot be more than 8
  for (let i = 0; i < numChannels; i++) {
    // Convert the three byte signed integer and convert it
    channelData.push(utilitiesModule.interpret24bitAsInt32(o.rawDataPacket.slice((i * 3) + k.OBCIPacketPositionChannelDataStart, (i * 3) + k.OBCIPacketPositionChannelDataStart + 3)));
  }
  return channelData;
}

function getRawPacketType (stopByte) {
  return stopByte & 0xF;
}

/**
* @description This method is useful for normalizing sample numbers for fake sample packets. This is intended to be
*      useful for the simulator and automated testing.
* @param sampleNumber {Number} - The sample number you want to assign to the packet
* @returns {Number} - The normalized input `sampleNumber` between 0-255
*/
function sampleNumberNormalize (sampleNumber) {
  if (sampleNumber || sampleNumber === 0) {
    if (sampleNumber > 255) {
      sampleNumber = 255;
    }
  } else {
    sampleNumber = 0x45;
  }
  return sampleNumber;
}

function newSample (sampleNumber) {
  if (sampleNumber || sampleNumber === 0) {
    if (sampleNumber > 255) {
      sampleNumber = 255;
    }
  } else {
    sampleNumber = 0;
  }
  return {
    startByte: k.OBCIByteStart,
    sampleNumber: sampleNumber,
    channelData: [],
    accelData: [],
    auxData: null,
    stopByte: k.OBCIByteStop,
    boardTime: 0,
    timestamp: 0,
    valid: true
  };
}

function newSampleNoScale (sampleNumber) {
  if (sampleNumber || sampleNumber === 0) {
    if (sampleNumber > 255) {
      sampleNumber = 255;
    }
  } else {
    sampleNumber = 0;
  }
  return {
    startByte: k.OBCIByteStart,
    sampleNumber: sampleNumber,
    channelDataCounts: [],
    accelDataCounts: [],
    auxData: null,
    stopByte: k.OBCIByteStop,
    boardTime: 0,
    timestamp: 0,
    valid: true
  };
}

/**
* @description Convert float number into three byte buffer. This is the opposite of .interpret24bitAsInt32()
* @param float - The number you want to convert
* @returns {Buffer} - 3-byte buffer containing the float
*/
function floatTo3ByteBuffer (float) {
  let intBuf = new Buffer(3); // 3 bytes for 24 bits
  intBuf.fill(0); // Fill the buffer with 0s

  let temp = float / (ADS1299_VREF / 24 / (Math.pow(2, 23) - 1)); // Convert to counts

  temp = Math.floor(temp); // Truncate counts number

  // Move into buffer
  intBuf[2] = temp & 255;
  intBuf[1] = (temp & (255 << 8)) >> 8;
  intBuf[0] = (temp & (255 << 16)) >> 16;

  return intBuf;
}

/**
* @description Convert float number into three byte buffer. This is the opposite of .interpret24bitAsInt32()
* @param float - The number you want to convert
* @returns {buffer} - 3-byte buffer containing the float
*/
function floatTo2ByteBuffer (float) {
  let intBuf = new Buffer(2); // 2 bytes for 16 bits
  intBuf.fill(0); // Fill the buffer with 0s

  let temp = float / SCALE_FACTOR_ACCEL; // Convert to counts

  temp = Math.floor(temp); // Truncate counts number

  // console.log('Num: ' + temp)

  // Move into buffer
  intBuf[1] = temp & 255;
  intBuf[0] = (temp & (255 << 8)) >> 8;

  return intBuf;
}

/**
* @description Used to make one sample object from two sample objects. The sample number of the new daisy sample will
*      be the upperSampleObject's sample number divded by 2. This allows us to preserve consecutive sample numbers that
*      flip over at 127 instead of 255 for an 8 channel. The daisySampleObject will also have one `channelData` array
*      with 16 elements inside it, with the lowerSampleObject in the lower indices and the upperSampleObject in the
*      upper set of indices. The auxData from both channels shall be captured in an object called `auxData` which
*      contains two arrays referenced by keys `lower` and `upper` for the `lowerSampleObject` and `upperSampleObject`,
*      respectively. The timestamps shall be averaged and moved into an object called `timestamp`. Further, the
*      un-averaged timestamps from the `lowerSampleObject` and `upperSampleObject` shall be placed into an object called
*      `_timestamps` which shall contain two keys `lower` and `upper` which contain the original timestamps for their
*      respective sampleObjects.
* @param lowerSampleObject {Object} - Lower 8 channels with odd sample number
* @param upperSampleObject {Object} - Upper 8 channels with even sample number
* @returns {Object} - The new merged daisy sample object
*/
function makeDaisySampleObject (lowerSampleObject, upperSampleObject) {
  let daisySampleObject = {};

  if (lowerSampleObject.hasOwnProperty('channelData')) {
    daisySampleObject.channelData = lowerSampleObject.channelData.concat(upperSampleObject.channelData);
  }

  if (lowerSampleObject.hasOwnProperty('channelDataCounts')) {
    daisySampleObject.channelDataCounts = lowerSampleObject.channelDataCounts.concat(upperSampleObject.channelDataCounts);
  }

  daisySampleObject.sampleNumber = Math.floor(upperSampleObject.sampleNumber / 2);

  daisySampleObject.auxData = {
    'lower': lowerSampleObject.auxData,
    'upper': upperSampleObject.auxData
  };

  daisySampleObject.stopByte = lowerSampleObject.stopByte;

  daisySampleObject.timestamp = (lowerSampleObject.timestamp + upperSampleObject.timestamp) / 2;

  daisySampleObject['_timestamps'] = {
    'lower': lowerSampleObject.timestamp,
    'upper': upperSampleObject.timestamp
  };

  if (lowerSampleObject.hasOwnProperty('accelData')) {
    if (lowerSampleObject.accelData[0] > 0 || lowerSampleObject.accelData[1] > 0 || lowerSampleObject.accelData[2] > 0) {
      daisySampleObject.accelData = lowerSampleObject.accelData;
    } else {
      daisySampleObject.accelData = upperSampleObject.accelData;
    }
  }

  if (lowerSampleObject.hasOwnProperty('accelDataCounts')) {
    if (lowerSampleObject.accelDataCounts[0] > 0 || lowerSampleObject.accelDataCounts[1] > 0 || lowerSampleObject.accelDataCounts[2] > 0) {
      daisySampleObject.accelDataCounts = lowerSampleObject.accelDataCounts;
    } else {
      daisySampleObject.accelDataCounts = upperSampleObject.accelDataCounts;
    }
  }

  daisySampleObject.valid = true;

  return daisySampleObject;
}

/**
 * @description Used to make one sample object from two sample objects. The sample number of the new daisy sample will
 *      be the upperSampleObject's sample number divded by 2. This allows us to preserve consecutive sample numbers that
 *      flip over at 127 instead of 255 for an 8 channel. The daisySampleObject will also have one `channelData` array
 *      with 16 elements inside it, with the lowerSampleObject in the lower indices and the upperSampleObject in the
 *      upper set of indices. The auxData from both channels shall be captured in an object called `auxData` which
 *      contains two arrays referenced by keys `lower` and `upper` for the `lowerSampleObject` and `upperSampleObject`,
 *      respectively. The timestamps shall be averaged and moved into an object called `timestamp`. Further, the
 *      un-averaged timestamps from the `lowerSampleObject` and `upperSampleObject` shall be placed into an object called
 *      `_timestamps` which shall contain two keys `lower` and `upper` which contain the original timestamps for their
 *      respective sampleObjects.
 * @param lowerSampleObject {Object} - Lower 8 channels with odd sample number
 * @param upperSampleObject {Object} - Upper 8 channels with even sample number
 * @returns {Object} - The new merged daisy sample object
 */
function makeDaisySampleObjectWifi (lowerSampleObject, upperSampleObject) {
  let daisySampleObject = {};

  if (lowerSampleObject.hasOwnProperty('channelData')) {
    daisySampleObject['channelData'] = lowerSampleObject.channelData.concat(upperSampleObject.channelData);
  }

  if (lowerSampleObject.hasOwnProperty('channelDataCounts')) {
    daisySampleObject['channelDataCounts'] = lowerSampleObject.channelDataCounts.concat(upperSampleObject.channelDataCounts);
  }

  daisySampleObject['sampleNumber'] = upperSampleObject.sampleNumber;

  daisySampleObject['auxData'] = {
    'lower': lowerSampleObject.auxData,
    'upper': upperSampleObject.auxData
  };

  if (lowerSampleObject.hasOwnProperty('timestamp')) {
    daisySampleObject['timestamp'] = lowerSampleObject.timestamp;
  }

  daisySampleObject.stopByte = lowerSampleObject.stopByte;

  daisySampleObject['_timestamps'] = {
    'lower': lowerSampleObject.timestamp,
    'upper': upperSampleObject.timestamp
  };

  if (lowerSampleObject.hasOwnProperty('accelData')) {
    if (lowerSampleObject.accelData[0] > 0 || lowerSampleObject.accelData[1] > 0 || lowerSampleObject.accelData[2] > 0) {
      daisySampleObject.accelData = lowerSampleObject.accelData;
    } else {
      daisySampleObject.accelData = upperSampleObject.accelData;
    }
  }

  if (lowerSampleObject.hasOwnProperty('accelDataCounts')) {
    if (lowerSampleObject.accelDataCounts[0] > 0 || lowerSampleObject.accelDataCounts[1] > 0 || lowerSampleObject.accelDataCounts[2] > 0) {
      daisySampleObject.accelDataCounts = lowerSampleObject.accelDataCounts;
    } else {
      daisySampleObject.accelDataCounts = upperSampleObject.accelDataCounts;
    }
  }

  daisySampleObject['valid'] = true;

  return daisySampleObject;
}

/**
* @description Used to test a number to see if it is even
* @param a {Number} - The number to test
* @returns {boolean} - True if `a` is even
*/
function isEven (a) {
  return a % 2 === 0;
}
/**
* @description Used to test a number to see if it is odd
* @param a {Number} - The number to test
* @returns {boolean} - True if `a` is odd
*/
function isOdd (a) {
  return a % 2 === 1;
}

/**
* @description Since we know exactly what this input will look like (See the hardware firmware) we can program this
*      function with prior knowledge.
* @param dataBuffer {Buffer} - The buffer you want to parse.
* @return {Number} - The number of "ADS1299" present in the `dataBuffer`
*/
function countADSPresent (dataBuffer) {
  const s = new StreamSearch(new Buffer('ADS1299'));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches;
}

/**
* @description Searchs the buffer for a "$$$" or as we call an EOT
* @param dataBuffer - The buffer of some length to parse
* @returns {boolean} - True if the `$$$` was found.
*/
// TODO: StreamSearch is optimized to search incoming chunks of data, streaming in,
//       but a new search is constructed here with every call.  This is not making use
//       of StreamSearch's optimizations; the object should be preserved between chunks,
//       and only fed the new data.  TODO: also check other uses of StreamSearch
function doesBufferHaveEOT (dataBuffer) {
  const s = new StreamSearch(new Buffer(k.OBCIParseEOT));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches >= 1;
}

/**
 * Used to extract the major version from
 * @param dataBuffer
 * @return {*}
 */
function getFirmware (dataBuffer) {
  const regexPattern = /v\d.\d*.\d*/;
  const ret = dataBuffer.toString().match(regexPattern);
  if (ret) {
    const elems = ret[0].split('.');
    return {
      major: Number(elems[0][1]),
      minor: Number(elems[1]),
      patch: Number(elems[2]),
      raw: ret[0]
    };
  } else return ret;
}

/**
* @description Used to parse a buffer for the word `Failure` that is acked back after private radio msg on failure
* @param dataBuffer {Buffer} - The buffer of some length to parse
* @returns {boolean} - True if `Failure` was found.
*/
function isFailureInBuffer (dataBuffer) {
  const s = new StreamSearch(new Buffer(k.OBCIParseFailure));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches >= 1;
}

/**
* @description Used to parse a buffer for the word `Success` that is acked back after private radio msg on success
* @param dataBuffer {Buffer} - The buffer of some length to parse
* @returns {boolean} - True if `Success` was found.
*/
function isSuccessInBuffer (dataBuffer) {
  const s = new StreamSearch(new Buffer(k.OBCIParseSuccess));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches >= 1;
}

/**
 * @description Used to slice a buffer for the EOT '$$$'.
 * @param dataBuffer {Buffer} - The buffer of some length to parse
 * @returns {Buffer} - The remaining buffer.
 */
function stripToEOTBuffer (dataBuffer) {
  let indexOfEOT = dataBuffer.indexOf(k.OBCIParseEOT);
  if (indexOfEOT >= 0) {
    indexOfEOT += k.OBCIParseEOT.length;
  } else {
    return dataBuffer;
  }

  if (indexOfEOT < dataBuffer.byteLength) {
    return Buffer.from(dataBuffer.slice(indexOfEOT));
  } else {
    return null;
  }
}

/**
* @description Used to parse a buffer for the `,` character that is acked back after a time sync request is sent
* @param dataBuffer {Buffer} - The buffer of some length to parse
* @returns {boolean} - True if the `,` was found.
*/
function isTimeSyncSetConfirmationInBuffer (dataBuffer) {
  if (dataBuffer) {
    let bufferLength = dataBuffer.length;
    switch (bufferLength) {
      case 0:
        return false;
      case 1:
        return dataBuffer[0] === k.OBCISyncTimeSent.charCodeAt(0);
      case 2:
        // HEAD Byte at End
        if (dataBuffer[1] === k.OBCIByteStart) {
          return dataBuffer[0] === k.OBCISyncTimeSent.charCodeAt(0);
          // TAIL byte in front
        } else if (isStopByte((dataBuffer[0]))) {
          return dataBuffer[1] === k.OBCISyncTimeSent.charCodeAt(0);
        } else {
          return false;
        }
      default:
        if (dataBuffer[0] === k.OBCISyncTimeSent.charCodeAt(0) && dataBuffer[1] === k.OBCIByteStart) {
          return true;
        }
        for (let i = 1; i < bufferLength; i++) {
          // The base case (last one)
          // console.log(i)
          if (i === (bufferLength - 1)) {
            if (isStopByte((dataBuffer[i - 1]))) {
              return dataBuffer[i] === k.OBCISyncTimeSent.charCodeAt(0);
            }
          } else {
            // Wedged
            if (isStopByte(dataBuffer[i - 1]) && dataBuffer[i + 1] === k.OBCIByteStart) {
              return dataBuffer[i] === k.OBCISyncTimeSent.charCodeAt(0);
            // TAIL byte in front
            }
          }
        }
        return false;
    }
  }
}

/**
* @description Mainly used by the simulator to convert a randomly generated sample into a std OpenBCI V3 Packet
* @param sample {Object} - A sample object
* @param time {Number} - The time to inject into the sample.
* @param rawAux {Buffer} - 2 byte buffer to inject into sample
* @returns {Buffer} - A time sync raw aux packet
*/
function convertSampleToPacketRawAuxTimeSynced (sample, time, rawAux) {
  let packetBuffer = new Buffer(k.OBCIPacketSize);
  packetBuffer.fill(0);

  // start byte
  packetBuffer[0] = k.OBCIByteStart;

  // sample number
  packetBuffer[1] = sample.sampleNumber;

  // channel data
  for (let i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
    let threeByteBuffer = floatTo3ByteBuffer(sample.channelData[i]);

    threeByteBuffer.copy(packetBuffer, 2 + (i * 3));
  }

  // Write the raw aux bytes
  rawAux.copy(packetBuffer, 26);

  // Write the time
  packetBuffer.writeInt32BE(time, 28);

  // stop byte
  packetBuffer[k.OBCIPacketSize - 1] = makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSynced);

  return packetBuffer;
}

/**
* @description Mainly used by the simulator to convert a randomly generated sample into a std OpenBCI V3 Packet
* @param sample {Object} - A sample object
* @param time {Number} - The time to inject into the sample.
* @returns {Buffer} - A time sync accel packet
*/
function convertSampleToPacketAccelTimeSynced (sample, time) {
  let packetBuffer = new Buffer(k.OBCIPacketSize);
  packetBuffer.fill(0);

  // start byte
  packetBuffer[0] = k.OBCIByteStart;

  // sample number
  packetBuffer[1] = sample.sampleNumber;

  // channel data
  for (let i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
    let threeByteBuffer = floatTo3ByteBuffer(sample.channelData[i]);

    threeByteBuffer.copy(packetBuffer, 2 + (i * 3));
  }

  packetBuffer.writeInt32BE(time, 28);

  // stop byte
  packetBuffer[k.OBCIPacketSize - 1] = makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSynced);

  return packetBuffer;
}

/**
* @description Converts a packet type {Number} into a OpenBCI stop byte
* @param type {Number} - The number to smash on to the stop byte. Must be 0-15,
*          out of bounds input will result in a 0
* @return {Number} - A properly formatted OpenBCI stop byte
*/
function makeTailByteFromPacketType (type) {
  if (type < 0 || type > 15) {
    type = 0;
  }
  return k.OBCIByteStop | type;
}

/**
* @description Used to check and see if a byte adheres to the stop byte structure of 0xCx where x is the set of
*      numbers from 0-F in hex of 0-15 in decimal.
* @param byte {Number} - The number to test
* @returns {boolean} - True if `byte` follows the correct form
* @author AJ Keller (@aj-ptw)
*/
function isStopByte (byte) {
  return (byte & 0xF0) === k.OBCIByteStop;
}

export default utilitiesModule;
