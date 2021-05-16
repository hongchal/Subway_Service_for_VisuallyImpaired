import React from 'react'
import styled from 'styled-components/native';
import { BleManager, Device } from 'react-native-ble-plx'



const TestRssi:React.FC =() => {

    const manager = new BleManager();

    const scanAndConnect = () => {
        manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                // Handle error (scanning will be stopped automatically)
                return
            }
    
            
            console.log(device?.solicitedServiceUUIDs)
            console.log(device?.overflowServiceUUIDs)
            console.log(device?.serviceUUIDs)


        });
    }

    const subscription = manager.onStateChange((state) => {
        if (state === 'PoweredOn') {
            console.log('p on');
            scanAndConnect();
            subscription.remove();
        }
    }, true);
    // manager.startDeviceScan(['74278bda-b644-4520-8f0c-720eaf059935'],null,()=>{console.log(Device.name)})


    setInterval(()=>{
       console.log('adsf')
    },15000)

    return (
        <InfoText>test rssi</InfoText>
    )
}

const InfoWrapper = styled.View`
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const InfoText = styled.Text`
  color: black;
  font-size: 30px;
  font-weight: bold;
`;

export default TestRssi;