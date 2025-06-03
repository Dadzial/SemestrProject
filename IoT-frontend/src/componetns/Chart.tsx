import * as React from 'react';
import Button from '@mui/material/Button';
import { LineChart } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';

const oneMinute = 60 * 1000;
const length = 50;

const initialFirstData = Array.from<number>({ length }).map(
    (_, __, array) => (array[array.length - 1] ?? 0) + randBetween(-100, 500),
);
const initialSecondData = Array.from<number>({ length }).map(
    (_, __, array) => (array[array.length - 1] ?? 0) + randBetween(-500, 100),
);

const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
});

export default function LiveLineChartNoSnap() {
    const [running, setRunning] = React.useState(false);
    const [date, setDate] = React.useState(new Date(2000, 0, 1, 0, 0, 0));
    const [firstData, setFirstData] = React.useState(initialFirstData);
    const [secondData, setSecondData] = React.useState(initialSecondData);

    React.useEffect(() => {
        if (!running) return;
        const intervalId = setInterval(() => {
            setDate((prev) => new Date(prev.getTime() + oneMinute));
            setFirstData((prev) => [
                ...prev.slice(1),
                (prev[prev.length - 1] ?? 0) + randBetween(-500, 500),
            ]);
            setSecondData((prev) => [
                ...prev.slice(1),
                (prev[prev.length - 1] ?? 0) + randBetween(-500, 500),
            ]);
        }, 100);

        return () => clearInterval(intervalId);
    }, [running]);

    return (
        <Box
            sx={{
                width: '90%',
                maxWidth: 600,
                backgroundColor: '#006081',
                borderRadius: 12,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                padding: 2,
                margin: 'auto',
                color: 'white',
                position: 'relative',
                left: '110px',
            }}
        >
            <LineChart
                height={200}
                series={[
                    {
                        data: secondData,
                        showMark: false,
                        label: 'Temperature',
                        color: '#4fc3f7',
                    },
                    {
                        data: firstData,
                        showMark: false,
                        label: 'Humidity',
                        color: '#ff8a65',
                    },
                ]}
                xAxis={[
                    {
                        scaleType: 'point',
                        data: Array.from({ length }).map(
                            (_, i) => new Date(date.getTime() + i * oneMinute),
                        ),
                        valueFormatter: (value: Date) => timeFormatter.format(value),
                    },
                ]}
                slotProps={{
                    legend: {
                        labelStyle: {
                            fontWeight: 'bold',
                            fontFamily: 'Inter, sans-serif',
                            fill: '#fff',
                        },
                    },
                }}
                sx={{
                    '.MuiChartsLegend-label': {
                        fill: '#fff',
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif',
                    },
                    '.MuiChartsAxis-tickLabel': {
                        fill: '#fff',
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif',
                    },
                    '.MuiChartsAxis-line': {
                        stroke: '#fff',
                    },
                    '.MuiChartsAxis-label': {
                        fill: '#fff',
                        fontWeight: 'bold',
                        fontFamily: 'Arial, sans-serif',
                    },
                    '.MuiLineElement-root': {
                        strokeWidth: 2,
                    },
                    '.MuiChartsAxis-tick': {
                        stroke: '#ffffff80',
                    },
                }}
                margin={{ left: 50, right: 24, top: 40, bottom: 30 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                    size="small"
                    variant="contained"
                    sx={{
                        backgroundColor: '#ffffff',
                        color: '#006081',
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: '#e6e6e6',
                        },
                    }}
                    onClick={() => setRunning((p) => !p)}
                >
                    {running ? 'Stop' : 'Start'}
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    sx={{
                        marginLeft: 1.5,
                        color: '#006081',
                        backgroundColor: '#ffffff',
                        fontFamily: 'Arial',
                        fontWeight: 'bold',
                        '&:hover': {
                            backgroundColor: '#e6e6e6',
                        },
                    }}
                    onClick={() => {
                        setFirstData(initialFirstData);
                        setSecondData(initialSecondData);
                    }}
                >
                    Reset
                </Button>
            </Box>
        </Box>
    );
}

function randBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
