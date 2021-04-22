/**
* Created by ajk on 12/16/15.
* Purpose: This file folds all the constants for the
*     OpenBCI Board
*/
'use strict';
//import { Buffer } from 'buffer/';

/** Turning channels off */
const obciChannelOff1 = '1';
const obciChannelOff2 = '2';
const obciChannelOff3 = '3';
const obciChannelOff4 = '4';
const obciChannelOff5 = '5';
const obciChannelOff6 = '6';
const obciChannelOff7 = '7';
const obciChannelOff8 = '8';
const obciChannelOff9 = 'q';
const obciChannelOff10 = 'w';
const obciChannelOff11 = 'e';
const obciChannelOff12 = 'r';
const obciChannelOff13 = 't';
const obciChannelOff14 = 'y';
const obciChannelOff15 = 'u';
const obciChannelOff16 = 'i';

/** Turn channels on */
const obciChannelOn1 = '!';
const obciChannelOn2 = '@';
const obciChannelOn3 = '#';
const obciChannelOn4 = '$';
const obciChannelOn5 = '%';
const obciChannelOn6 = '^';
const obciChannelOn7 = '&';
const obciChannelOn8 = '*';
const obciChannelOn9 = 'Q';
const obciChannelOn10 = 'W';
const obciChannelOn11 = 'E';
const obciChannelOn12 = 'R';
const obciChannelOn13 = 'T';
const obciChannelOn14 = 'Y';
const obciChannelOn15 = 'U';
const obciChannelOn16 = 'I';

/** Test Signal Control Commands
* 1x - Voltage will be 1 * (VREFP - VREFN) / 2.4 mV
* 2x - Voltage will be 2 * (VREFP - VREFN) / 2.4 mV
*/
const obciTestSignalConnectToDC = 'p';
const obciTestSignalConnectToGround = '0';
const obciTestSignalConnectToPulse1xFast = '=';
const obciTestSignalConnectToPulse1xSlow = '-';
const obciTestSignalConnectToPulse2xFast = ']';
const obciTestSignalConnectToPulse2xSlow = '[';

/** Channel Setting Commands */
const obciChannelCmdADCNormal = '0';
const obciChannelCmdADCShorted = '1';
const obciChannelCmdADCBiasDRP = '6';
const obciChannelCmdADCBiasDRN = '7';
const obciChannelCmdADCBiasMethod = '2';
const obciChannelCmdADCMVDD = '3';
const obciChannelCmdADCTemp = '4';
const obciChannelCmdADCTestSig = '5';
const obciChannelCmdBiasInclude = '1';
const obciChannelCmdBiasRemove = '0';
const obciChannelCmdChannel1 = '1';
const obciChannelCmdChannel2 = '2';
const obciChannelCmdChannel3 = '3';
const obciChannelCmdChannel4 = '4';
const obciChannelCmdChannel5 = '5';
const obciChannelCmdChannel6 = '6';
const obciChannelCmdChannel7 = '7';
const obciChannelCmdChannel8 = '8';
const obciChannelCmdChannel9 = 'Q';
const obciChannelCmdChannel10 = 'W';
const obciChannelCmdChannel11 = 'E';
const obciChannelCmdChannel12 = 'R';
const obciChannelCmdChannel13 = 'T';
const obciChannelCmdChannel14 = 'Y';
const obciChannelCmdChannel15 = 'U';
const obciChannelCmdChannel16 = 'I';
const obciChannelCmdGain1 = '0';
const obciChannelCmdGain2 = '1';
const obciChannelCmdGain4 = '2';
const obciChannelCmdGain6 = '3';
const obciChannelCmdGain8 = '4';
const obciChannelCmdGain12 = '5';
const obciChannelCmdGain24 = '6';
const obciChannelCmdLatch = 'X';
const obciChannelCmdPowerOff = '1';
const obciChannelCmdPowerOn = '0';
const obciChannelCmdSet = 'x';
const obciChannelCmdSRB1Connect = '1';
const obciChannelCmdSRB1Diconnect = '0';
const obciChannelCmdSRB2Connect = '1';
const obciChannelCmdSRB2Diconnect = '0';

/** Channel Setting Helper Strings */
const obciStringADCNormal = 'normal';
const obciStringADCShorted = 'shorted';
const obciStringADCBiasMethod = 'biasMethod';
const obciStringADCMvdd = 'mvdd';
const obciStringADCTemp = 'temp';
const obciStringADCTestSig = 'testSig';
const obciStringADCBiasDrp = 'biasDrp';
const obciStringADCBiasDrn = 'biasDrn';

/** Default Channel Settings */
const obciChannelDefaultAllSet = 'd';
const obciChannelDefaultAllGet = 'D';

/** LeadOff Impedance Commands */
const obciChannelImpedanceLatch = 'Z';
const obciChannelImpedanceSet = 'z';
const obciChannelImpedanceTestSignalApplied = '1';
const obciChannelImpedanceTestSignalAppliedNot = '0';

/** SD card Commands */
const obciSDLogForHour1 = 'G';
const obciSDLogForHour2 = 'H';
const obciSDLogForHour4 = 'J';
const obciSDLogForHour12 = 'K';
const obciSDLogForHour24 = 'L';
const obciSDLogForMin5 = 'A';
const obciSDLogForMin15 = 'S';
const obciSDLogForMin30 = 'F';
const obciSDLogForSec14 = 'a';
const obciSDLogStop = 'j';

/** SD Card String Commands */
const obciStringSDHour1 = '1hour';
const obciStringSDHour2 = '2hour';
const obciStringSDHour4 = '4hour';
const obciStringSDHour12 = '12hour';
const obciStringSDHour24 = '24hour';
const obciStringSDMin5 = '5min';
const obciStringSDMin15 = '15min';
const obciStringSDMin30 = '30min';
const obciStringSDSec14 = '14sec';

/** Stream Data Commands */
const obciStreamStart = 'b';
const obciStreamStop = 's';

/** Miscellaneous */
const obciMiscQueryRegisterSettings = '?';
const obciMiscQueryRegisterSettingsChannel1 = 'CH1SET';
const obciMiscQueryRegisterSettingsChannel2 = 'CH2SET';
const obciMiscQueryRegisterSettingsChannel3 = 'CH3SET';
const obciMiscQueryRegisterSettingsChannel4 = 'CH4SET';
const obciMiscQueryRegisterSettingsChannel5 = 'CH5SET';
const obciMiscQueryRegisterSettingsChannel6 = 'CH6SET';
const obciMiscQueryRegisterSettingsChannel7 = 'CH7SET';
const obciMiscQueryRegisterSettingsChannel8 = 'CH8SET';
const obciMiscSoftReset = 'v';

/** 16 Channel Commands */
const obciChannelMaxNumber8 = 'c';
const obciChannelMaxNumber16 = 'C';
const obciChannelMaxNumber8NoDaisyToRemove = '';
const obciChannelMaxNumber8SuccessDaisyRemoved = 'daisy removed';
const obciChannelMaxNumber16DaisyAlreadyAttached = '16';
const obciChannelMaxNumber16DaisyAttached = 'daisy attached16';
const obciChannelMaxNumber16NoDaisyAttached = 'no daisy to attach!8';

/** 60Hz line filter */
const obciFilterDisable = 'g';
const obciFilterEnable = 'f';

/** Triggers */
const obciTrigger = '`';

/** Sync Clocks */
const obciSyncTimeSet = '<';
const obciSyncTimeSent = ',';

/** Set board mode */
const obciBoardModeSet = '/';
const obciBoardModeCmdDefault = '0';
const obciBoardModeCmdDebug = '1';
const obciBoardModeCmdAnalog = '2';
const obciBoardModeCmdDigital = '3';
const obciBoardModeCmdGetCur = '/';
const obciBoardModeAnalog = 'analog';
const obciBoardModeDefault = 'default';
const obciBoardModeDebug = 'debug';
const obciBoardModeDigital = 'digital';

/** Set sample rate */
const obciSampleRateSet = '~';
const obciSampleRateCmdCyton16000 = '0';
const obciSampleRateCmdCyton8000 = '1';
const obciSampleRateCmdCyton4000 = '2';
const obciSampleRateCmdCyton2000 = '3';
const obciSampleRateCmdCyton1000 = '4';
const obciSampleRateCmdCyton500 = '5';
const obciSampleRateCmdCyton250 = '6';
const obciSampleRateCmdGang25600 = '0';
const obciSampleRateCmdGang12800 = '1';
const obciSampleRateCmdGang6400 = '2';
const obciSampleRateCmdGang3200 = '3';
const obciSampleRateCmdGang1600 = '4';
const obciSampleRateCmdGang800 = '5';
const obciSampleRateCmdGang400 = '6';
const obciSampleRateCmdGang200 = '7';
const obciSampleRateCmdaGetCur = '~';

/** Accel enable/disable commands */
const obciAccelStart = 'n';
const obciAccelStop = 'N';

/** Wifi Stuff */
const obciWifiAttach = '{';
const obciWifiRemove = '}';
const obciWifiReset = ';';
const obciWifiStatus = ':';

/** Radio Key */
const obciRadioKey = 0xF0;
/** Radio Commands */
const obciRadioCmdChannelGet = 0x00;
const obciRadioCmdChannelSet = 0x01;
const obciRadioCmdChannelSetOverride = 0x02;
const obciRadioCmdPollTimeGet = 0x03;
const obciRadioCmdPollTimeSet = 0x04;
const obciRadioCmdBaudRateSetDefault = 0x05;
const obciRadioCmdBaudRateSetFast = 0x06;
const obciRadioCmdSystemStatus = 0x07;

/** Possible number of channels */
const obciNumberOfChannelsCyton = 8;
const obciNumberOfChannelsCytonBLE = 2;
const obciNumberOfChannelsDaisy = 16;
const obciNumberOfChannelsDefault = obciNumberOfChannelsCyton;
const obciNumberOfChannelsGanglion = 4;

/** Possible OpenBCI board types */
const obciBoardCyton = 'cyton';
const obciBoardCytonBLE = 'cytonBLE';
const obciBoardDaisy = 'daisy';
const obciBoardDefault = 'default';
const obciBoardGanglion = 'ganglion';
const obciBoardNone = 'none';

/** Possible Simulator Line Noise injections */
const obciSimulatorLineNoiseHz60 = '60Hz';
const obciSimulatorLineNoiseHz50 = '50Hz';
const obciSimulatorLineNoiseNone = 'none';

/** Possible Simulator Fragmentation modes */
const obciSimulatorFragmentationRandom = 'random';
const obciSimulatorFragmentationFullBuffers = 'fullBuffers';
const obciSimulatorFragmentationOneByOne = 'oneByOne';
const obciSimulatorFragmentationNone = 'none';

