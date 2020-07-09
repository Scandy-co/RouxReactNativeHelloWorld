import React from "react";
import {
  StyleSheet,
  View,
  Switch,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import Slider from "@react-native-community/slider";

import Roux, { RouxView } from "react-native-roux-sdk";
import RNFS from "react-native-fs";

export default class App extends React.Component {
  state = {
    scanState: "",
    v2ScanningMode: null, //v2ScanningMode defaults to true
    scanSize: 1.0, // scan size in mm or meters pending on scanning mode
  };
  constructor(props: Readonly<{}>) {
    super(props);
  }

  handleScanStateChanged = (scanState) => {
    console.log("Scan State: ", scanState);
    this.setState({ scanState });
  };

  setupPreview = async () => {
    try {
      await Roux.initializeScanner();
      await Roux.startPreview();
    } catch (err) {
      console.warn(err);
    }
  };

  startScan = async () => {
    try {
      await Roux.startScan();
    } catch (err) {
      console.warn(err);
    }
  };

  stopScan = async () => {
    try {
      await Roux.stopScan();
    } catch (err) {
      console.warn(err);
    }
  };

  onPreviewStart = () => {
    console.log("Preview Started");
  };

  onScannerStart = () => {
    console.log("Scanner Started");
  };

  onScannerStop = async () => {
    try {
      await Roux.generateMesh();
    } catch (err) {
      console.warn(err);
    }
  };

  onGenerateMesh = () => {
    // call back that generate mesh finished
    console.log("MESH GENERATED");
  };

  onSaveMesh = async () => {
    // call back that generate mesh finished
    console.log("MESH SAVED");
    await Roux.startPreview();
  };

  saveScan = async () => {
    try {
      const dirPath = `${RNFS.DocumentDirectoryPath}/${Date.now()}`;
      await RNFS.mkdir(dirPath);
      console.log("made dir", dirPath);
      const filePath = `${dirPath}/scan.ply`;
      await Roux.saveScan(filePath);
      Alert.alert("Saved scan", `Saved to: ${filePath}`);
    } catch (err) {
      console.warn(err);
    }
  };

  toggleV2Scanning = async () => {
    try {
      const v2ScanningMode = await Roux.getV2ScanningEnabled();
      await Roux.toggleV2Scanning(!v2ScanningMode);
      this.setState({ v2ScanningMode: !v2ScanningMode });
      this.setSize(this.state.scanSize);
    } catch (err) {
      console.warn(err);
    }
  };

  setSize = async (val: number) => {
    try {
      const size = this.state.v2ScanningMode ? val * 1e-3 : val;
      await Roux.setSize(size);
      // Round the number to the tenth precision
      this.setState({ scanSize: Math.floor(val * 10) / 10 });
    } catch (err) {
      console.warn(err);
    }
  };

  async componentDidMount() {
    //Get default scanning mode and set state
    const v2ScanningMode = await Roux.getV2ScanningEnabled();
    this.setState({ v2ScanningMode });
  }

  render() {
    const { scanState } = this.state;
    return (
      <View style={styles.container}>
        <RouxView
          style={styles.roux}
          onScanStateChanged={this.handleScanStateChanged}
          onVisualizerReady={this.setupPreview}
          onPreviewStart={this.onPreviewStart}
          onScannerStart={this.onScannerStart}
          onScannerStop={this.onScannerStop}
          onGenerateMesh={this.onGenerateMesh}
          onSaveMesh={this.onSaveMesh}
        />
        {scanState === "INITIALIZED" ||
          (scanState === "PREVIEWING" && (
            <TouchableOpacity
              title="start scan"
              onPress={this.startScan}
              style={styles.button}
            >
              <Text style={styles.buttonText}>START</Text>
            </TouchableOpacity>
          ))}
        {scanState === "SCANNING" && (
          <TouchableOpacity
            title="stop scan"
            onPress={this.stopScan}
            style={styles.button}
          >
            <Text style={styles.buttonText}>STOP</Text>
          </TouchableOpacity>
        )}
        {scanState === "VIEWING" && (
          <TouchableOpacity
            title="save scan"
            onPress={this.saveScan}
            style={styles.button}
          >
            <Text style={styles.buttonText}>SAVE</Text>
          </TouchableOpacity>
        )}
        <Slider
          minimumValue={0.2}
          maximumValue={4}
          onValueChange={this.setSize}
          style={styles.slider}
        />
        {this.state.v2ScanningMode ? (
          <Text>size: {this.state.scanSize}mm</Text>
        ) : (
          <Text>size: {this.state.scanSize}m</Text>
        )}

        <Switch
          onValueChange={this.toggleV2Scanning}
          value={this.state.v2ScanningMode}
        />
        <Text>v2 scanning</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    position: "absolute",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    bottom: 200,
    width: 150,
    height: 70,
    backgroundColor: "#f2494a",
  },
  buttonText: {
    fontSize: 24,
    color: "white",
  },
  // actions: { backgroundColor: "transparent" },
  // slider: { position: "absolute", backgroundColor: "transparent", bottom: 200 },
  roux: { flex: 1, backgroundColor: "blue" },
});
