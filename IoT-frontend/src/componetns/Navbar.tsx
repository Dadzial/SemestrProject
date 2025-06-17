import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';
import {FormControlLabel, Switch} from "@mui/material";

const pages = ['Devices state'];

interface NavbarProps {
    onRestart: () => void;
    showAll: boolean;
    onToggleShowAll: React.Dispatch<React.SetStateAction<boolean>>;

}


function Navbar({onRestart, onToggleShowAll}:NavbarProps) {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);


    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const logout = async () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    }



    return (
        <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
            <Container maxWidth={false}  sx={{ height: '22px',minWidth: 0, px: 0,}}>
                <Toolbar disableGutters sx={{ alignItems: 'center', minHeight: '22px !important', height: '22px', px: 2 }}>

                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            fontFamily: 'Arial',
                            fontWeight: 'bold',
                            letterSpacing: '.3rem',
                            color: '#006081',
                            textDecoration: 'none'
                        }}
                    >
                        <LanguageIcon
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                mr: 1,
                                backgroundColor: '#006081',
                                borderRadius: '50%',
                                color: 'white',
                            }}
                        />
                        <Box component="span" sx={{ color: 'white' }}>
                            IoT-
                        </Box>
                        <Box component="span" sx={{ color: '#006081' }}>
                            Dashboard
                        </Box>
                    </Typography>

                    <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: {xs: 'block', md: 'none'},
                            }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseNavMenu}>
                                    <Typography textAlign="center">{page}</Typography>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Box>
                    <Box sx={{ flexGrow: 3, display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
                        <Button
                            onClick ={onRestart}
                            sx={{
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '30px',
                                minHeight: '30px',
                                padding: '0 16px',
                                textTransform: 'none',
                                fontSize: '0.875rem',
                                backgroundColor: '#006081',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                lineHeight: 1,
                                '&:hover': {
                                    backgroundColor: '#006081',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            Restart fetching data
                        </Button>
                        <Button
                            onClick={logout}
                            sx={{
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '30px',
                                minHeight: '30px',
                                padding: '0 16px',
                                textTransform: 'none',
                                margin: '0 16px',
                                fontSize: '0.875rem',
                                backgroundColor: '#006081',
                                borderRadius: '4px',
                                boxShadow: 'none',
                                lineHeight: 1,
                                '&:hover': {
                                    backgroundColor: '#006081',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            Logout
                        </Button>
                        <FormControlLabel
                            control={
                                <Switch
                                    defaultChecked={false}
                                    onChange={(e) => onToggleShowAll(e.target.checked)}
                                    sx={{
                                        color: '#006081',
                                        '&.Mui-checked': {
                                            color: '#006081',
                                        },
                                    }}
                                />
                            }
                            label="Chart from All Devices"
                        />
                    </Box>
                    <div className="logo"></div>

                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;
