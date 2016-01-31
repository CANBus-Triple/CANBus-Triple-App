CANBus Triple App
==========================

Android / iOS App for controlling your CANBus Triple via USB or Bluetooth

- [CANBus Triple](http://canb.us)

This software is in an beta state. Builds are available at [https://canb.us](https://canb.us)



# Building for Desktop

You'll need NodeJS and NPM installed to build. Get them here: [NodeJS.org](https://nodejs.org/)

## Mac OS / Linux

```
npm install -g bower gulp
export npm_config_disturl=https://atom.io/download/atom-shell
export npm_config_target=0.36.7
export npm_config_arch=x64
export npm_config_runtime=electron
npm install
bower install
cd node_modules/serialport/build/Release
mv electron-v0.36-darwin-x64 node-v47-darwin-x64
cd ../../../../
gulp build
```

If everything goes according to plan you will find the build in the 'release' folder.


## Windows 
You'll need Microsoft Visual Studio Express (2015) community edition [from here.](https://www.visualstudio.com/en-us/products/visual-studio-community-vs.aspx) and 7zip [from here](http://sourceforge.net/projects/sevenzip/files/7-Zip/).
```
npm install -g bower gulp
set npm_config_disturl=https://atom.io/download/atom-shell
set npm_config_target=0.36.7
set npm_config_arch=x64
set npm_config_runtime=electron
GYP_MSVS_VERSION=2015
npm install
cd node_modules/serialport/build/Release
mv electron-v0.36-win32-x64 node-v47-win32-x64
cd ../../../../
bower install
gulp build
```




# Building for Mobile

**Mobile has been abandon in favor of the upcoming Android app.**

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