/** Possible Sample Rates */
const obciSampleRate1000 = 1000;
const obciSampleRate125 = 125;
const obciSampleRate12800 = 12800;
const obciSampleRate1600 = 1600;
const obciSampleRate16000 = 16000;
const obciSampleRate200 = 200;
const obciSampleRate2000 = 2000;
const obciSampleRate250 = 250;
const obciSampleRate25600 = 25600;
const obciSampleRate3200 = 3200;
const obciSampleRate400 = 400;
const obciSampleRate4000 = 4000;
const obciSampleRate500 = 500;
const obciSampleRate6400 = 6400;
const obciSampleRate800 = 800;
const obciSampleRate8000 = 8000;

/** Max sample number */
const obciSampleNumberMax = 255;

/** Packet Size */
const obciPacketSize = 33;
const obciPacketSizeBLECyton = 20;
const obciPacketSizeBLERaw = 12;

/** OpenBCI V3 Standard Packet Positions */
/**
* 0:[startByte] | 1:[sampleNumber] | 2:[Channel-1.1] | 3:[Channel-1.2] | 4:[Channel-1.3] | 5:[Channel-2.1] | 6:[Channel-2.2] | 7:[Channel-2.3] | 8:[Channel-3.1] | 9:[Channel-3.2] | 10:[Channel-3.3] | 11:[Channel-4.1] | 12:[Channel-4.2] | 13:[Channel-4.3] | 14:[Channel-5.1] | 15:[Channel-5.2] | 16:[Channel-5.3] | 17:[Channel-6.1] | 18:[Channel-6.2] | 19:[Channel-6.3] | 20:[Channel-7.1] | 21:[Channel-7.2] | 22:[Channel-7.3] | 23:[Channel-8.1] | 24:[Channel-8.2] | 25:[Channel-8.3] | 26:[Aux-1.1] | 27:[Aux-1.2] | 28:[Aux-2.1] | 29:[Aux-2.2] | 30:[Aux-3.1] | 31:[Aux-3.2] | 32:StopByte
*/
const obciPacketPositionChannelDataStart = 2; // 0:startByte | 1:sampleNumber | [2:4] | [5:7] | [8:10] | [11:13] | [14:16] | [17:19] | [21:23] | [24:26]
const obciPacketPositionChannelDataStop = 25; // 24 bytes for channel data
const obciPacketPositionSampleNumber = 1;
const obciPacketPositionStartByte = 0; // first byte
const obciPacketPositionStopByte = 32; // [32]
const obciPacketPositionStartAux = 26; // [26,27]:Aux 1 | [28,29]:Aux 2 | [30,31]:Aux 3
const obciPacketPositionStopAux = 31; // - - - [30,31]:Aux 3 | 32: Stop byte
const obciPacketPositionTimeSyncAuxStart = 26;
const obciPacketPositionTimeSyncAuxStop = 28;
const obciPacketPositionTimeSyncTimeStart = 28;
const obciPacketPositionTimeSyncTimeStop = 32;

/** Notable Bytes */
const obciByteStart = 0xA0;
const obciByteStop = 0xC0;

/** Errors */
const errorInvalidByteLength = 'Invalid Packet Byte Length';
const errorInvalidByteStart = 'Invalid Start Byte';
const errorInvalidByteStop = 'Invalid Stop Byte';
const errorInvalidData = 'Invalid data - try again';
const errorInvalidType = 'Invalid type - check comments for input type';
const errorMissingRegisterSetting = 'Missing register setting';
const errorMissingRequiredProperty = 'Missing property in JSON';
const errorNobleAlreadyScanning = 'Scan already under way';
const errorNobleNotAlreadyScanning = 'No scan started';
const errorNobleNotInPoweredOnState = 'Please turn blue tooth on.';
const errorTimeSyncIsNull = "'this.sync.curSyncObj' must not be null";
const errorTimeSyncNoComma = 'Missed the time sync sent confirmation. Try sync again';
const errorUndefinedOrNullInput = 'Undefined or Null Input';

/** Max Master Buffer Size */
const obciMasterBufferSize = 4096;

/** Impedance Calculation Variables */
const obciLeadOffDriveInAmps = 0.000000006;
const obciLeadOffFrequencyHz = 31.5;

/** Command send delay */
const obciWriteIntervalDelayMSLong = 50;
const obciWriteIntervalDelayMSNone = 0;
const obciWriteIntervalDelayMSShort = 10;

/** Impedance */
const obciImpedanceTextBad = 'bad';
const obciImpedanceTextNone = 'none';
const obciImpedanceTextGood = 'good';
const obciImpedanceTextInit = 'init';
const obciImpedanceTextOk = 'ok';

const obciImpedanceThresholdGoodMin = 0;
const obciImpedanceThresholdGoodMax = 5000;
const obciImpedanceThresholdOkMin = 5001;
const obciImpedanceThresholdOkMax = 10000;
const obciImpedanceThresholdBadMin = 10001;
const obciImpedanceThresholdBadMax = 1000000;

const obciImpedanceSeriesResistor = 2200; // There is a 2.2 k Ohm series resistor that must be subtracted

/** Simulator */
const obciSimulatorPortName = 'OpenBCISimulator';

/**
* Stream packet types/codes
*/
const obciStreamPacketStandardAccel = 0; // 0000
const obciStreamPacketStandardRawAux = 1; // 0001
const obciStreamPacketUserDefinedType = 2; // 0010
const obciStreamPacketAccelTimeSyncSet = 3; // 0011
const obciStreamPacketAccelTimeSynced = 4; // 0100
const obciStreamPacketRawAuxTimeSyncSet = 5; // 0101
const obciStreamPacketRawAuxTimeSynced = 6; // 0110
const obciStreamPacketImpedance = 7; // 0111

/** Time from board */
const obciStreamPacketTimeByteSize = 4;

/** Time synced with accel packet */
const obciAccelAxisX = 7;
const obciAccelAxisY = 8;
const obciAccelAxisZ = 9;

/** Firmware version indicator */
const obciFirmwareV1 = 'v1';
const obciFirmwareV2 = 'v2';
const obciFirmwareV3 = 'v3';

/** Parse */
const obciParseDaisy = 'Daisy';
const obciParseFirmware = 'v2';
const obciParseFailure = 'Failure';
const obciParseEOT = '$$$';
const obciParseSuccess = 'Success';

/** Used in parsing incoming serial data */
const obciParsingChannelSettings = 2;
const obciParsingEOT = 4;
const obciParsingNormal = 3;
const obciParsingReset = 0;
const obciParsingTimeSyncSent = 1;

/** Timeouts */
const obciTimeoutProcessBytes = 500; // 0.5 seconds

/** Simulator Board Configurations */
const obciSimulatorRawAux = 'rawAux';
const obciSimulatorStandard = 'standard';

/** OpenBCI Radio Limits */
const obciRadioChannelMax = 25;
const obciRadioChannelMin = 1;
const obciRadioPollTimeMax = 255;
const obciRadioPollTimeMin = 0;

/** Time sync stuff */
const obciTimeSyncArraySize = 10;
const obciTimeSyncMultiplierWithSyncConf = 0.9;
const obciTimeSyncMultiplierWithoutSyncConf = 0.75;
const obciTimeSyncThresholdTransFailureMS = 10; // ms

/** Baud Rates */
const obciRadioBaudRateDefault = 115200;
const obciRadioBaudRateDefaultStr = 'default';
const obciRadioBaudRateFast = 230400;
const obciRadioBaudRateFastStr = 'fast';

/** Emitters */
const obciEmitterAccelerometer = 'accelerometer';
const obciEmitterBlePoweredUp = 'blePoweredOn';
const obciEmitterClose = 'close';
const obciEmitterDroppedPacket = 'droppedPacket';
const obciEmitterEot = 'eot';
const obciEmitterError = 'error';
const obciEmitterGanglionFound = 'ganglionFound';
const obciEmitterHardSet = 'hardSet';
const obciEmitterImpedance = 'impedance';
const obciEmitterImpedanceArray = 'impedanceArray';
const obciEmitterMessage = 'message';
const obciEmitterQuery = 'query';
const obciEmitterRawDataPacket = 'rawDataPacket';
const obciEmitterReady = 'ready';
const obciEmitterRFduino = 'rfduino';
const obciEmitterSample = 'sample';
const obciEmitterScanStopped = 'scanStopped';
const obciEmitterSynced = 'synced';
const obciEmitterWifiShield = 'wifiShield';

/** Accel packets */
const obciGanglionAccelAxisX = 1;
const obciGanglionAccelAxisY = 2;
const obciGanglionAccelAxisZ = 3;

/** Accel scale factor */
const obciGanglionAccelScaleFactor = 0.016; // mG per count

/** Ganglion */
const obciGanglionBleSearchTime = 20000; // ms
const obciGanglionByteIdUncompressed = 0;
const obciGanglionByteId18Bit = {
  max: 100,
  min: 1
};
const obciGanglionByteId19Bit = {
  max: 200,
  min: 101
};
const obciGanglionByteIdImpedanceChannel1 = 201;
const obciGanglionByteIdImpedanceChannel2 = 202;
const obciGanglionByteIdImpedanceChannel3 = 203;
const obciGanglionByteIdImpedanceChannel4 = 204;
const obciGanglionByteIdImpedanceChannelReference = 205;
const obciGanglionByteIdMultiPacket = 206;
const obciGanglionByteIdMultiPacketStop = 207;
const obciGanglionPacketSize = 20;
const obciGanglionSamplesPerPacket = 2;
const obciGanglionPacket18Bit = {
  auxByte: 20,
  byteId: 0,
  dataStart: 1,
  dataStop: 19
};
const obciGanglionPacket19Bit = {
  byteId: 0,
  dataStart: 1,
  dataStop: 20
};
const obciGanglionMCP3912Gain = 51.0;  // assumed gain setting for MCP3912.  NEEDS TO BE ADJUSTABLE JM
const obciGanglionMCP3912Vref = 1.2;  // reference voltage for ADC in MCP3912 set in hardware
const obciGanglionPrefix = 'Ganglion';
const obciGanglionSyntheticDataEnable = 't';
const obciGanglionSyntheticDataDisable = 'T';
const obciGanglionImpedanceStart = 'z';
const obciGanglionImpedanceStop = 'Z';
const obciGanglionScaleFactorPerCountVolts = obciGanglionMCP3912Vref / (8388607.0 * obciGanglionMCP3912Gain * 1.5);

/** Simblee */
const simbleeUuidService = 'fe84';
const simbleeUuidReceive = '2d30c082f39f4ce6923f3484ea480596';
const simbleeUuidSend = '2d30c083f39f4ce6923f3484ea480596';
const simbleeUuidDisconnect = '2d30c084f39f4ce6923f3484ea480596';

/** RFduino BLE UUID */
const rfduinoUuidService = '2220';
const rfduinoUuidReceive = '2221';
const rfduinoUuidSend = '2222';
const rfduinoUuidSendTwo = '2223';

/** Cyton BLE */
const obciCytonBLESamplesPerPacket = 3;

