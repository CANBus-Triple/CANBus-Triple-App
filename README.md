CANBus Triple App
==========================

Android / iOS App for controlling your CANBus Triple via USB or Bluetooth

- [CANBus Triple](http://canb.us)

This software is in an alpha state. Test builds will be available soon.



# Building for Desktop

```
npm install
bower install
npm install -g node-pre-gyp
cd node_modules/serialport
node-pre-gyp rebuild --runtime=node-webkit --target=0.12.0-alpha3
gulp build
```

After a successful build you will find the binaries in ./build

# Building for Mobile

Install android sdks and correctly set your PATH env var.

``
export PATH="$PATH:$ANDROID_HOME/tools:$ANDROID_PLATFORM_TOOLS"
``

Install and build:

```
npm install cordova -g
cordova platform add android
cordova build android 
```

or to build and install to a connected Android device run
```
cordova run android
```

