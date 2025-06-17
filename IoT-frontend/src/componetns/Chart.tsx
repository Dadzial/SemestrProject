import { LineChart } from '@mui/x-charts/LineChart';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';

interface ChartData {
  temperature: number;
  humidity?: number;
  readingDate: string;
}

export default function SensorDataChart({ deviceId, showAllDevices }: { deviceId: number, showAllDevices: boolean }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [secondDeviceData, setSecondDeviceData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoint = showAllDevices
            ? 'http://localhost:3100/api/data/fetch-all'
            : deviceId === 1
                ? 'http://localhost:3100/api/data/fetch-and-save'
                : 'http://localhost:3100/api/data/fetch-temp';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();

        if (showAllDevices) {
          const dhtData = Array.isArray(result.data?.dht) ? result.data.dht : [];
          const d18b20Data = Array.isArray(result.data?.d18b20) ? result.data.d18b20 : [];

          const sortedDht = [...dhtData].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          const sortedD18b20 = [...d18b20Data].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          const formattedDht = sortedDht.map(item => ({
            temperature: item.temperature,
            humidity: item.humidity,
            readingDate: item.createdAt,
            device: 'kitchen',
          }));

          const formattedD18b20 = sortedD18b20.map(item => ({
            temperature: item.temperature,
            readingDate: item.createdAt,
            device: 'livingroom',
          }));

          setChartData(formattedDht);
          setSecondDeviceData(formattedD18b20);
        } else {
          if (!Array.isArray(result.data)) {
            throw new Error('Unexpected response format');
          }

          const sorted = [...result.data].sort(
              (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          const formattedData = sorted.map((item: any) => ({
            temperature: item.temperature,
            humidity: item.humidity,
            readingDate: item.createdAt,
          }));

          setChartData(formattedData);
          setSecondDeviceData([]);
        }
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
  }, [deviceId, showAllDevices]);

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

  let series: any[] = [];
  let xData: Date[] = [];

  if (showAllDevices) {
    try {
      const kitchenData = chartData
          .filter(item => item && item.temperature !== undefined && item.readingDate)
          .map(item => ({
            value: item.temperature,
            date: new Date(item.readingDate)
          }));

      const livingRoomData = secondDeviceData
          .filter(item => item && item.temperature !== undefined && item.readingDate)
          .map(item => ({
            value: item.temperature,
            date: new Date(item.readingDate)
          }));

      const humidityData = chartData
          .filter(item => item.humidity !== undefined && item.readingDate)
          .map(item => ({
            value: item.humidity!,
            date: new Date(item.readingDate),
          }));

      if (kitchenData.length === 0 && livingRoomData.length === 0) {
        throw new Error('No valid data available for either device');
      }

      const baseData = kitchenData.length > 0 ? kitchenData : livingRoomData;
      xData = baseData.map(item => item.date);

      if (kitchenData.length > 0) {
        series.push({
          data: kitchenData.map(item => item.value),
          showMark: false,
          label: 'Kitchen Temp (°C)',
          color: '#4fc3f7',
        });
      }

      if (livingRoomData.length > 0) {
        const livingRoomValues = baseData.map(baseDate => {
          const closest = livingRoomData.reduce((prev, curr) =>
              Math.abs(curr.date.getTime() - baseDate.date.getTime()) < Math.abs(prev.date.getTime() - baseDate.date.getTime()) ? curr : prev
          );
          return closest.value;
        });

        series.push({
          data: livingRoomValues,
          showMark: false,
          label: 'Living Room Temp (°C)',
          color: '#a5d6a7',
        });
      }

      if (humidityData.length > 0) {
        const humidityValues = baseData.map(baseDate => {
          const closest = humidityData.reduce((prev, curr) =>
              Math.abs(curr.date.getTime() - baseDate.date.getTime()) < Math.abs(prev.date.getTime() - baseDate.date.getTime()) ? curr : prev
          );
          return closest.value;
        });

        series.push({
          data: humidityValues,
          showMark: false,
          label: 'Kitchen Humidity (%)',
          color: '#ff8a65',
        });
      }
    } catch (err) {
      console.error('Error processing combined data:', err);
      setError('Error displaying combined chart data');
      return null;
    }
  } else {
    const temperatureData = chartData.map(item => ({
      value: item.temperature,
      date: new Date(item.readingDate),
    }));

    const humidityData = chartData
        .filter(item => item.humidity !== undefined)
        .map(item => ({
          value: item.humidity!,
          date: new Date(item.readingDate),
        }));

    series = [{
      data: temperatureData.map(item => item.value),
      showMark: false,
      label: 'Temperature (°C)',
      color: '#4fc3f7',
    }];

    if (deviceId === 1 && humidityData.length > 0) {
      series.push({
        data: humidityData.map(i => i.value),
        showMark: false,
        label: 'Humidity (%)',
        color: '#ff8a65',
      });
    }

    xData = temperatureData.map(item => item.date);
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
                data: xData,
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