/** Noble */
const obciNobleEmitterPeripheralConnect = 'connect';
const obciNobleEmitterPeripheralDisconnect = 'disconnect';
const obciNobleEmitterPeripheralDiscover = 'discover';
const obciNobleEmitterPeripheralServicesDiscover = 'servicesDiscover';
const obciNobleEmitterServiceCharacteristicsDiscover = 'characteristicsDiscover';
const obciNobleEmitterServiceRead = 'read';
const obciNobleEmitterDiscover = 'discover';
const obciNobleEmitterScanStart = 'scanStart';
const obciNobleEmitterScanStop = 'scanStop';
const obciNobleEmitterStateChange = 'stateChange';
const obciNobleStatePoweredOn = 'poweredOn';

/** Protocols */
const obciProtocolBLE = 'ble';
const obciProtocolSerial = 'serial';
const obciProtocolWifi = 'wifi';

/** Register Query on Cyton */
const obciRegisterQueryAccelerometerFirmwareV1 = '\nLIS3DH Registers\n0x07.0\n0x08.0\n0x09.0\n0x0A.0\n0x0B.0\n0x0C.0\n0x0D.0\n0x0E.0\n0x0F.33\n\n0x1F.0\n0x20.8\n0x21.0\n0x22.0\n0x23.18\n0x24.0\n0x25.0\n0x26.0\n0x27.0\n0x28.0\n0x29.0\n0x2A.0\n0x2B.0\n0x2C.0\n0x2D.0\n0x2E.0\n0x2F.20\n0x30.0\n0x31.0\n0x32.0\n0x33.0\n\n0x38.0\n0x39.0\n0x3A.0\n0x3B.0\n0x3C.0\n0x3D.0\n';
const obciRegisterQueryAccelerometerFirmwareV3 = '\nLIS3DH Registers\n0x07 00\n0x08 00\n0x09 00\n0x0A 00\n0x0B 00\n0x0C 00\n0x0D 00\n0x0E 00\n0x0F 33\n\n0x1F 00\n0x20 08\n0x21 00\n0x22 00\n0x23 18\n0x24 00\n0x25 00\n0x26 00\n0x27 00\n0x28 00\n0x29 00\n0x2A 00\n0x2B 00\n0x2C 00\n0x2D 00\n0x2E 00\n0x2F 20\n0x30 00\n0x31 00\n0x32 00\n0x33 00\n\n0x38 00\n0x39 00\n0x3A 00\n0x3B 00\n0x3C 00\n0x3D 00\n';
const obciRegisterQueryCyton = '\nBoard ADS Registers\nADS_ID, 00, 3E, 0, 0, 1, 1, 1, 1, 1, 0\nCONFIG1, 01, 96, 1, 0, 0, 1, 0, 1, 1, 0\nCONFIG2, 02, C0, 1, 1, 0, 0, 0, 0, 0, 0\nCONFIG3, 03, EC, 1, 1, 1, 0, 1, 1, 0, 0\nLOFF, 04, 02, 0, 0, 0, 0, 0, 0, 1, 0\nCH1SET, 05, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH2SET, 06, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH3SET, 07, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH4SET, 08, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH5SET, 09, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH6SET, 0A, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH7SET, 0B, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH8SET, 0C, 68, 0, 1, 1, 0, 1, 0, 0, 0\nBIAS_SENSP, 0D, FF, 1, 1, 1, 1, 1, 1, 1, 1\nBIAS_SENSN, 0E, FF, 1, 1, 1, 1, 1, 1, 1, 1\nLOFF_SENSP, 0F, 00, 0, 0, 0, 0, 0, 0, 0, 0\nLOFF_SENSN, 10, 00, 0, 0, 0, 0, 0, 0, 0, 0\nLOFF_FLIP, 11, 00, 0, 0, 0, 0, 0, 0, 0, 0\nLOFF_STATP, 12, 00, 0, 0, 0, 0, 0, 0, 0, 0\nLOFF_STATN, 13, 00, 0, 0, 0, 0, 0, 0, 0, 0\nGPIO, 14, 0F, 0, 0, 0, 0, 1, 1, 1, 1\nMISC1, 15, 00, 0, 0, 0, 0, 0, 0, 0, 0\nMISC2, 16, 00, 0, 0, 0, 0, 0, 0, 0, 0\nCONFIG4, 17, 00, 0, 0, 0, 0, 0, 0, 0, 0\n';
const obciRegisterQueryCytonDaisy = '\nDaisy ADS Registers\nADS_ID, 00, 3E, 0, 0, 1, 1, 1, 1, 1, 0\nCONFIG1, 01, 96, 1, 0, 0, 1, 0, 1, 1, 0\nCONFIG2, 02, C0, 1, 1, 0, 0, 0, 0, 0, 0\nCONFIG3, 03, EC, 1, 1, 1, 0, 1, 1, 0, 0\nLOFF, 04, 02, 0, 0, 0, 0, 0, 0, 1, 0\nCH1SET, 05, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH2SET, 06, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH3SET, 07, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH4SET, 08, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH5SET, 09, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH6SET, 0A, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH7SET, 0B, 68, 0, 1, 1, 0, 1, 0, 0, 0\nCH8SET, 0C, 68, 0, 1, 1, 0, 1, 0, 0, 0\nBIAS_SENSP, 0D, FF, 1, 1, 1, 1, 1, 1, 1, 1\nBIAS_SENSN, 0E, FF, 1, 1, 1, 1, 1, 1, 1, 1\nLOFF_SENSP, 0F, 00, 0, 0, 0, 0, 0, 0, 0, 0\nLOFF_SENSN, 10, 00, 0, 0, 0, 0, 0, 0, 0, 0\nLOFF_FLIP, 11, 00, 0, 0, 0, 0, 0, 0, 0, 0\nLOFF_STATP, 12, 00, 0, 0, 0, 0, 0, 0, 0, 0\nLOFF_STATN, 13, 00, 0, 0, 0, 0, 0, 0, 0, 0\nGPIO, 14, 0F, 0, 0, 0, 0, 1, 1, 1, 1\nMISC1, 15, 00, 0, 0, 0, 0, 0, 0, 0, 0\nMISC2, 16, 00, 0, 0, 0, 0, 0, 0, 0, 0\nCONFIG4, 17, 00, 0, 0, 0, 0, 0, 0, 0, 0\n';
const obciRegisterQueryNameMISC1 = 'MISC1';
const obciRegisterQueryNameBIASSENSP = 'BIAS_SENSP';
const obciRegisterQueryNameCHnSET = ['CH1SET', 'CH2SET', 'CH3SET', 'CH4SET', 'CH5SET', 'CH6SET', 'CH7SET', 'CH8SET'];
const obciRegisterQuerySizeCytonFirmwareV1 = obciRegisterQueryCyton.length + obciRegisterQueryAccelerometerFirmwareV1.length;
const obciRegisterQuerySizeCytonDaisyFirmwareV1 = obciRegisterQueryCyton.length + obciRegisterQueryCytonDaisy.length + obciRegisterQueryAccelerometerFirmwareV1.length;
const obciRegisterQuerySizeCytonFirmwareV3 = obciRegisterQueryCyton.length + obciRegisterQueryAccelerometerFirmwareV3.length;
const obciRegisterQuerySizeCytonDaisyFirmwareV3 = obciRegisterQueryCyton.length + obciRegisterQueryCytonDaisy.length + obciRegisterQueryAccelerometerFirmwareV3.length;

