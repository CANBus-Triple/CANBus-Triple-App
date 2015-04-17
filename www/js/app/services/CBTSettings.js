'use strict';

angular.module('cbt')
  .factory('CBTSettings', function ($rootScope, $q, UtilsService, HardwareService){

    var eepromBuffer = new ArrayBuffer(512);
    var eepromView = new Uint8Array(eepromBuffer);

    // EEPROM Struct
    var displayEnabled = new Uint8Array(eepromBuffer, 0, 1);
    var firstboot = new Uint8Array(eepromBuffer, 1, 1);
    var displayIndex = new Uint8Array(eepromBuffer, 2, 1);
    var busSpeeds = new Uint8Array(eepromBuffer, 3, 6);
    /*
    var hwselftest = new Uint8Array(eepromBuffer, 3, 1);
    var placeholder4 = new Uint8Array(eepromBuffer, 4, 1);
    var placeholder5 = new Uint8Array(eepromBuffer, 5, 1);
    var placeholder6 = new Uint8Array(eepromBuffer, 6, 1);
    var placeholder7 = new Uint8Array(eepromBuffer, 7, 1);
    */

    var pids = [],
        l = 34,   // PID Size
        off = 14; // Start offset

    for(var i=0; i<8; i++)
      pids.push({
        busId: new Uint8Array(eepromBuffer, (l*i)+off, 1),
        settings: new Uint8Array(eepromBuffer, 1+(l*i)+off, 1),
        value: new Uint8Array(eepromBuffer, 2+(l*i)+off, 2),
        txd: new Uint8Array(eepromBuffer, 4+(l*i)+off, 8),
        rxf: new Uint8Array(eepromBuffer, 12+(l*i)+off, 6),
        rxd: new Uint8Array(eepromBuffer, 18+(l*i)+off, 2),
        mth: new Uint8Array(eepromBuffer, 20+(l*i)+off, 6),
        name: new Uint8Array(eepromBuffer, 26+(l*i)+off, 8)
      });


    /*
    *   Human readable object of PIDs for view rendering.
    */
    var managedPids = [];
    for(var i=0; i<pids.length; i++)
      managedPids.push( { busId: '',
                          settings: [],
                          value: '',
                          txd: '',
                          rxf: '',
                          rxd: '',
                          mth: '',
                          name: ''
                        });

    /*
    *   Convert eeprom buffer to managed pid object
    */
    var updateManagedPids = function(){

      managedPids.forEach(function(element, index, array){
        element.busId = pids[index].busId[0];
        element.settings = pids[index].settings[0];
        // element.value = (pids[index].value[1] << 8) + pids[index].value[0];
        element.value = UtilsService.byteArrayToHex(pids[index].value).toUpperCase();
        element.txd = UtilsService.byteArrayToHex(pids[index].txd).toUpperCase();
        element.rxf = UtilsService.byteArrayToHex(pids[index].rxf).toUpperCase();
        element.rxd = UtilsService.byteArrayToHex(pids[index].rxd).toUpperCase();
        element.mth = UtilsService.byteArrayToHex(pids[index].mth).toUpperCase();
        element.name = UtilsService.byteArrayToString(pids[index].name);
      });

    }

    /*
    *   Convert eeprom buffer to managed pid object
    */
    var updateEepromPids = function(){

      managedPids.forEach(function(element, index, array){
        pids[index].busId.clear().set( [element.busId] );
        // pids[index].settings.set();
        pids[index].value.clear().set( UtilsService.hexToByteArray( element.value ) );
        pids[index].txd.clear().set( UtilsService.hexToByteArray( element.txd ) );
        pids[index].rxf.clear().set( UtilsService.hexToByteArray( element.rxf ) );
        pids[index].rxd.clear().set( UtilsService.hexToByteArray( element.rxd ) );
        pids[index].mth.clear().set( UtilsService.hexToByteArray( element.mth ) );
        pids[index].name.clear();
        pids[index].name.set( [0x20,0x20,0x20,0x20,0x20,0x20,0x20,0x20] ); // fill with spaces
        pids[index].name.set( UtilsService.stringToByteArray( element.name ) );

      });

    }


    /*
    * Send Eeprom to CBT in chunks
    */
    function sendEeprom(payload){

      // if( !$scope.hwConnected ) return;


      // if(!(command instanceof Array)) return;

      var command= [0x01, 0x03],
          chunkSize = 32,
          buffer,
          uint8View,
          i = 0;

      if( payload instanceof ArrayBuffer ){

        function prepChunk(i){
          buffer = new ArrayBuffer( command.length + chunkSize + 2 );
          uint8View = new Uint8Array(buffer);
          uint8View.set(command);
          uint8View[command.length] = i;
          uint8View.set( new Uint8Array(payload, chunkSize*i, chunkSize), command.length+1 );
          uint8View[buffer.byteLength-1] = 0xA1; // Check byte
        }

        function sendChunk(){
          prepChunk(i);
          HardwareService.send(buffer);
        }

        var removeListener;
        function handleSent(event, data){
          if( data.event == 'eepromData' ){
            i++;

            console.log( (i*chunkSize) , payload.byteLength );

            if( (i*chunkSize)<payload.byteLength )
              setTimeout( sendChunk, 40 );
            else
              removeListener();
          }
        }

        removeListener = $rootScope.$on("hardwareEvent", handleSent);

        sendChunk();


      }

    }




    /*
    *   Events
    */

    $rootScope.$on("hardwareEvent", handleDataEvent);
    function handleDataEvent(event, data){

      switch(data.event){
        case 'eeprom':
          eepromView.set( UtilsService.hexToUint8Array( data.data ) );
          updateManagedPids();
          $rootScope.$apply();
        break;
      }

    }


    return {
      pids: managedPids,
      load: function(){
        // Ask for eeprom
        HardwareService.command('getEeprom');
      },
      debugEeprom: function(){
        console.log( pids );
      },
      sendEeprom: function(){
        updateEepromPids();
        sendEeprom(eepromBuffer);
      }
    }

  });
