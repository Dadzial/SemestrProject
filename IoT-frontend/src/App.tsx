import Navbar from './componetns/Navbar';
import OutlinedCard from './componetns/DeviceCard';
import Chart from './componetns/Chart';
import './App.css';
import {useState} from "react";

const allDevices = [
    {id:1, name: 'Kitchen'},
    {id:2, name: 'Living Room'},
    {id:3, name: 'Bedroom'},
    {id:4, name: 'Bathroom'},
];

function App() {
    const [showDevices] = useState([1, 2, 3, 4]);
    return (
        <div className="app">
            <Navbar/>
            <div className="main-container">
                <div className="main-content">
                    <div className="main-device">
                        <OutlinedCard device={allDevices[0]} />
                    </div>
                    <div className="chart-container">
                        <Chart/>
                    </div>
                </div>
                <div className="secondary-devices">
                    <h2>Other Devices</h2>
                    <div className="devices-container">
                        {allDevices
                            .filter(device => showDevices.includes(device.id))
                            .map(device => (
                                <OutlinedCard key={device.id} device={device} />
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;