const constantsModule = {
  /** Turning channels off */
  OBCIChannelOff1: obciChannelOff1,
  OBCIChannelOff2: obciChannelOff2,
  OBCIChannelOff3: obciChannelOff3,
  OBCIChannelOff4: obciChannelOff4,
  OBCIChannelOff5: obciChannelOff5,
  OBCIChannelOff6: obciChannelOff6,
  OBCIChannelOff7: obciChannelOff7,
  OBCIChannelOff8: obciChannelOff8,
  OBCIChannelOff9: obciChannelOff9,
  OBCIChannelOff10: obciChannelOff10,
  OBCIChannelOff11: obciChannelOff11,
  OBCIChannelOff12: obciChannelOff12,
  OBCIChannelOff13: obciChannelOff13,
  OBCIChannelOff14: obciChannelOff14,
  OBCIChannelOff15: obciChannelOff15,
  OBCIChannelOff16: obciChannelOff16,
  /**
  * Purpose: To get the proper command to turn a channel off
  * @param channelNumber - A number (1-16) of the desired channel
  * @returns {Promise}
  */
  commandChannelOff: function (channelNumber) {
    return new Promise(function (resolve, reject) {
      switch (channelNumber) {
        case 1:
          resolve(obciChannelOff1);
          break;
        case 2:
          resolve(obciChannelOff2);
          break;
        case 3:
          resolve(obciChannelOff3);
          break;
        case 4:
          resolve(obciChannelOff4);
          break;
        case 5:
          resolve(obciChannelOff5);
          break;
        case 6:
          resolve(obciChannelOff6);
          break;
        case 7:
          resolve(obciChannelOff7);
          break;
        case 8:
          resolve(obciChannelOff8);
          break;
        case 9:
          resolve(obciChannelOff9);
          break;
        case 10:
          resolve(obciChannelOff10);
          break;
        case 11:
          resolve(obciChannelOff11);
          break;
        case 12:
          resolve(obciChannelOff12);
          break;
        case 13:
          resolve(obciChannelOff13);
          break;
        case 14:
          resolve(obciChannelOff14);
          break;
        case 15:
          resolve(obciChannelOff15);
          break;
        case 16:
          resolve(obciChannelOff16);
          break;
        default:
          reject(Error('Error [commandChannelOff]: Invalid Channel Number'));
          break;
      }
    });
  },
  /** Turning channels on */
  OBCIChannelOn1: obciChannelOn1,
  OBCIChannelOn2: obciChannelOn2,
  OBCIChannelOn3: obciChannelOn3,
  OBCIChannelOn4: obciChannelOn4,
  OBCIChannelOn5: obciChannelOn5,
  OBCIChannelOn6: obciChannelOn6,
  OBCIChannelOn7: obciChannelOn7,
  OBCIChannelOn8: obciChannelOn8,
  OBCIChannelOn9: obciChannelOn9,
  OBCIChannelOn10: obciChannelOn10,
  OBCIChannelOn11: obciChannelOn11,
  OBCIChannelOn12: obciChannelOn12,
  OBCIChannelOn13: obciChannelOn13,
  OBCIChannelOn14: obciChannelOn14,
  OBCIChannelOn15: obciChannelOn15,
  OBCIChannelOn16: obciChannelOn16,
  commandChannelOn: function (channelNumber) {
    return new Promise(function (resolve, reject) {
      switch (channelNumber) {
        case 1:
          resolve(obciChannelOn1);
          break;
        case 2:
          resolve(obciChannelOn2);
          break;
        case 3:
          resolve(obciChannelOn3);
          break;
        case 4:
          resolve(obciChannelOn4);
          break;
        case 5:
          resolve(obciChannelOn5);
          break;
        case 6:
          resolve(obciChannelOn6);
          break;
        case 7:
          resolve(obciChannelOn7);
          break;
        case 8:
          resolve(obciChannelOn8);
          break;
        case 9:
          resolve(obciChannelOn9);
          break;
        case 10:
          resolve(obciChannelOn10);
          break;
        case 11:
          resolve(obciChannelOn11);
          break;
        case 12:
          resolve(obciChannelOn12);
          break;
        case 13:
          resolve(obciChannelOn13);
          break;
        case 14:
          resolve(obciChannelOn14);
          break;
        case 15:
          resolve(obciChannelOn15);
          break;
        case 16:
          resolve(obciChannelOn16);
          break;
        default:
          reject(Error('Error [commandChannelOn]: Invalid Channel Number'));
          break;
      }
    });
  },
  /** Test Signal Control Commands */
  OBCITestSignalConnectToDC: obciTestSignalConnectToDC,
  OBCITestSignalConnectToGround: obciTestSignalConnectToGround,
  OBCITestSignalConnectToPulse1xFast: obciTestSignalConnectToPulse1xFast,
  OBCITestSignalConnectToPulse1xSlow: obciTestSignalConnectToPulse1xSlow,
  OBCITestSignalConnectToPulse2xFast: obciTestSignalConnectToPulse2xFast,
  OBCITestSignalConnectToPulse2xSlow: obciTestSignalConnectToPulse2xSlow,
  getTestSignalCommand: (signal) => {
    return new Promise((resolve, reject) => {
      switch (signal) {
        case 'dc':
          resolve(obciTestSignalConnectToDC);
          break;
        case 'ground':
          resolve(obciTestSignalConnectToGround);
          break;
        case 'pulse1xFast':
          resolve(obciTestSignalConnectToPulse1xFast);
          break;
        case 'pulse1xSlow':
          resolve(obciTestSignalConnectToPulse1xSlow);
          break;
        case 'pulse2xFast':
          resolve(obciTestSignalConnectToPulse2xFast);
          break;
        case 'pulse2xSlow':
          resolve(obciTestSignalConnectToPulse2xSlow);
          break;
        case 'none':
          resolve(obciChannelDefaultAllSet);
          break;
        default:
          reject(Error('Invalid selection! Check your spelling.'));
          break;
      }
    });
  },
  /** Channel Setting Commands */
  OBCIChannelCmdADCNormal: obciChannelCmdADCNormal,
  OBCIChannelCmdADCShorted: obciChannelCmdADCShorted,
  OBCIChannelCmdADCBiasDRP: obciChannelCmdADCBiasDRP,
  OBCIChannelCmdADCBiasDRN: obciChannelCmdADCBiasDRN,
  OBCIChannelCmdADCBiasMethod: obciChannelCmdADCBiasMethod,
  OBCIChannelCmdADCMVDD: obciChannelCmdADCMVDD,
  OBCIChannelCmdADCTemp: obciChannelCmdADCTemp,
  OBCIChannelCmdADCTestSig: obciChannelCmdADCTestSig,
  OBCIChannelCmdBiasInclude: obciChannelCmdBiasInclude,
  OBCIChannelCmdBiasRemove: obciChannelCmdBiasRemove,
  OBCIChannelCmdChannel1: obciChannelCmdChannel1,
  OBCIChannelCmdChannel2: obciChannelCmdChannel2,
  OBCIChannelCmdChannel3: obciChannelCmdChannel3,
  OBCIChannelCmdChannel4: obciChannelCmdChannel4,
  OBCIChannelCmdChannel5: obciChannelCmdChannel5,
  OBCIChannelCmdChannel6: obciChannelCmdChannel6,
  OBCIChannelCmdChannel7: obciChannelCmdChannel7,
  OBCIChannelCmdChannel8: obciChannelCmdChannel8,
  OBCIChannelCmdChannel9: obciChannelCmdChannel9,
  OBCIChannelCmdChannel10: obciChannelCmdChannel10,
  OBCIChannelCmdChannel11: obciChannelCmdChannel11,
  OBCIChannelCmdChannel12: obciChannelCmdChannel12,
  OBCIChannelCmdChannel13: obciChannelCmdChannel13,
  OBCIChannelCmdChannel14: obciChannelCmdChannel14,
  OBCIChannelCmdChannel15: obciChannelCmdChannel15,
  OBCIChannelCmdChannel16: obciChannelCmdChannel16,
  commandChannelForCmd,
  OBCIChannelCmdGain1: obciChannelCmdGain1,
  OBCIChannelCmdGain2: obciChannelCmdGain2,
  OBCIChannelCmdGain4: obciChannelCmdGain4,
  OBCIChannelCmdGain6: obciChannelCmdGain6,
  OBCIChannelCmdGain8: obciChannelCmdGain8,
  OBCIChannelCmdGain12: obciChannelCmdGain12,
  OBCIChannelCmdGain24: obciChannelCmdGain24,
  commandForGain,
  gainForCommand,
  OBCIChannelCmdLatch: obciChannelCmdLatch,
  OBCIChannelCmdPowerOff: obciChannelCmdPowerOff,
  OBCIChannelCmdPowerOn: obciChannelCmdPowerOn,
  OBCIChannelCmdSet: obciChannelCmdSet,
  OBCIChannelCmdSRB1Connect: obciChannelCmdSRB1Connect,
  OBCIChannelCmdSRB1Diconnect: obciChannelCmdSRB1Diconnect,
  OBCIChannelCmdSRB2Connect: obciChannelCmdSRB2Connect,
  OBCIChannelCmdSRB2Diconnect: obciChannelCmdSRB2Diconnect,
  /** Channel Settings Object */
  channelSettingsObjectDefault,
  /**
   * @param numberOfChannels {Number}
   * @returns {Array}
   */
  channelSettingsArrayInit: (numberOfChannels) => {
    var newChannelSettingsArray = [];
    for (var i = 0; i < numberOfChannels; i++) {
      newChannelSettingsArray.push(channelSettingsObjectDefault(i));
    }
    return newChannelSettingsArray;
  },
  /** Channel Setting Helper Strings */
  OBCIStringADCNormal: obciStringADCNormal,
  OBCIStringADCShorted: obciStringADCShorted,
  OBCIStringADCBiasMethod: obciStringADCBiasMethod,
  OBCIStringADCMvdd: obciStringADCMvdd,
  OBCIStringADCTemp: obciStringADCTemp,
  OBCIStringADCTestSig: obciStringADCTestSig,
  OBCIStringADCBiasDrp: obciStringADCBiasDrp,
  OBCIStringADCBiasDrn: obciStringADCBiasDrn,
  /**
  * @description To convert a string like 'normal' to the correct command (i.e. '1')
  * @param adcString
  * @returns {Promise}
  * @author AJ Keller (@pushtheworldllc)
  */
  commandForADCString,
  inputTypeForCommand,
  /** Default Channel Settings */
  OBCIChannelDefaultAllSet: obciChannelDefaultAllSet,
  OBCIChannelDefaultAllGet: obciChannelDefaultAllGet,
  /** LeadOff Impedance Commands */
  OBCIChannelImpedanceLatch: obciChannelImpedanceLatch,
  OBCIChannelImpedanceSet: obciChannelImpedanceSet,
  OBCIChannelImpedanceTestSignalApplied: obciChannelImpedanceTestSignalApplied,
  OBCIChannelImpedanceTestSignalAppliedNot: obciChannelImpedanceTestSignalAppliedNot,
  /** SD card Commands */
  OBCISDLogForHour1: obciSDLogForHour1,
  OBCISDLogForHour2: obciSDLogForHour2,
  OBCISDLogForHour4: obciSDLogForHour4,
  OBCISDLogForHour12: obciSDLogForHour12,
  OBCISDLogForHour24: obciSDLogForHour24,
  OBCISDLogForMin5: obciSDLogForMin5,
  OBCISDLogForMin15: obciSDLogForMin15,
  OBCISDLogForMin30: obciSDLogForMin30,
  OBCISDLogForSec14: obciSDLogForSec14,
  OBCISDLogStop: obciSDLogStop,
  /** SD Card String Commands */
  OBCIStringSDHour1: obciStringSDHour1,
  OBCIStringSDHour2: obciStringSDHour2,
  OBCIStringSDHour4: obciStringSDHour4,
  OBCIStringSDHour12: obciStringSDHour12,
  OBCIStringSDHour24: obciStringSDHour24,
  OBCIStringSDMin5: obciStringSDMin5,
  OBCIStringSDMin15: obciStringSDMin15,
  OBCIStringSDMin30: obciStringSDMin30,
  OBCIStringSDSec14: obciStringSDSec14,
  /**
  * @description Converts a sd string into the proper setting.
  * @param stringCommand {String} - The length of time you want to record to the SD for.
  * @returns {Promise} The command to send to the Board, returns an error on improper `stringCommand`
  */
  sdSettingForString: (stringCommand) => {
    return new Promise((resolve, reject) => {
      switch (stringCommand) {
        case obciStringSDHour1:
          resolve(obciSDLogForHour1);
          break;
        case obciStringSDHour2:
          resolve(obciSDLogForHour2);
          break;
        case obciStringSDHour4:
          resolve(obciSDLogForHour4);
          break;
        case obciStringSDHour12:
          resolve(obciSDLogForHour12);
          break;
        case obciStringSDHour24:
          resolve(obciSDLogForHour24);
          break;
        case obciStringSDMin5:
          resolve(obciSDLogForMin5);
          break;
        case obciStringSDMin15:
          resolve(obciSDLogForMin15);
          break;
        case obciStringSDMin30:
          resolve(obciSDLogForMin30);
          break;
        case obciStringSDSec14:
          resolve(obciSDLogForSec14);
          break;
        default:
          reject(Error(TypeError));
          break;
      }
    });
  },
  /** Stream Data Commands */
  OBCIStreamStart: obciStreamStart,
  OBCIStreamStop: obciStreamStop,
  /** Accel enable/disable commands */
  OBCIAccelStart: obciAccelStart,
  OBCIAccelStop: obciAccelStop,
  /** Miscellaneous */
  OBCIMiscQueryRegisterSettings: obciMiscQueryRegisterSettings,
  OBCIMiscQueryRegisterSettingsChannel1: obciMiscQueryRegisterSettingsChannel1,
  OBCIMiscQueryRegisterSettingsChannel2: obciMiscQueryRegisterSettingsChannel2,
  OBCIMiscQueryRegisterSettingsChannel3: obciMiscQueryRegisterSettingsChannel3,
  OBCIMiscQueryRegisterSettingsChannel4: obciMiscQueryRegisterSettingsChannel4,
  OBCIMiscQueryRegisterSettingsChannel5: obciMiscQueryRegisterSettingsChannel5,
  OBCIMiscQueryRegisterSettingsChannel6: obciMiscQueryRegisterSettingsChannel6,
  OBCIMiscQueryRegisterSettingsChannel7: obciMiscQueryRegisterSettingsChannel7,
  OBCIMiscQueryRegisterSettingsChannel8: obciMiscQueryRegisterSettingsChannel8,
  channelSettingsKeyForChannel: channelNumber => {
    return new Promise((resolve, reject) => {
      switch (channelNumber) {
        case 1:
          resolve(new Buffer(obciMiscQueryRegisterSettingsChannel1));
          break;
        case 2:
          resolve(new Buffer(obciMiscQueryRegisterSettingsChannel2));
          break;
        case 3:
          resolve(new Buffer(obciMiscQueryRegisterSettingsChannel3));
          break;
        case 4:
          resolve(new Buffer(obciMiscQueryRegisterSettingsChannel4));
          break;
        case 5:
          resolve(new Buffer(obciMiscQueryRegisterSettingsChannel5));
          break;
        case 6:
          resolve(new Buffer(obciMiscQueryRegisterSettingsChannel6));
          break;
        case 7:
          resolve(new Buffer(obciMiscQueryRegisterSettingsChannel7));
          break;
        case 8:
          resolve(new Buffer(obciMiscQueryRegisterSettingsChannel8));
          break;
        default:
          reject(Error('Invalid channel number'));
          break;
      }
    });
  },
  OBCIMiscSoftReset: obciMiscSoftReset,
  /** 16 Channel Commands */
  OBCIChannelMaxNumber8: obciChannelMaxNumber8,
  OBCIChannelMaxNumber16: obciChannelMaxNumber16,
  OBCIChannelMaxNumber8NoDaisyToRemove: obciChannelMaxNumber8NoDaisyToRemove,
  OBCIChannelMaxNumber8SuccessDaisyRemoved: obciChannelMaxNumber8SuccessDaisyRemoved,
  OBCIChannelMaxNumber16DaisyAlreadyAttached: obciChannelMaxNumber16DaisyAlreadyAttached,
  OBCIChannelMaxNumber16DaisyAttached: obciChannelMaxNumber16DaisyAttached,
  OBCIChannelMaxNumber16NoDaisyAttached: obciChannelMaxNumber16NoDaisyAttached,
  /** Filters */
  OBCIFilterDisable: obciFilterDisable,
  OBCIFilterEnable: obciFilterEnable,
  /** Triggers */
  OBCITrigger: obciTrigger,
  /** Possible number of channels */
  OBCINumberOfChannelsCyton: obciNumberOfChannelsCyton,
  OBCINumberOfChannelsCytonBLE: obciNumberOfChannelsCytonBLE,
  OBCINumberOfChannelsDaisy: obciNumberOfChannelsDaisy,
  OBCINumberOfChannelsDefault: obciNumberOfChannelsDefault,
  OBCINumberOfChannelsGanglion: obciNumberOfChannelsGanglion,
  /** Possible OpenBCI board types */
  OBCIBoardCyton: obciBoardCyton,
  OBCIBoardCytonBLE: obciBoardCytonBLE,
  OBCIBoardDaisy: obciBoardDaisy,
  OBCIBoardDefault: obciBoardDefault,
  OBCIBoardGanglion: obciBoardGanglion,
  OBCIBoardNone: obciBoardNone,
  numberOfChannelsForBoardType: boardType => {
    switch (boardType) {
      case obciBoardDaisy:
        return obciNumberOfChannelsDaisy;
      case obciBoardGanglion:
        return obciNumberOfChannelsGanglion;
      case obciBoardNone:
        return 0;
      case obciBoardCytonBLE:
        return obciNumberOfChannelsCytonBLE;
      case obciBoardCyton:
      default:
        return obciNumberOfChannelsDefault;
    }
  },
  boardTypeForNumberOfChannels: (numberOfChannels) => {
    switch (numberOfChannels) {
      case obciNumberOfChannelsDaisy:
        return obciBoardDaisy;
      case obciNumberOfChannelsGanglion:
        return obciBoardGanglion;
      case 0:
        return obciBoardNone;
      case obciNumberOfChannelsCytonBLE:
        return obciBoardCytonBLE;
      case obciNumberOfChannelsDefault:
      default:
        return obciBoardCyton;
    }
  },
  /** Possible Sample Rates */
  OBCISampleRate1000: obciSampleRate1000,
  OBCISampleRate125: obciSampleRate125,
  OBCISampleRate12800: obciSampleRate12800,
  OBCISampleRate1600: obciSampleRate1600,
  OBCISampleRate16000: obciSampleRate16000,
  OBCISampleRate200: obciSampleRate200,
  OBCISampleRate2000: obciSampleRate2000,
  OBCISampleRate250: obciSampleRate250,
  OBCISampleRate25600: obciSampleRate25600,
  OBCISampleRate3200: obciSampleRate3200,
  OBCISampleRate400: obciSampleRate400,
  OBCISampleRate4000: obciSampleRate4000,
  OBCISampleRate500: obciSampleRate500,
  OBCISampleRate6400: obciSampleRate6400,
  OBCISampleRate800: obciSampleRate800,
  OBCISampleRate8000: obciSampleRate8000,
  /** Max sample number */
  OBCISampleNumberMax: obciSampleNumberMax,
  /** Packet Size */
  OBCIPacketSize: obciPacketSize,
  OBCIPacketSizeBLECyton: obciPacketSizeBLECyton,
  OBCIPacketSizeBLERaw: obciPacketSizeBLERaw,
  /** Notable Bytes */
  OBCIByteStart: obciByteStart,
  OBCIByteStop: obciByteStop,
  /** Errors */
  OBCIErrorInvalidByteLength: errorInvalidByteLength,
  OBCIErrorInvalidByteStart: errorInvalidByteStart,
  OBCIErrorInvalidByteStop: errorInvalidByteStop,
  OBCIErrorInvalidData: errorInvalidData,
  OBCIErrorInvalidType: errorInvalidType,
  OBCIErrorMissingRegisterSetting: errorMissingRegisterSetting,
  OBCIErrorMissingRequiredProperty: errorMissingRequiredProperty,
  OBCIErrorNobleAlreadyScanning: errorNobleAlreadyScanning,
  OBCIErrorNobleNotAlreadyScanning: errorNobleNotAlreadyScanning,
  OBCIErrorNobleNotInPoweredOnState: errorNobleNotInPoweredOnState,
  OBCIErrorTimeSyncIsNull: errorTimeSyncIsNull,
  OBCIErrorTimeSyncNoComma: errorTimeSyncNoComma,
  OBCIErrorUndefinedOrNullInput: errorUndefinedOrNullInput,
  /** Max Master Buffer Size */
  OBCIMasterBufferSize: obciMasterBufferSize,
  /** Impedance Calculation Variables */
  OBCILeadOffDriveInAmps: obciLeadOffDriveInAmps,
  OBCILeadOffFrequencyHz: obciLeadOffFrequencyHz,
  /** Channel Setter Maker */
  getChannelSetter: channelSetter,
  /** Impedance Setter Maker */
  getImpedanceSetter: impedanceSetter,
  /** Sample Rate Setter Maker */
  getSampleRateSetter: sampleRateSetter,
  /** Board Mode Setter Maker */
  getBoardModeSetter: boardModeSetter,
  /** Command send delay */
  OBCIWriteIntervalDelayMSLong: obciWriteIntervalDelayMSLong,
  OBCIWriteIntervalDelayMSNone: obciWriteIntervalDelayMSNone,
  OBCIWriteIntervalDelayMSShort: obciWriteIntervalDelayMSShort,
  /** Sync Clocks */
  OBCISyncTimeSent: obciSyncTimeSent,
  OBCISyncTimeSet: obciSyncTimeSet,
  /** Radio Key */
  OBCIRadioKey: obciRadioKey,
  /** Radio Commands */
  OBCIRadioCmdChannelGet: obciRadioCmdChannelGet,
  OBCIRadioCmdChannelSet: obciRadioCmdChannelSet,
  OBCIRadioCmdChannelSetOverride: obciRadioCmdChannelSetOverride,
  OBCIRadioCmdPollTimeGet: obciRadioCmdPollTimeGet,
  OBCIRadioCmdPollTimeSet: obciRadioCmdPollTimeSet,
  OBCIRadioCmdBaudRateSetDefault: obciRadioCmdBaudRateSetDefault,
  OBCIRadioCmdBaudRateSetFast: obciRadioCmdBaudRateSetFast,
  OBCIRadioCmdSystemStatus: obciRadioCmdSystemStatus,
  /** Impedance */
  OBCIImpedanceTextBad: obciImpedanceTextBad,
  OBCIImpedanceTextGood: obciImpedanceTextGood,
  OBCIImpedanceTextInit: obciImpedanceTextInit,
  OBCIImpedanceTextOk: obciImpedanceTextOk,
  OBCIImpedanceTextNone: obciImpedanceTextNone,
  OBCIImpedanceThresholdBadMax: obciImpedanceThresholdBadMax,
  OBCIImpedanceSeriesResistor: obciImpedanceSeriesResistor,
  getTextForRawImpedance: (value) => {
    if (value > obciImpedanceThresholdGoodMin && value < obciImpedanceThresholdGoodMax) {
      return obciImpedanceTextGood;
    } else if (value > obciImpedanceThresholdOkMin && value < obciImpedanceThresholdOkMax) {
      return obciImpedanceTextOk;
    } else if (value > obciImpedanceThresholdBadMin && value < obciImpedanceThresholdBadMax) {
      return obciImpedanceTextBad;
    } else {
      return obciImpedanceTextNone;
    }
  },
  /** Simulator */
  OBCISimulatorPortName: obciSimulatorPortName,
  /**
  * Stream packet types/codes
  */
  OBCIStreamPacketStandardAccel: obciStreamPacketStandardAccel,
  OBCIStreamPacketStandardRawAux: obciStreamPacketStandardRawAux,
  OBCIStreamPacketUserDefinedType: obciStreamPacketUserDefinedType,
  OBCIStreamPacketAccelTimeSyncSet: obciStreamPacketAccelTimeSyncSet,
  OBCIStreamPacketAccelTimeSynced: obciStreamPacketAccelTimeSynced,
  OBCIStreamPacketRawAuxTimeSyncSet: obciStreamPacketRawAuxTimeSyncSet,
  OBCIStreamPacketRawAuxTimeSynced: obciStreamPacketRawAuxTimeSynced,
  OBCIStreamPacketImpedance: obciStreamPacketImpedance,
  /** fun funcs */
  isNumber,
  isBoolean,
  isString,
  isUndefined,
  isNull,
  /** OpenBCI V3 Standard Packet Positions */
  OBCIPacketPositionStartByte: obciPacketPositionStartByte,
  OBCIPacketPositionStopByte: obciPacketPositionStopByte,
  OBCIPacketPositionStartAux: obciPacketPositionStartAux,
  OBCIPacketPositionStopAux: obciPacketPositionStopAux,
  OBCIPacketPositionChannelDataStart: obciPacketPositionChannelDataStart,
  OBCIPacketPositionChannelDataStop: obciPacketPositionChannelDataStop,
  OBCIPacketPositionSampleNumber: obciPacketPositionSampleNumber,
  OBCIPacketPositionTimeSyncAuxStart: obciPacketPositionTimeSyncAuxStart,
  OBCIPacketPositionTimeSyncAuxStop: obciPacketPositionTimeSyncAuxStop,
  OBCIPacketPositionTimeSyncTimeStart: obciPacketPositionTimeSyncTimeStart,
  OBCIPacketPositionTimeSyncTimeStop: obciPacketPositionTimeSyncTimeStop,
  /** Possible Simulator Line Noise injections */
  OBCISimulatorLineNoiseHz60: obciSimulatorLineNoiseHz60,
  OBCISimulatorLineNoiseHz50: obciSimulatorLineNoiseHz50,
  OBCISimulatorLineNoiseNone: obciSimulatorLineNoiseNone,
  /** Possible Simulator Fragmentation modes */
  OBCISimulatorFragmentationRandom: obciSimulatorFragmentationRandom,
  OBCISimulatorFragmentationFullBuffers: obciSimulatorFragmentationFullBuffers,
  OBCISimulatorFragmentationOneByOne: obciSimulatorFragmentationOneByOne,
  OBCISimulatorFragmentationNone: obciSimulatorFragmentationNone,
  /** Firmware version indicator */
  OBCIFirmwareV1: obciFirmwareV1,
  OBCIFirmwareV2: obciFirmwareV2,
  OBCIFirmwareV3: obciFirmwareV3,
  /** Time synced accel packet */
  OBCIAccelAxisX: obciAccelAxisX,
  OBCIAccelAxisY: obciAccelAxisY,
  OBCIAccelAxisZ: obciAccelAxisZ,
  /** Time from board */
  OBCIStreamPacketTimeByteSize: obciStreamPacketTimeByteSize,
  /** Parse */
  OBCIParseDaisy: obciParseDaisy,
  OBCIParseFailure: obciParseFailure,
  OBCIParseFirmware: obciParseFirmware,
  OBCIParseEOT: obciParseEOT,
  OBCIParseSuccess: obciParseSuccess,
  /** Used in parsing incoming serial data */
  OBCIParsingChannelSettings: obciParsingChannelSettings,
  OBCIParsingEOT: obciParsingEOT,
  OBCIParsingNormal: obciParsingNormal,
  OBCIParsingReset: obciParsingReset,
  OBCIParsingTimeSyncSent: obciParsingTimeSyncSent,
  /** Timeouts */
  OBCITimeoutProcessBytes: obciTimeoutProcessBytes,
  /** Simulator Board Configurations */
  OBCISimulatorRawAux: obciSimulatorRawAux,
  OBCISimulatorStandard: obciSimulatorStandard,
  /** Radio Channel Limits */
  OBCIRadioChannelMax: obciRadioChannelMax,
  OBCIRadioChannelMin: obciRadioChannelMin,
  OBCIRadioPollTimeMax: obciRadioPollTimeMax,
  OBCIRadioPollTimeMin: obciRadioPollTimeMin,
  /** Time sync stuff */
  OBCITimeSyncArraySize: obciTimeSyncArraySize,
  OBCITimeSyncMultiplierWithSyncConf: obciTimeSyncMultiplierWithSyncConf,
  OBCITimeSyncMultiplierWithoutSyncConf: obciTimeSyncMultiplierWithoutSyncConf,
  OBCITimeSyncThresholdTransFailureMS: obciTimeSyncThresholdTransFailureMS,
  /** Set board mode */
  OBCIBoardModeSet: obciBoardModeSet,
  OBCIBoardModeCmdDefault: obciBoardModeCmdDefault,
  OBCIBoardModeCmdDebug: obciBoardModeCmdDebug,
  OBCIBoardModeCmdAnalog: obciBoardModeCmdAnalog,
  OBCIBoardModeCmdDigital: obciBoardModeCmdDigital,
  OBCIBoardModeCmdGetCur: obciBoardModeCmdGetCur,
  OBCIBoardModeAnalog: obciBoardModeAnalog,
  OBCIBoardModeDefault: obciBoardModeDefault,
  OBCIBoardModeDebug: obciBoardModeDebug,
  OBCIBoardModeDigital: obciBoardModeDigital,

  /** Set sample rate */
  OBCISampleRateSet: obciSampleRateSet,
  OBCISampleRateCmdCyton16000: obciSampleRateCmdCyton16000,
  OBCISampleRateCmdCyton8000: obciSampleRateCmdCyton8000,
  OBCISampleRateCmdCyton4000: obciSampleRateCmdCyton4000,
  OBCISampleRateCmdCyton2000: obciSampleRateCmdCyton2000,
  OBCISampleRateCmdCyton1000: obciSampleRateCmdCyton1000,
  OBCISampleRateCmdCyton500: obciSampleRateCmdCyton500,
  OBCISampleRateCmdCyton250: obciSampleRateCmdCyton250,
  OBCISampleRateCmdGang25600: obciSampleRateCmdGang25600,
  OBCISampleRateCmdGang12800: obciSampleRateCmdGang12800,
  OBCISampleRateCmdGang6400: obciSampleRateCmdGang6400,
  OBCISampleRateCmdGang3200: obciSampleRateCmdGang3200,
  OBCISampleRateCmdGang1600: obciSampleRateCmdGang1600,
  OBCISampleRateCmdGang800: obciSampleRateCmdGang800,
  OBCISampleRateCmdGang400: obciSampleRateCmdGang400,
  OBCISampleRateCmdGang200: obciSampleRateCmdGang200,
  OBCISampleRateCmdGetCur: obciSampleRateCmdaGetCur,

  /** Wifi Stuff */
  OBCIWifiAttach: obciWifiAttach,
  OBCIWifiRemove: obciWifiRemove,
  OBCIWifiReset: obciWifiReset,
  OBCIWifiStatus: obciWifiStatus,
  /** Baud Rates */
  OBCIRadioBaudRateDefault: obciRadioBaudRateDefault,
  OBCIRadioBaudRateDefaultStr: obciRadioBaudRateDefaultStr,
  OBCIRadioBaudRateFast: obciRadioBaudRateFast,
  OBCIRadioBaudRateFastStr: obciRadioBaudRateFastStr,
  /** Emitters */
  OBCIEmitterAccelerometer: obciEmitterAccelerometer,
  OBCIEmitterBlePoweredUp: obciEmitterBlePoweredUp,
  OBCIEmitterClose: obciEmitterClose,
  OBCIEmitterDroppedPacket: obciEmitterDroppedPacket,
  OBCIEmitterEot: obciEmitterEot,
  OBCIEmitterError: obciEmitterError,
  OBCIEmitterGanglionFound: obciEmitterGanglionFound,
  OBCIEmitterHardSet: obciEmitterHardSet,
  OBCIEmitterImpedance: obciEmitterImpedance,
  OBCIEmitterImpedanceArray: obciEmitterImpedanceArray,
  OBCIEmitterMessage: obciEmitterMessage,
  OBCIEmitterQuery: obciEmitterQuery,
  OBCIEmitterRawDataPacket: obciEmitterRawDataPacket,
  OBCIEmitterReady: obciEmitterReady,
  OBCIEmitterRFduino: obciEmitterRFduino,
  OBCIEmitterSample: obciEmitterSample,
  OBCIEmitterScanStopped: obciEmitterScanStopped,
  OBCIEmitterSynced: obciEmitterSynced,
  OBCIEmitterWifiShield: obciEmitterWifiShield,
  /** Emitters */
  /** Accel packets */
  OBCIGanglionAccelAxisX: obciGanglionAccelAxisX,
  OBCIGanglionAccelAxisY: obciGanglionAccelAxisY,
  OBCIGanglionAccelAxisZ: obciGanglionAccelAxisZ,
  /** Ganglion */
  OBCIGanglionBleSearchTime: obciGanglionBleSearchTime,
  OBCIGanglionByteIdUncompressed: obciGanglionByteIdUncompressed,
  OBCIGanglionByteId18Bit: obciGanglionByteId18Bit,
  OBCIGanglionByteId19Bit: obciGanglionByteId19Bit,
  OBCIGanglionByteIdImpedanceChannel1: obciGanglionByteIdImpedanceChannel1,
  OBCIGanglionByteIdImpedanceChannel2: obciGanglionByteIdImpedanceChannel2,
  OBCIGanglionByteIdImpedanceChannel3: obciGanglionByteIdImpedanceChannel3,
  OBCIGanglionByteIdImpedanceChannel4: obciGanglionByteIdImpedanceChannel4,
  OBCIGanglionByteIdImpedanceChannelReference: obciGanglionByteIdImpedanceChannelReference,
  OBCIGanglionByteIdMultiPacket: obciGanglionByteIdMultiPacket,
  OBCIGanglionByteIdMultiPacketStop: obciGanglionByteIdMultiPacketStop,
  OBCIGanglionMCP3912Gain: obciGanglionMCP3912Gain,  // assumed gain setting for MCP3912.  NEEDS TO BE ADJUSTABLE JM
  OBCIGanglionMCP3912Vref: obciGanglionMCP3912Vref,  // reference voltage for ADC in MCP3912 set in hardware
  OBCIGanglionPacketSize: obciGanglionPacketSize,
  OBCIGanglionPacket18Bit: obciGanglionPacket18Bit,
  OBCIGanglionPacket19Bit: obciGanglionPacket19Bit,
  OBCIGanglionPrefix: obciGanglionPrefix,
  OBCIGanglionSamplesPerPacket: obciGanglionSamplesPerPacket,
  OBCIGanglionSyntheticDataEnable: obciGanglionSyntheticDataEnable,
  OBCIGanglionSyntheticDataDisable: obciGanglionSyntheticDataDisable,
  OBCIGanglionImpedanceStart: obciGanglionImpedanceStart,
  OBCIGanglionImpedanceStop: obciGanglionImpedanceStop,
  OBCIGanglionScaleFactorPerCountVolts: obciGanglionScaleFactorPerCountVolts,
  /** Simblee */
  SimbleeUuidService: simbleeUuidService,
  SimbleeUuidReceive: simbleeUuidReceive,
  SimbleeUuidSend: simbleeUuidSend,
  SimbleeUuidDisconnect: simbleeUuidDisconnect,
  /** RFduino BLE UUID */
  RFduinoUuidService: rfduinoUuidService,
  RFduinoUuidReceive: rfduinoUuidReceive,
  RFduinoUuidSend: rfduinoUuidSend,
  RFduinoUuidSendTwo: rfduinoUuidSendTwo,
  /** Cyton BLE */
  OBCICytonBLESamplesPerPacket: obciCytonBLESamplesPerPacket,
  /** Accel scale factor */
  OBCIGanglionAccelScaleFactor: obciGanglionAccelScaleFactor,
  /** Noble */
  OBCINobleEmitterPeripheralConnect: obciNobleEmitterPeripheralConnect,
  OBCINobleEmitterPeripheralDisconnect: obciNobleEmitterPeripheralDisconnect,
  OBCINobleEmitterPeripheralDiscover: obciNobleEmitterPeripheralDiscover,
  OBCINobleEmitterPeripheralServicesDiscover: obciNobleEmitterPeripheralServicesDiscover,
  OBCINobleEmitterServiceCharacteristicsDiscover: obciNobleEmitterServiceCharacteristicsDiscover,
  OBCINobleEmitterServiceRead: obciNobleEmitterServiceRead,
  OBCINobleEmitterDiscover: obciNobleEmitterDiscover,
  OBCINobleEmitterScanStart: obciNobleEmitterScanStart,
  OBCINobleEmitterScanStop: obciNobleEmitterScanStop,
  OBCINobleEmitterStateChange: obciNobleEmitterStateChange,
  OBCINobleStatePoweredOn: obciNobleStatePoweredOn,
  getPeripheralLocalNames,
  getPeripheralWithLocalName,
  getVersionNumber,
  isPeripheralGanglion,
  commandSampleRateForCmdCyton,
  commandSampleRateForCmdGanglion,
  commandBoardModeForMode,
  rawDataToSampleObjectDefault,
  /** Protocols */
  OBCIProtocolBLE: obciProtocolBLE,
  OBCIProtocolSerial: obciProtocolSerial,
  OBCIProtocolWifi: obciProtocolWifi,
  /** Register Query for Cyton */
  OBCIRegisterQueryAccelerometerFirmwareV1: obciRegisterQueryAccelerometerFirmwareV1,
  OBCIRegisterQueryAccelerometerFirmwareV3: obciRegisterQueryAccelerometerFirmwareV3,
  OBCIRegisterQueryCyton: obciRegisterQueryCyton,
  OBCIRegisterQueryCytonDaisy: obciRegisterQueryCytonDaisy,
  OBCIRegisterQueryNameMISC1: obciRegisterQueryNameMISC1,
  OBCIRegisterQueryNameBIASSENSP: obciRegisterQueryNameBIASSENSP,
  OBCIRegisterQueryNameCHnSET: obciRegisterQueryNameCHnSET,
  OBCIRegisterQuerySizeCytonFirmwareV1: obciRegisterQuerySizeCytonFirmwareV1,
  OBCIRegisterQuerySizeCytonDaisyFirmwareV1: obciRegisterQuerySizeCytonDaisyFirmwareV1,
  OBCIRegisterQuerySizeCytonFirmwareV3: obciRegisterQuerySizeCytonFirmwareV3,
  OBCIRegisterQuerySizeCytonDaisyFirmwareV3: obciRegisterQuerySizeCytonDaisyFirmwareV3
};

