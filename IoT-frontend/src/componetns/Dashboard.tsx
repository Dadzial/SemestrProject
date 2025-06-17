import Navbar from './Navbar';
import OutlinedCard from './DeviceCard';
import Chart from './Chart';
import '../App.css';
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import kitchen from '../assets/kitchen.png';
import lroom from '../assets/lroom.png';
import bedroom from '../assets/broom.png';
import bathroom from '../assets/bathroom.png';
import garage from '../assets/garage.png';

const socket = io('http://localhost:3000');

const allDevices = [
    { id: 1, name: 'Kitchen', iconPath: kitchen },
    { id: 2, name: 'Living Room', iconPath: lroom },
    { id: 3, name: 'Bedroom', iconPath: bedroom },
    { id: 4, name: 'Bathroom', iconPath: bathroom },
    { id: 5, name: 'Garage', iconPath: garage },
];

export default function Dashboard() {
    const [mainDeviceId, setMainDeviceId] = useState(1);
    const [kitchenData, setKitchenData] = useState<{ temperature: number; humidity: number } | null>(null);
    const [livingRoomData, setLivingRoomData] = useState<{ temperature: number } | null>(null);
    const [showAll, setShowAll] = useState(false);

    const mainDevice = allDevices.find((device) => device.id === mainDeviceId);
    const otherDevices = allDevices.filter((device) => device.id !== mainDeviceId);

    const handleRestart = async () => {
        try {
            await fetch("http://localhost:3100/api/data/clear/fetch-save", {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
                }
            });
        } catch (error) {
            console.error("Error clearing data:", error);
        }
        setKitchenData(null);
        setLivingRoomData(null);
        setMainDeviceId(1);
    };

    useEffect(() => {
        socket.on("dataFromDHT", (data) => {
            const newData = Array.isArray(data) ? data : [data];
            const deviceData = newData[0];

            if (deviceData) {
                setKitchenData({
                    temperature: deviceData.temperature,
                    humidity: deviceData.humidity
                });
            }
        });

        socket.on("dataFromD18b20", (data) => {
            const newData = Array.isArray(data) ? data : [data];
            const deviceData = newData[0];

            if (deviceData) {
                setLivingRoomData({
                    temperature: deviceData.temperature
                });
            }
        });

        return () => {
            socket.off("dataFromDHT");
            socket.off("dataFromD18b20");
        };
    }, []);

    const getTemperature = (deviceId: number) => {
        if (deviceId === 1) return kitchenData?.temperature;
        if (deviceId === 2) return livingRoomData?.temperature;
        return undefined;
    };

    const getHumidity = (deviceId: number) => {
        if (deviceId === 1) return kitchenData?.humidity;
        return undefined;
    };

    const chartDeviceId = showAll ? 0 : mainDeviceId;

    return (
        <div className="app">
            <Navbar onRestart={handleRestart} showAll={showAll} onToggleShowAll={setShowAll} />
            <div className="main-container">
                <div className="main-content">
                    <div className="main-device">
                        {mainDevice && (
                            <OutlinedCard
                                device={mainDevice}
                                temperature={getTemperature(mainDevice.id)}
                                humidity={getHumidity(mainDevice.id)}
                            />
                        )}
                    </div>
                    <div className="chart-container">
                        <Chart deviceId={chartDeviceId} showAllDevices={showAll} />
                    </div>
                </div>
                <div className="secondary-devices">
                    <h2>Other Devices</h2>
                    <div className="devices-container" style={{
                        display: 'flex',
                        flexDirection: 'row',
                        flexWrap: 'nowrap',
                        gap: '16px',
                        overflowX: 'auto',
                        paddingBottom: '8px',
                        alignItems: 'center',
                        width: '100%',
                        minWidth: 0,
                    }}>
                        {otherDevices.map((device) => (
                            <OutlinedCard
                                key={device.id}
                                device={device}
                                temperature={getTemperature(device.id)}
                                humidity={getHumidity(device.id)}
                                onClick={() => setMainDeviceId(device.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
