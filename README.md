# Networking via SDK

This feature allows two devices to be connected. One device captures the scan while the other device renders the preview.

## Terminology

**Scanning Device**: The device which does the scanning.
- runs SLAM & reconstruction pipeline
- sends the scan preview screen
- receives scan commands

**Mirror Device**: The device which renders scan preview and controls the scan process.
- receives scan view
- sends scan commands (start, stop, set scan size, etc.)

## Setting Up Mirror Device

1. Receive scan view
The main purpose a mirror device is to receive the scan screen from the scanning device, so we must also configure that.

```
await Roux.setReceiveRenderedStream(true)
```

2. Send scan commands
 When we configure the mirror device to send network commands, calls to the following functions will be sent to the scanning device: `startScanning`, `stopScanning`, `generateMesh`, `setScanSize`, `setVoxelSize`, and `setNoiseFilter`. Again we have to explicitly tell the mirror device to send these.

```
await Roux.setSendNetworkCommands(true)
```

3. Initialize
This device needs to initialize the Roux backend but must set the scanner type to `network` to tell it not to use data generated from the scanning device.


```
await Roux.initializeScanner('network')
```

## Setting Up the Scanning Device

1. Send scan preview
We have to tell the device to send the rendered scan preview...


```
await Roux.setSendRenderedStream(true)
```

2. Receive scan commands
 ... and to receive scan commands.

```
await Roux.setReceiveNetworkCommands(true)
```

3. Initialize
The scanning device can be initialized as you normally would.


```
await Roux.initializeScanner('true_depth')
```

## Connecting the Devices

First, both devices must be on the same wifi network.

From the mirror device we need to get the IP address so we know which IP to look for the scanning device in. On mirror device call:

```
const ip_address = await Roux.getIPAddress()
```


On the scanner device search through the discovered host IP addresses. The IP address of the mirror device should be in this list.

```
var discovered_hosts = await Roux.getDiscoveredHosts()
```

Then connect the scanner device to the mirror device (where `mirror_ip` is the `string` IP address of mirror device).


```
await Roux.connectToCommandHost(mirror_ip);
```

We can then use that same IP address to tell the scanning device to send the rendered scan preview to the mirror device.

```
await Roux.setServerHost(mirror_ip;
```