/**
* @description To add a usability abstraction layer above channel setting commands. Due to the
*          extensive and highly specific nature of the channel setting command chain, this
*          will take several different human readable inputs and merge to one array filled
*          with the correct commands, prime for sending directly to the write command.
* @param channelNumber - Number (1-16)
* @param powerDown - Bool (true -> OFF, false -> ON (default))
*          turns the channel on or off
* @param gain - Number (1,2,4,6,8,12,24(default))
*          sets the gain for the channel
* @param inputType - String (normal,shorted,biasMethod,mvdd,temp,testsig,biasDrp,biasDrn)
*          selects the ADC channel input source
* @param bias - Bool (true -> Include in bias (default), false -> remove from bias)
*          selects to include the channel input in bias generation
* @param srb2 - Bool (true -> Connect this input to SRB2 (default),
*                     false -> Disconnect this input from SRB2)
*          Select to connect (true) this channel's P input to the SRB2 pin. This closes
*              a switch between P input and SRB2 for the given channel, and allows the
*              P input to also remain connected to the ADC.
* @param srb1 - Bool (true -> connect all N inputs to SRB1,
*                     false -> Disconnect all N inputs from SRB1 (default))
*          Select to connect (true) all channels' N inputs to SRB1. This effects all pins,
*              and disconnects all N inputs from the ADC.
* @returns {Promise} resolves {commandArray: array of commands to be sent,
                               newChannelSettingsObject: an updated channel settings object
                                                         to be stored in openBCIBoard.channelSettingsArray},
                     rejects on bad input or no board
*/
function channelSetter (channelNumber, powerDown, gain, inputType, bias, srb2, srb1) {
  // Used to store and assemble the commands
  var cmdPowerDown,
    cmdBias,
    cmdSrb2,
    cmdSrb1;

  return new Promise(function (resolve, reject) {
    // Validate the input
    if (!isNumber(channelNumber)) reject(Error("channelNumber must be of type 'number' "));
    if (!isBoolean(powerDown)) reject(Error("powerDown must be of type 'boolean' "));
    if (!isNumber(gain)) reject(Error("gain must be of type 'number' "));
    if (!isString(inputType)) reject(Error("inputType must be of type 'string' "));
    if (!isBoolean(bias)) reject(Error("bias must be of type 'boolean' "));
    if (!isBoolean(srb2)) reject(Error("srb1 must be of type 'boolean' "));
    if (!isBoolean(srb1)) reject(Error("srb2 must be of type 'boolean' "));

    // Set Channel Number
    var p1 = commandChannelForCmd(channelNumber)
      .catch(err => reject(err));

    // Set POWER_DOWN
    cmdPowerDown = powerDown ? obciChannelCmdPowerOff : obciChannelCmdPowerOn;

    // Set Gain
    var p2 = commandForGain(gain)
      .catch(err => reject(err));

    // Set ADC string
    var p3 = commandForADCString(inputType)
      .catch(err => reject(err));

    // Set BIAS
    cmdBias = bias ? obciChannelCmdBiasInclude : obciChannelCmdBiasRemove;

    // Set SRB2
    cmdSrb2 = srb2 ? obciChannelCmdSRB2Connect : obciChannelCmdSRB2Diconnect;

    // Set SRB1
    cmdSrb1 = srb1 ? obciChannelCmdSRB1Connect : obciChannelCmdSRB1Diconnect;

    var newChannelSettingsObject = {
      channelNumber: channelNumber,
      powerDown: powerDown,
      gain: gain,
      inputType: inputType,
      bias: bias,
      srb2: srb2,
      srb1: srb1
    };

    Promise.all([p1, p2, p3]).then(function (values) {
      var outputArray = [
        obciChannelCmdSet,
        values[0],
        cmdPowerDown,
        values[1],
        values[2],
        cmdBias,
        cmdSrb2,
        cmdSrb1,
        obciChannelCmdLatch
      ];
      resolve({commandArray: outputArray, newChannelSettingsObject: newChannelSettingsObject});
    });
  });
}

