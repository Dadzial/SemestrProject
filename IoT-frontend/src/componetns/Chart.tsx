import { LineChart } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';

interface ChartData {
  temperature: number;
  humidity?: number;
  readingDate: string;
  deviceId?: string;
}

export default function SensorDataChart({ deviceId }: { deviceId: number }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching latest data for device ${deviceId}...`);
        

        const endpoint = deviceId === 1 
          ? 'http://localhost:3100/api/data/fetch-and-save' 
          : 'http://localhost:3100/api/data/fetch-temp';
          
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Unexpected response format");
        }

        const sorted = result.data.sort(
            (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );


        const formattedData = sorted.map((item: any) => ({
          temperature: item.temperature,
          humidity: deviceId === 1 ? item.humidity : undefined,
          readingDate: item.createdAt,
          deviceId: item.deviceId
        }));

        setChartData(formattedData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching chart data:', err.message);
        setError('Could not load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [deviceId]);

  if (isLoading) {
    return <div style={{ color: 'white', textAlign: 'center' }}>Loading chart data...</div>;
  }

  if (error) {
    return (
        <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
          Error loading chart data: {error}
        </div>
    );
  }

  if (chartData.length === 0) {
    return (
        <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>
          No data available for the selected device.
        </div>
    );
  }

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  const temperatureData = chartData.map(item => ({
    value: item.temperature,
    date: new Date(item.readingDate)
  }));

  const humidityData = chartData
    .filter(item => item.humidity !== undefined)
    .map(item => ({
      value: item.humidity!,
      date: new Date(item.readingDate)
    }));


  const series = [
    {
      data: temperatureData.map(item => item.value),
      showMark: false,
      label: 'Temperature (°C)',
      color: '#4fc3f7',
    }
  ];


  if (deviceId === 1 && humidityData.length > 0) {
    series.push({
      data: humidityData.map(item => item.value),
      showMark: false,
      label: 'Humidity (%)',
      color: '#ff8a65',
    });
  }

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
        position: 'relative',
        left: '110px',
      }}
    >
      <LineChart
        height={300}
        series={series}
        xAxis={[
          {
            data: temperatureData.map(item => item.date),
            scaleType: 'time',
            valueFormatter: (date: Date) => timeFormatter.format(date),
            tickLabelStyle: {
              fill: '#ffffff',
            },
            stroke: '#ffffff',
            tickSize: 6,
          },
        ]}
        yAxis={[
          {
            tickLabelStyle: {
              fill: '#ffffff',
            },
            stroke: '#ffffff',
            tickSize: 6,
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
            stroke: '#ffffff !important',
            strokeWidth: 2,
          },
          '.MuiChartsAxis-label': {
            fill: '#ffffff',
            fontWeight: 'bold',
            fontFamily: 'Arial, sans-serif',
          },
          '.MuiLineElement-root': {
            strokeWidth: 2,
          },
          '.MuiChartsAxis-tick': {
            stroke: '#ffffff !important',
            strokeWidth: 2,
          },
        }}
        margin={{ left: 60, right: 30, top: 40, bottom: 30 }}
      />
    </Box>
  );
}
