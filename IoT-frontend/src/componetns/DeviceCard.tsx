import * as React from 'react';
import {Card, Typography, Box, Stack} from '@mui/material';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { useEffect, useRef, useState } from 'react';

interface DeviceCardProps {
    device: {
        id: number;
        name: string;
        typeLabel?: string;
        iconPath: string;
    },
    temperature?: number;
    humidity?: number;
    onClick?: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({device, temperature, humidity, onClick}) => {
    const previousTemperature = useRef<number | undefined>(undefined);
    const [shouldBlink, setShouldBlink] = useState(false);

    useEffect(() => {
        if (temperature && previousTemperature.current !== undefined) {
            const diff = Math.abs(temperature - previousTemperature.current);
            const percentChange = (diff / previousTemperature.current) * 100;

            if (percentChange > 1) {
                setShouldBlink(true);
                setTimeout(() => setShouldBlink(false), 5000);
            }
        }
        previousTemperature.current = temperature;
    }, [temperature]);

    return (
        <Card
            onClick={onClick}
            sx={{
                width: 270,
                height: 150,
                borderRadius: 3,
                backgroundColor: '#006080',
                color: 'white',
                cursor: onClick ? 'pointer' : 'default',
                position: 'relative',
                px: 1.5,
                py: 1.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    backgroundColor: '#00506a',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
                '&:active': {
                    backgroundColor: '#004055',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                }
            }}
        >
            <Box display="flex" alignItems="center" gap={2} width="100%">
                <Box
                    className={shouldBlink ? 'blink-red' : ''}

                    sx={{
                        background: 'white',
                        borderRadius: 2,
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 44,
                        height: 44,
                        boxShadow: '0 1px 6px rgba(0,0,0,0.10)',
                    }}
                >
                    <Box
                        component="img"
                        src={device.iconPath}
                        alt="device icon"
                        className={shouldBlink ? 'blink-red' : ''}
                        sx={{
                            width: 40,
                            height: 40,
                            objectFit: 'contain',
                        }}
                    />
                </Box>
                <Box>
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                            fontSize: 22,
                            lineHeight: 1.2,
                            color: 'white',
                            mb: 0.5,
                            textAlign: 'left',
                        }}
                    >
                        {device.name}
                    </Typography>
                    <Typography
                        sx={{
                            fontWeight: 'bold',
                            fontSize: 16,
                            opacity: 0.85,
                            textAlign: 'left',
                        }}
                    >
                        {device.typeLabel ?? 'Air Sensor'}
                    </Typography>
                </Box>
            </Box>

            <Box width="100%" pl={1}>
                <Stack direction="row" alignItems="center" spacing={2} mt={1.5}>
                    <DeviceThermostatIcon sx={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.9)' }} />
                    <Box>
                        <Typography fontSize={10} color="rgba(255, 255, 255, 0.8)" lineHeight={1.2}>
                            TEMPERATURE
                        </Typography>
                        <Typography fontSize={22} fontWeight="bold" lineHeight={1.2} minWidth="80px">
                            {temperature !== undefined ? `${temperature}°C` : '---'}
                        </Typography>
                    </Box>
                </Stack>
                {device.id !== 2 && (
                    <Stack direction="row" alignItems="center" spacing={2} mt={1.5}>
                        <WaterDropIcon sx={{ fontSize: 24, color: 'rgba(255, 255, 255, 0.9)' }} />
                        <Box>
                            <Typography fontSize={10} color="rgba(255, 255, 255, 0.8)" lineHeight={1.2}>
                                HUMIDITY
                            </Typography>
                            <Typography fontSize={22} fontWeight="bold" lineHeight={1.2} minWidth="80px">
                                {humidity !== undefined ? `${humidity}%` : '---'}
                            </Typography>
                        </Box>
                    </Stack>
                )}
            </Box>
        </Card>
    );
};

export default DeviceCard;