/**
* @description To build the array of commands to send to the board to measure impedance
* @param channelNumber
* @param pInputApplied - Bool (true -> Test Signal Applied, false -> Test Signal Not Applied (default))
*          applies the test signal to the P input
* @param nInputApplied - Bool (true -> Test Signal Applied, false -> Test Signal Not Applied (default))
*          applies the test signal to the N input
* @returns {Promise} - fulfilled will contain an array of comamnds
*/
function impedanceSetter (channelNumber, pInputApplied, nInputApplied) {
  var cmdNInputApplied,
    cmdPInputApplied;
  return new Promise((resolve, reject) => {
    // validate inputs
    if (!isNumber(channelNumber)) reject(Error("channelNumber must be of type 'number' "));
    if (!isBoolean(pInputApplied)) reject(Error("pInputApplied must be of type 'boolean' "));
    if (!isBoolean(nInputApplied)) reject(Error("nInputApplied must be of type 'boolean' "));

    // Set pInputApplied
    cmdPInputApplied = pInputApplied ? obciChannelImpedanceTestSignalApplied : obciChannelImpedanceTestSignalAppliedNot;

    // Set nInputApplied
    cmdNInputApplied = nInputApplied ? obciChannelImpedanceTestSignalApplied : obciChannelImpedanceTestSignalAppliedNot;

    // Set Channel Number
    commandChannelForCmd(channelNumber).then(command => {
      var outputArray = [
        obciChannelImpedanceSet,
        command,
        cmdPInputApplied,
        cmdNInputApplied,
        obciChannelImpedanceLatch
      ];
      // console.log(outputArray)
      resolve(outputArray);
    }).catch(err => reject(err));
  });
}

