# RouxReactNativeHelloWorld

Example app using Roux SDK with React Native bindings

_PLEASE NOTE - DO NOT BUILD FOR A SIMULATOR - SCANDY CORE IS ONLY PACKAGED TO BE RUN ON DEVICE_

## Compatibility

This react-native-roux-sdk is built to be used with `ScandyCore.framework` **v0.7.2**.

We are still working on version linking this react native package and the Roux SDK framework.

## Setup

### Roux License

To run this example, you will need to generate a license through the [Roux Portal](http://roux.scandy.co). If you have not already, sign up as a developer to gain access to the developer dashboard. Create a new project and click the 'Download License' button.

Rename the license to `ScandyCoreLicense.txt` and move into `ios/ScandyCoreLicense/`. Its path will be `ios/ScandyCoreLicense/ScandyCoreLicense.txt`

Open `ios/RouxSdkExample.xcworkspace` in Xcode.

Select the `RouxSdkExample` target and ensure `ScandyCoreLicense.txt` is in the `Build Phases` -> `Copy Bundle Resources`.

### Scandy Core Framework

If you haven't already, download the SDK (button can be found in the top navigation bar of the Roux Portal). Extract the `ScandyCore.zip` file and move `ScandyCore.framework` into `ios/Frameworks/`.

Connect a device and build in Xcode.

### node_modules

```sh
yarn
```

Or if you prefer old school npm:

```sh
npm install
```

### Cocoapods

```bash
cd ios
pod install
cd ..
```

## Build

```bash
open ios/RouxSdkExample.xcworkspace
```

Then hit `cmd`+`r` to build and the run app.
