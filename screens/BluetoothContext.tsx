import React, {createContext, useContext, useState} from 'react';

const BluetoothContext = createContext<any>(null);

export const BluetoothProvider = ({children}: any) => {
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [connection, setConnectionObj] = useState<any>(null);

  const setConnection = (device: any, conn: any) => {
    console.log("✅ Connected:", device?.name);
    setConnectedDevice(device);
    setConnectionObj(conn);
  };

  const disconnectDevice = async () => {
    try {
      if (connection) {
        await connection.disconnect();
        console.log("Disconnected from device");
      }
      setConnectedDevice(null);
      setConnectionObj(null);
    } catch (e) {
      console.log("Disconnect error:", e);
    }
  };

  const sendCommand = async (cmd: string) => {
    try {
      if (!connection) return false;

      console.log("📤 Sending:", cmd);

      // Sending the full string. Most Arduino BT classic modules expect a delimiter like \n
      await connection.write(cmd + "\n"); 

      return true;
    } catch (e) {
      console.log("Send error:", e);
      return false;
    }
  };

  return (
    <BluetoothContext.Provider
      value={{
        connectedDevice,
        setConnection,
        sendCommand,
        disconnectDevice,
      }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetooth = () => useContext(BluetoothContext);