/**
 * @description To build the array of commands to send to the board to set the sample rate
 * @param boardType {String} - The type of board, either cyton or ganglion. Default is Cyton
 * @param sampleRate {Number} - The sample rate you want to set to. Please see docs for possible sample rates.
 * @returns {Promise} - fulfilled will contain an array of commands
 */
function sampleRateSetter (boardType, sampleRate) {
  return new Promise((resolve, reject) => {
    // validate inputs
    if (!isString(boardType)) return reject(Error("board type must be of type 'string' "));

    if (!isNumber(sampleRate)) return reject(Error("sampleRate must be of type 'number' "));

    sampleRate = Math.floor(sampleRate);

    let func;
    if (boardType === obciBoardCyton || boardType === obciBoardDaisy) {
      func = commandSampleRateForCmdCyton;
    } else if (boardType === obciBoardGanglion) {
      func = commandSampleRateForCmdGanglion;
    } else {
      return reject(Error(`boardType must be either ${obciBoardCyton} or ${obciBoardGanglion}`));
    }

    // Set Channel Number
    func(sampleRate).then(command => {
      var outputArray = [
        obciSampleRateSet,
        command
      ];
      // console.log(outputArray)
      resolve(outputArray);
    }).catch(err => reject(err));
  });
}

/**
 * @description To build the array of commands to send to the board t
 * @param boardMode {String} - The type of board mode:
 *  `default`: Board will use Accel
 *  `
 * @returns {Promise} - fulfilled will contain an array of commands
 */
function boardModeSetter (boardMode) {
  return new Promise((resolve, reject) => {
    // validate inputs
    if (!isString(boardMode)) return reject(Error("board mode must be of type 'string' "));
    // Set Channel Number
    commandBoardModeForMode(boardMode).then(command => {
      var outputArray = [
        obciBoardModeSet,
        command
      ];
      // console.log(outputArray)
      resolve(outputArray);
    }).catch(err => reject(err));
  });
}

function isNumber (input) {
  return (typeof input === 'number');
}
function isBoolean (input) {
  return (typeof input === 'boolean');
}
function isString (input) {
  return (typeof input === 'string');
}
function isUndefined (input) {
  return (typeof input === 'undefined');
}
function isNull (input) {
  return input === null;
}

function commandForADCString (adcString) {
  return new Promise(function (resolve, reject) {
    switch (adcString) {
      case obciStringADCNormal:
        resolve(obciChannelCmdADCNormal);
        break;
      case obciStringADCShorted:
        resolve(obciChannelCmdADCShorted);
        break;
      case obciStringADCBiasMethod:
        resolve(obciChannelCmdADCBiasMethod);
        break;
      case obciStringADCMvdd:
        resolve(obciChannelCmdADCMVDD);
        break;
      case obciStringADCTemp:
        resolve(obciChannelCmdADCTemp);
        break;
      case obciStringADCTestSig:
        resolve(obciChannelCmdADCTestSig);
        break;
      case obciStringADCBiasDrp:
        resolve(obciChannelCmdADCBiasDRP);
        break;
      case obciStringADCBiasDrn:
        resolve(obciChannelCmdADCBiasDRN);
        break;
      default:
        reject(Error('Invalid ADC string'));
        break;
    }
  });
}

/**
 * Returns the input type for the given command
 * @param cmd {Number} The command
 * @returns {String}
 */
