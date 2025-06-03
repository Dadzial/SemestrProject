import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

interface DeviceCardProps {
  device: {
    id: number;
    name: string;
  };
}

const OutlinedCard: React.FC<DeviceCardProps> = ({ device }) => {
  return (
    <Box sx={{ minWidth: 230, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Card
        sx={{
          borderRadius: 6,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          backgroundColor: '#006081',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          py: 4,
          width: '100%',
        }}
      >
        <CardContent>
          <Typography gutterBottom sx={{ color: 'white', fontSize: 14 }}>
            {device.name}
          </Typography>
          <Typography variant="h5" component="div" sx={{ color: 'white' }}>
            Sensor Data
          </Typography>
          <Typography sx={{ color: 'white', mb: 0.5 }}>
            Temperature: 22.5°C
          </Typography>
          <Typography sx={{ color: 'white', mb: 1.5 }}>
            Humidity: 55%
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OutlinedCard;
