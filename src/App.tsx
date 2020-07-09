import React from "react";
import {
  StyleSheet,
  View,
  Slider,
  Switch,
  Button,
  Alert,
  Text,
} from "react-native";
import Roux, { RouxView } from "react-native-roux-sdk";
import RNFS from "react-native-fs";

export default class App extends React.Component {
  state = {
    v2ScanningMode: null, //v2ScanningMode defaults to true
    scanSize: 1.0, // scan size in mm or meters pending on scanning mode
  };
  constructor(props: Readonly<{}>) {
    super(props);
  }

  setupPreview = async () => {
    try {
      await Roux.initializeScanner();
      await Roux.startPreview();
    } catch (err) {
      console.warn(err);
    }
  };

  async onScannerStop() {
    try {
      await Roux.generateMesh();
    } catch (err) {
      console.warn(err);
    }
  }

  async onGenerateMesh() {
    // call back that generate mesh finished
    console.log("MESH GENERATED");
  }

  async onSaveMesh() {
    // call back that generate mesh finished
    console.log("MESH SAVED");
    await Roux.startPreview();
  }

  async saveScan() {
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
  }

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
    return (
      <View style={styles.container}>
        <RouxView
          style={styles.roux}
          onVisualizerReady={this.setupPreview}
          // onPreviewStart={this.onPreviewStart}
          // onScannerStart={this.onScannerStart}
          onScannerStop={this.onScannerStop}
          onGenerateMesh={this.onGenerateMesh}
          onSaveMesh={this.onSaveMesh}
        />
        <View style={styles.actions}>
          <View style={styles.row}>
            <View style={styles.column}>
              {this.state.v2ScanningMode ? (
                <Text>size: {this.state.scanSize}mm</Text>
              ) : (
                <Text>size: {this.state.scanSize}m</Text>
              )}

              <Slider
                minimumValue={0.2}
                maximumValue={4}
                style={styles.slider}
                onValueChange={this.setSize}
              />
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.column}>
              <Switch
                onValueChange={this.toggleV2Scanning}
                value={this.state.v2ScanningMode}
              />
              <Text>v2 scanning</Text>
            </View>
            <View style={styles.column}>
              <Switch />
            </View>
            <View style={styles.column}>
              <Switch />
            </View>
          </View>
          <View style={styles.row}>
            <Button
              title="start scan"
              onPress={() => {
                Roux.startScan();
              }}
            />
            <Button
              title="stop scan"
              onPress={() => {
                Roux.stopScan();
              }}
            />
            <Button
              title="save scan"
              onPress={() => {
                this.saveScan();
              }}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  roux: { flex: 1, backgroundColor: "blue" },
  actions: { flex: 1, backgroundColor: "white", padding: 16 },
  slider: { flex: 1 },
  row: { flex: 1, flexDirection: "row", justifyContent: "space-between" },
  column: { flex: 1, flexDirection: "column", justifyContent: "space-between" },
});