function inputTypeForCommand (cmd) {
  switch (String(cmd)) {
    case obciChannelCmdADCNormal:
      return obciStringADCNormal;
    case obciChannelCmdADCShorted:
      return obciStringADCShorted;
    case obciChannelCmdADCBiasMethod:
      return obciStringADCBiasMethod;
    case obciChannelCmdADCMVDD:
      return obciStringADCMvdd;
    case obciChannelCmdADCTemp:
      return obciStringADCTemp;
    case obciChannelCmdADCTestSig:
      return obciStringADCTestSig;
    case obciChannelCmdADCBiasDRP:
      return obciStringADCBiasDrp;
    case obciChannelCmdADCBiasDRN:
      return obciStringADCBiasDrn;
    default:
      throw new Error('Invalid input type, must be less than 8');
  }
}

function commandForGain (gainSetting) {
  return new Promise(function (resolve, reject) {
    switch (gainSetting) {
      case 1:
        resolve(obciChannelCmdGain1);
        break;
      case 2:
        resolve(obciChannelCmdGain2);
        break;
      case 4:
        resolve(obciChannelCmdGain4);
        break;
      case 6:
        resolve(obciChannelCmdGain6);
        break;
      case 8:
        resolve(obciChannelCmdGain8);
        break;
      case 12:
        resolve(obciChannelCmdGain12);
        break;
      case 24:
        resolve(obciChannelCmdGain24);
        break;
      default:
        reject(Error('Invalid gain setting of ' + gainSetting + ' gain must be (1,2,4,6,8,12,24)'));
        break;
    }
  });
}

/**
 * Get the gain
 * @param cmd {Number}
 * @returns {Number}
 */
function gainForCommand (cmd) {
  switch (String(cmd)) {
    case obciChannelCmdGain1:
      return 1;
    case obciChannelCmdGain2:
      return 2;
    case obciChannelCmdGain4:
      return 4;
    case obciChannelCmdGain6:
      return 6;
    case obciChannelCmdGain8:
      return 8;
    case obciChannelCmdGain12:
      return 12;
    case obciChannelCmdGain24:
      return 24;
    default:
      throw new Error(`Invalid gain setting of ${cmd} gain must be (0,1,2,3,4,5,6)`);
  }
}

function commandChannelForCmd (channelNumber) {
  return new Promise(function (resolve, reject) {
    switch (channelNumber) {
      case 1:
        resolve(obciChannelCmdChannel1);
        break;
      case 2:
        resolve(obciChannelCmdChannel2);
        break;
      case 3:
        resolve(obciChannelCmdChannel3);
        break;
      case 4:
        resolve(obciChannelCmdChannel4);
        break;
      case 5:
        resolve(obciChannelCmdChannel5);
        break;
      case 6:
        resolve(obciChannelCmdChannel6);
        break;
      case 7:
        resolve(obciChannelCmdChannel7);
        break;
      case 8:
        resolve(obciChannelCmdChannel8);
        break;
      case 9:
        resolve(obciChannelCmdChannel9);
        break;
      case 10:
        resolve(obciChannelCmdChannel10);
        break;
      case 11:
        resolve(obciChannelCmdChannel11);
        break;
      case 12:
        resolve(obciChannelCmdChannel12);
        break;
      case 13:
        resolve(obciChannelCmdChannel13);
        break;
      case 14:
        resolve(obciChannelCmdChannel14);
        break;
      case 15:
        resolve(obciChannelCmdChannel15);
        break;
      case 16:
        resolve(obciChannelCmdChannel16);
        break;
      default:
        reject(Error('Invalid channel number'));
        break;
    }
  });
}

/**
 * @typedef {Object} ChannelSettingsObject - See page 50 of the ads1299.pdf
 * @property {Number} channelNumber - The channel number of this object
 * @property {Boolean} powerDown - Power-down: - This boolean determines the channel power mode for the
 *                      corresponding channel. `false` for normal operation, channel is on, and `true` for channel
 *                      power-down, channel is off. (Default is `false`)
 * @property {Number} gain - PGA gain: This number determines the PGA gain setting. Can be either 1, 2, 4, 6, 8, 12, 24
 *                      (Default is 24)
 * @property {String} inputType - Channel input: This string is used to determine the channel input selection.
 *                      Can be:
 *                        'normal' - Normal electrode input (Default)
 *                        'shorted' - Input shorted (for offset or noise measurements)
 *                        'biasMethod' - Used in conjunction with BIAS_MEAS bit for BIAS measurements.
 *                        'mvdd' - MVDD for supply measurement
 *                        'temp' - Temperature sensor
 *                        'testsig' - Test signal
 *                        'biasDrp' - BIAS_DRP (positive electrode is the driver)
 *                        'biasDrn' - BIAS_DRN (negative electrode is the driver)
 * @property {Boolean} bias - BIAS: Is the channel included in the bias? If `true` or yes, this channel has both P
 *                      and N channels connected to the bias. (Default is `true`)
 * @property {Boolean} srb2 - SRB2 connection: This boolean determines the SRB2 connection for the corresponding
 *                      channel. `false` for open, not connected to channel, and `true` for closed, connected to the
 *                      channel. (Default is `true`)
 * @property {Boolean} srb1 - Stimulus, reference, and bias 1: This boolean connects the SRB2 to all 4, 6, or 8
 *                      channels inverting inputs. `false` when switches open, disconnected, and `true` when switches
 *                      closed, or connected. (Default is `false`)
 */

/**
 * Get an object of default board settings.
 * @param channelNumber
 * @returns {ChannelSettingsObject}
 */
function channelSettingsObjectDefault (channelNumber) {
  return {
    channelNumber: channelNumber,
    powerDown: false,
    gain: 24,
    inputType: obciStringADCNormal,
    bias: true,
    srb2: true,
    srb1: false
  };
}

/**
 * @description RawDataToSample default object creation
 * @param numChannels {Number} - The number of channels
 * @returns {RawDataToSample} - A new object
 */
function rawDataToSampleObjectDefault (numChannels) {
  if (numChannels === undefined) numChannels = obciNumberOfChannelsDefault;
  return {
    accelArray: [0, 0, 0],
    channelSettings: constantsModule.channelSettingsArrayInit(numChannels),
    decompressedSamples: decompressedSamplesInit(numChannels),
    lastSampleNumber: 0,
    rawDataPacket: Buffer.alloc(33),
    rawDataPackets: [],
    scale: true,
    sendCounts: false,
    timeOffset: 0,
    verbose: false
  };
}

function decompressedSamplesInit (numChannels) {
  let output = [];
  for (let i = 0; i < 3; i++) {
    output.push(new Array(numChannels));
  }
  return output;
}

/**
 * Get's the command for sample rate Cyton
 * @param sampleRate {Number} - The desired sample rate
 * @return {Promise}
 */
function commandSampleRateForCmdCyton (sampleRate) {
  return new Promise(function (resolve, reject) {
    switch (sampleRate) {
      case obciSampleRate16000:
        resolve(obciSampleRateCmdCyton16000);
        break;
      case obciSampleRate8000:
        resolve(obciSampleRateCmdCyton8000);
        break;
      case obciSampleRate4000:
        resolve(obciSampleRateCmdCyton4000);
        break;
      case obciSampleRate2000:
        resolve(obciSampleRateCmdCyton2000);
        break;
      case obciSampleRate1000:
        resolve(obciSampleRateCmdCyton1000);
        break;
      case obciSampleRate500:
        resolve(obciSampleRateCmdCyton500);
        break;
      case obciSampleRate250:
        resolve(obciSampleRateCmdCyton250);
        break;
      default:
        reject(Error('Invalid sample rate'));
        break;
    }
  });
}

/**
 * Get's the command for sample rate Cyton
 * @param sampleRate {Number} - The desired sample rate
 * @return {Promise}
 */
function commandSampleRateForCmdGanglion (sampleRate) {
  return new Promise(function (resolve, reject) {
    switch (sampleRate) {
      case obciSampleRate25600:
        resolve(obciSampleRateCmdGang25600);
        break;
      case obciSampleRate12800:
        resolve(obciSampleRateCmdGang12800);
        break;
      case obciSampleRate6400:
        resolve(obciSampleRateCmdGang6400);
        break;
      case obciSampleRate3200:
        resolve(obciSampleRateCmdGang3200);
        break;
      case obciSampleRate1600:
        resolve(obciSampleRateCmdGang1600);
        break;
      case obciSampleRate800:
        resolve(obciSampleRateCmdGang800);
        break;
      case obciSampleRate400:
        resolve(obciSampleRateCmdGang400);
        break;
      case obciSampleRate200:
        resolve(obciSampleRateCmdGang200);
        break;
      default:
        reject(Error('Invalid sample rate'));
        break;
    }
  });
}

/**
 * Get's the command for sample rate Cyton
 * @param boardMode {String} - The desired sample rate
 * @return {Promise}
 */
function commandBoardModeForMode (boardMode) {
  return new Promise(function (resolve, reject) {
    switch (boardMode) {
      case obciBoardModeDefault:
        resolve(obciBoardModeCmdDefault);
        break;
      case obciBoardModeDebug:
        resolve(obciBoardModeCmdDebug);
        break;
      case obciBoardModeAnalog:
        resolve(obciBoardModeCmdAnalog);
        break;
      case obciBoardModeDigital:
        resolve(obciBoardModeCmdDigital);
        break;
      default:
        reject(Error('Invalid sample rate'));
        break;
    }
  });
}

/**
 * @description Get a list of local names from an array of peripherals
 */
function getPeripheralLocalNames (pArray) {
  return new Promise((resolve, reject) => {
    var list = [];
    pArray.forEach(perif => {
      list.push(perif.advertisement.localName);
    });
    if (list.length > 0) {
      return resolve(list);
    } else {
      return reject(Error(`No peripherals discovered with prefix equal to ${obciGanglionPrefix}`));
    }
  });
}

/**
 * @description Get a peripheral with a local name
 * @param `pArray` {Array} - Array of peripherals
 * @param `localName` {String} - The local name of the BLE device.
 */
function getPeripheralWithLocalName (pArray, localName) {
  return new Promise((resolve, reject) => {
    if (typeof (pArray) !== 'object') return reject(Error(`pArray must be of type Object`));
    pArray.forEach(perif => {
      if (perif.advertisement.hasOwnProperty('localName')) {
        if (perif.advertisement.localName === localName) {
          return resolve(perif);
        }
      }
    });
    return reject(Error(`No peripheral found with localName: ${localName}`));
  });
}

/**
 * @description This function is used to extract the major version from a github
 *  version string.
 * @returns {Number} The major version number
 */
function getVersionNumber (versionStr) {
  return Number(versionStr[1]);
}

/**
 * @description Very safely checks to see if the noble peripheral is a
 *  ganglion by way of checking the local name property.
 */
function isPeripheralGanglion (peripheral) {
  if (peripheral) {
    if (peripheral.hasOwnProperty('advertisement')) {
      if (peripheral.advertisement !== null && peripheral.advertisement.hasOwnProperty('localName')) {
        if (peripheral.advertisement.localName !== undefined && peripheral.advertisement.localName !== null) {
          if (peripheral.advertisement.localName.indexOf(obciGanglionPrefix) > -1) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export default constantsModule;
