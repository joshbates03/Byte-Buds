import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SideBar from './SideBar';
import { generate as randomWordsGenerate } from 'random-words';
import notFoundImage from './images/404.png';

const NotFound = () => {

    const [isSmall, setIsSmall] = useState(window.innerWidth < 1150);
    const [toggleSidebar, setToggleSidebar] = useState(false)
    const [guestName, setGuestName] = useState('')
    const [, setIsGuest] = useState(true);
    const [, setIsLoading] = useState(true);


    const handleToggleSidebar = () => { setToggleSidebar(!toggleSidebar) }

    // Removes sidebar if page becomes small
    useEffect(() => {
        if (!isSmall) { setToggleSidebar(false) }
    }, [isSmall]);


    // Checks if the window is small
    useEffect(() => {
        const handleResize = () => {
            setIsSmall(window.innerWidth < 1150)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const pageStyle = {
        height: '100vh',
        width: '100%',
        backgroundColor: '#F5F5F5',
        position: 'relative',
    };

    const [sidebarPosition, setSidebarPosition] = useState(localStorage.getItem('sidebarPosition') || 'right');
    const [snapClick, setSnapClick] = useState(0)

    // Sets sidebar to the saved position
    useEffect(() => {
        const handleStorageChange = () => {
            const savedPosition = localStorage.getItem('sidebarPosition');
            if (savedPosition) {
                setSidebarPosition(savedPosition);
            }
        }
        handleStorageChange()
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [snapClick]);

    const handleSnapClick = () => {
        setSnapClick(prevValue => prevValue + 1);
    };

    const mainContainerStyle = {
        marginLeft: isSmall ? '0' : sidebarPosition === 'left' ? '255px' : 'auto',
        marginRight: isSmall ? '0' : sidebarPosition === 'right' ? '255px' : 'auto',
        height: '100vh',
        width: isSmall ? '100%' : 'calc(100% - 250px)',
        overflowX: 'hidden',
        transition: '0.3s',
    };

    return (
        <Container sx={pageStyle} maxWidth="false">

            <SideBar isOpen={!isSmall} toggleOpen={toggleSidebar}
                setGuestName={setGuestName}
                setIsGuest={setIsGuest}
                randomWordsGenerate={randomWordsGenerate}
                guestName={guestName}
                setIsLoading={setIsLoading}
                onSnapClick={handleSnapClick}
            />

            <Container sx={mainContainerStyle} maxWidth="false">
                <Breadcrumbs sx={{ marginTop: 3 }} aria-label="breadcrumb">
                    <Link color="inherit" href="/">Homepage</Link>
                </Breadcrumbs>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                    {sidebarPosition === 'right' && isSmall && (
                        <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                            <KeyboardDoubleArrowRightIcon />
                        </IconButton>
                    )}
                    <Typography variant='h5'>
                        Page Not Found
                    </Typography>

                    {sidebarPosition === 'left' && (
                        <div style={{ marginLeft: sidebarPosition === 'left' ? 'auto' : '0', marginRight: sidebarPosition === 'right' ? 'auto' : '0' }}>
                            {isSmall && (
                                <IconButton onClick={handleToggleSidebar} sx={{}}>
                                    <KeyboardDoubleArrowRightIcon />
                                </IconButton>
                            )}
                        </div>
                    )}

                </div>

                <div className= 'scale-in-center' style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', marginTop:50 }}>
                    <img src={notFoundImage} alt="404 Not Found" style={{ maxWidth: '100%', }} />
                </div>

            </Container>
        </Container>
    );
};

export default NotFound;
