import React, {createContext, useState, useContext, ReactNode, useRef} from 'react';
import RNBluetoothClassic from 'react-native-bluetooth-classic';

interface BluetoothState {
  connectedDevice: any | null;
  nativeDevice: any | null;
  setConnection: (meta: any | null, native: any | null) => void;
  sendCommand: (command: string) => Promise<boolean>;
  disconnectDevice: () => Promise<void>;
}

export const BluetoothContext = createContext<BluetoothState>({
  connectedDevice: null,
  nativeDevice: null,
  setConnection: () => {},
  sendCommand: async () => false,
  disconnectDevice: async () => {},
});

export const BluetoothProvider = ({children}: {children: ReactNode}) => {
  const [connectedDevice, setConnectedDevice] = useState<any | null>(null);
  const nativeDeviceRef = useRef<any | null>(null);
  const reconnectPromiseRef = useRef<Promise<boolean> | null>(null);

  const setConnection = (meta: any | null, native: any | null) => {
    setConnectedDevice(meta);
    nativeDeviceRef.current = native;
  };

  const sendCommand = async (command: string): Promise<boolean> => {
    if (!connectedDevice) {
      console.warn('[BT] sendCommand: No device in context — not connected.');
      return false;
    }

    console.log(`[BT] sendCommand: "${command}" | device type: ${connectedDevice.type} | id: ${connectedDevice.id}`);

    try {
      const message = command;

      if (connectedDevice.type === 'classic') {
        const address = connectedDevice.id;

        // 1. Check if native layer still considers device connected
        let isConnected = false;
        try {
          isConnected = await RNBluetoothClassic.isDeviceConnected(address);
          console.log(`[BT] isDeviceConnected(${address}) => ${isConnected}`);
        } catch (checkErr) {
          console.warn('[BT] isDeviceConnected threw:', checkErr);
          isConnected = false;
        }

        // 2. If dropped, try to reconnect once automatically (with locking)
        if (!isConnected) {
          if (reconnectPromiseRef.current) {
            console.log('[BT] Reconnection already in progress — waiting for result...');
            isConnected = await reconnectPromiseRef.current;
          } else {
            console.log('[BT] Connection dropped — waiting 1s before auto-reconnect...');
            reconnectPromiseRef.current = (async () => {
              try {
                await new Promise(resolve => setTimeout(resolve, 1000)); // Cool down delay
                const reconnected = await RNBluetoothClassic.connectToDevice(address, {
                  secureSocket: false,
                });
                if (reconnected) {
                  nativeDeviceRef.current = reconnected;
                  console.log('[BT] Auto-reconnected successfully.');
                  return true;
                } else {
                  console.error('[BT] connectToDevice returned falsy.');
                  return false;
                }
              } catch (reconnErr) {
                console.error('[BT] Auto-reconnect failed:', reconnErr);
                setConnection(null, null);
                return false;
              } finally {
                reconnectPromiseRef.current = null; // Release the lock
              }
            })();
            isConnected = await reconnectPromiseRef.current;
          }

          if (!isConnected) {
            return false;
          }
        }

        // 3. Write using the live native device object
        const native = nativeDeviceRef.current;
        if (!native) {
          console.error('[BT] Native device ref is null — cannot write.');
          return false;
        }
        console.log(`[BT] Writing: "${message.trim()}" to native device`);
        const success = await native.write(message);
        console.log(`[BT] Write result: ${success}`);
        return success;
      } else if (connectedDevice.type === 'ble') {
        console.warn('[BT] Device is BLE — classic write not supported. Use a BLE characteristic write instead.');
        return false;
      } else {
        console.error(`[BT] Unknown device type: "${connectedDevice.type}" — cannot send command.`);
        return false;
      }
    } catch (e) {
      console.error('[BT] Transmission error:', e);
      return false;
    }
  };

  const disconnectDevice = async () => {
    try {
      const native = nativeDeviceRef.current;
      if (native) {
        await native.disconnect();
        console.log('[BT] Disconnected successfully via native object.');
      } else {
        console.log('[BT] No native device ref — clearing state only.');
      }
    } catch (e) {
      console.warn('[BT] Error while disconnecting:', e);
    } finally {
      setConnection(null, null);
    }
  };

  return (
    <BluetoothContext.Provider
      value={{
        connectedDevice,
        nativeDevice: nativeDeviceRef.current,
        setConnection,
        sendCommand,
        disconnectDevice,
      }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);
