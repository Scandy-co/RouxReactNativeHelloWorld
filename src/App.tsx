import React from 'react'
import {
  StyleSheet,
  View,
  Switch,
  TouchableOpacity,
  Alert,
  Text,
} from 'react-native'
import Slider from '@react-native-community/slider'
import SegmentedControl from '@react-native-community/segmented-control'

import Roux, { RouxView } from 'react-native-roux-sdk'
import RNFS from 'react-native-fs'

export default class App extends React.Component {
  constructor(props: Readonly<{}>) {
    super(props)
    this.state = {
      selectedDeviceType: 0,
      IPAddress: '',
      scanState: '',
      v2ScanningMode: null, //v2ScanningMode defaults to true
      scanSize: 1.0, // scan size in mm or meters pending on scanning mode
    }
  }

  handleScanStateChanged = (scanState) => {
    console.log('Scan State: ', scanState)
    this.setState({ scanState })
  }

  setupPreview = async (deviceType) => {
    var scannerType
    switch (deviceType) {
      case 'MIRROR':
        await Roux.setSendRenderedStream(false)
        await Roux.setReceiveNetworkCommands(false)
        await Roux.setReceiveRenderedStream(true)
        await Roux.setSendNetworkCommands(true)
        scannerType = 'network'

        var IPAddress = await Roux.getIPAddress()
        this.setState({ IPAddress })

        break
      case 'SCANNER':
        Roux.setSendRenderedStream(true)
        Roux.setReceiveNetworkCommands(true)
        Roux.setReceiveRenderedStream(false)
        Roux.setSendNetworkCommands(false)
        scannerType = 'true_depth'
        break
      default:
        break
    }

    try {
      await Roux.initializeScanner(scannerType)
      // await Roux.startPreview()
    } catch (err) {
      console.warn(err)
    }
  }

  startScan = async () => {
    try {
      await Roux.startScan()
    } catch (err) {
      console.warn(err)
    }
  }

  stopScan = async () => {
    try {
      await Roux.stopScan()
    } catch (err) {
      console.warn(err)
    }
  }

  onPreviewStart = () => {
    console.log('Preview Started')
  }

  onScannerStart = () => {
    console.log('Scanner Started')
  }

  onScannerStop = async () => {
    try {
      await Roux.generateMesh()
    } catch (err) {
      console.warn(err)
    }
  }

  onGenerateMesh = () => {
    // call back that generate mesh finished
    console.log('MESH GENERATED')
  }

  onSaveMesh = async () => {
    // call back that generate mesh finished
    console.log('MESH SAVED')
    this.restartScanner()
  }

  restartScanner = async () => {
    //NOTE: you do not need to call initializeScanner again;
    // scanner will remain initialized until RouxView unmounts
    await Roux.startPreview()
  }

  saveScan = async () => {
    try {
      const dirPath = `${RNFS.DocumentDirectoryPath}/${Date.now()}`
      await RNFS.mkdir(dirPath)
      console.log('made dir', dirPath)
      const filePath = `${dirPath}/scan.ply`
      await Roux.saveScan(filePath)
      Alert.alert('Saved scan', `Saved to: ${filePath}`)
    } catch (err) {
      console.warn(err)
    }
  }

  toggleV2Scanning = async () => {
    try {
      const v2ScanningMode = await Roux.getV2ScanningEnabled()
      await Roux.toggleV2Scanning(!v2ScanningMode)
      this.setState({ v2ScanningMode: !v2ScanningMode })
      this.setSize(this.state.scanSize)
    } catch (err) {
      console.warn(err)
    }
  }

  setSize = async (val: number) => {
    try {
      const size = this.state.v2ScanningMode ? val * 1e-3 : val
      await Roux.setSize(size)
      // Round the number to the tenth precision
      this.setState({ scanSize: Math.floor(val * 10) / 10 })
    } catch (err) {
      console.warn(err)
    }
  }

  async componentDidMount() {
    //Get default scanning mode and set state
    const v2ScanningMode = await Roux.getV2ScanningEnabled()
    this.setState({ v2ScanningMode })
  }

