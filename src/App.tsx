import React from 'react'
import {
  StyleSheet,
  View,
  Switch,
  TouchableOpacity,
  Alert,
  Text,
  Button,
} from 'react-native'
import Slider from '@react-native-community/slider'
import Drawer from 'react-native-drawer'

import Roux, { RouxView } from 'react-native-roux-sdk'
import RNFS from 'react-native-fs'

export default class App extends React.Component {
  constructor(props: Readonly<{}>) {
    super(props)
    this.state = {
      scanDir: '',
      scanState: '',
      v2ScanningMode: null, //v2ScanningMode defaults to true
      scanSize: 1.0, // scan size in mm or meters pending on scanning mode
    }
  }

  handleScanStateChanged = (scanState) => {
    console.log('Scan State: ', scanState)
    this.setState({ scanState })
  }

  initializeScanner = async () => {
    try {
      await Roux.initializeScanner('true_depth')
    } catch (err) {
      console.warn(err)
    }
  }

  onScannerReady = async () => {
    try {
      await Roux.startPreview()
    } catch (e) {
      console.warn(e)
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
      const filePath = `${this.state.scanDir}/${Date.now()}.ply`
      await Roux.saveScan(filePath)
      Alert.alert('Saved scan', `Saved to: ${filePath}`)
    } catch (err) {
      console.warn(err)
    }
  }

  onLoadMesh = () => {}

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
    const scanDir = `${RNFS.DocumentDirectoryPath}/meshes`
    await RNFS.mkdir(scanDir)
    const v2ScanningMode = await Roux.getV2ScanningEnabled()
    this.setState({ v2ScanningMode, scanDir })
  }

  render() {
    const { scanState } = this.state
    return (
      <View style={styles.container}>
        <Drawer ref={(ref) => (this._drawer = ref)} content={<Text>Hi</Text>}>
          <RouxView
            style={styles.roux}
            onScanStateChanged={this.handleScanStateChanged}
            onVisualizerReady={this.initializeScanner}
            onScannerReady={this.onScannerReady}
            onPreviewStart={this.onPreviewStart}
            onScannerStart={this.onScannerStart}
            onScannerStop={this.onScannerStop}
            onGenerateMesh={this.onGenerateMesh}
            onSaveMesh={this.onSaveMesh}
            onLoadMesh={this.onLoadMesh}
          />
          <TouchableOpacity
            style={{
              ...styles.button,
              backgroundColor: '#586168',
              bottom: 150,
              height: 50,
            }}
            onPress={() => {
              this._drawer.open()
            }}
          >
            <Text style={styles.buttonText}>View Meshes</Text>
          </TouchableOpacity>
          {(scanState === 'INITIALIZED' || scanState === 'PREVIEWING') && (
            <>
              <TouchableOpacity onPress={this.startScan} style={styles.button}>
                <Text style={styles.buttonText}>Start Scanning</Text>
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
              <TouchableOpacity onPress={this.saveScan} style={styles.button}>
                <Text style={styles.buttonText}>SAVE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.restartScanner}
                style={styles.newScanButton}
              >
                <Text style={styles.buttonText}>NEW SCAN</Text>
              </TouchableOpacity>
            </>
          )}
        </Drawer>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 200,
    paddingHorizontal: 10,
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
  // actions: { backgroundColor: "transparent" },
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
    top: 100,
    right: 10,
  },
  roux: { flex: 1, backgroundColor: 'blue' },
})