  handleDeviceTypeToggled = (e) => {
    let deviceType = e.nativeEvent.selectedSegmentIndex
    this.setState({ selectedDeviceType: deviceType })
    // Roux.uninitializeScanner();
  }

  render() {
    const { scanState } = this.state
    const deviceType =
      this.state.selectedDeviceType === 0 ? 'MIRROR' : 'SCANNER'
    return (
      <View style={styles.container}>
        <RouxView
          style={styles.roux}
          onScanStateChanged={this.handleScanStateChanged}
          onVisualizerReady={() => this.setupPreview(deviceType)}
          onPreviewStart={this.onPreviewStart}
          onScannerStart={this.onScannerStart}
          onScannerStop={this.onScannerStop}
          onGenerateMesh={this.onGenerateMesh}
          onSaveMesh={this.onSaveMesh}
        />
        <SegmentedControl
          style={styles.deviceToggle}
          values={['Mirror Device', 'Scanning Device']}
          selectedIndex={this.state.selectedDeviceType}
          onChange={(e) => this.handleDeviceTypeToggled(e)}
          backgroundColor={'#000'}
        />

        {/* MIRROR DEVICE SET UP */}
        {deviceType === 'MIRROR' && (
          <>
            <Text style={styles.ipAddressLabel}>
              IP Address: {this.state.IPAddress}
            </Text>
            {(scanState === 'INITIALIZED' || scanState === 'PREVIEWING') && (
              <>
                <TouchableOpacity
                  onPress={this.startScan}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>START</Text>
                </TouchableOpacity>
                <View style={styles.sliderContainer}>
                  <Slider
                    minimumValue={0.2}
                    maximumValue={4}
                    onValueChange={this.setSize}
                    style={styles.slider}
                  />
                  <Text style={styles.previewLabel}>
                    size: {this.state.scanSize}
                    {this.state.v2ScanningMode ? 'mm' : 'm'}
                  </Text>
                </View>
                <View style={styles.v2SwitchContainer}>
                  <Switch
                    onValueChange={this.toggleV2Scanning}
                    value={this.state.v2ScanningMode}
                  />
                  <Text style={styles.previewLabel}>v2 scanning</Text>
                </View>
              </>
            )}
            {scanState === 'SCANNING' && (
              <TouchableOpacity onPress={this.stopScan} style={styles.button}>
                <Text style={styles.buttonText}>STOP</Text>
              </TouchableOpacity>
            )}
            {scanState === 'VIEWING' && (
              <>
                {/* <TouchableOpacity onPress={this.saveScan} style={styles.button}>
                  <Text style={styles.buttonText}>SAVE</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  onPress={this.restartScanner}
                  style={styles.newScanButton}
                >
                  <Text style={styles.buttonText}>NEW SCAN</Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
        {/* SCANNER DEVICE SET UP */}
        {deviceType === 'SCANNER' && (
          <>
            {(scanState === 'INITIALIZED' || scanState === 'PREVIEWING') && (
              <></>
            )}
            {scanState === 'SCANNING' && <></>}
            {scanState === 'VIEWING' && <></>}
          </>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  roux: { flex: 1, backgroundColor: 'blue' },
  ipAddressLabel: {
    position: 'absolute',
    top: 50,
    backgroundColor: '#3053FF',
    color: '#fff',
    padding: 5,
    fontSize: 18,
    width: '100%',
  },
  deviceToggle: {
    position: 'absolute',
    alignSelf: 'center',
    height: 50,
    width: 300,
    top: 90,
  },
  button: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 150,
    width: 150,
    height: 70,
    backgroundColor: '#f2494a',
  },
  newScanButton: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 70,
    width: 150,
    height: 70,
    backgroundColor: '#586168',
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 70,
    width: '80%',
    alignSelf: 'center',
  },
  previewLabel: {
    color: 'white',
    alignSelf: 'center',
    fontSize: 20,
  },
  v2SwitchContainer: {
    position: 'absolute',
    alignItems: 'center',
    top: 150,
    right: 10,
  },
})
