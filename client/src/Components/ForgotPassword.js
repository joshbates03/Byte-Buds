import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SideBar from './SideBar';
import './Textfield.css';
import './ButtonStyles.css';
import SendIcon from '@mui/icons-material/Send';
import { generate as randomWordsGenerate } from 'random-words';
import baseURL from './config';


const ForgotPassword = () => {

    const [isSmall, setIsSmall] = useState(window.innerWidth < 1150);
    const [toggleSidebar, setToggleSidebar] = useState(false)
    const [guestName, setGuestName] = useState('')
    const [, setIsGuest] = useState(true)
    const [, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [, setIsCooldown] = useState(false)
    const [email, setEmail] = useState('');
    const [messageColour, setMessageColour] = useState('green')
    const handleEmailChange = (e) => {setEmail(e.target.value)};

    
    const handleSendResetLink = async () => {
        try {
            if (email === ''){return}
            const lastSentTime = localStorage.getItem('lastSentTime');
            const currentTime = new Date().getTime();
            setMessageColour('green')
            if (lastSentTime && currentTime - parseInt(lastSentTime, 10) < 60000) {
               
                setMessage(`You must wait 1 minute before trying again`)
                setMessageColour('red')
                return;
            }
    
            localStorage.setItem('lastSentTime', currentTime.toString());
            setIsCooldown(true);
    
            const response = await fetch(`${baseURL}/generate-reset-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                }),
            });
    
            if (response.ok) {
                await response.json();
                setMessage(`A link has been sent to ${email}, it is only valid for 10 minutes`)
            } else {
                const errorMessage = await response.text();
                console.error(errorMessage);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => {
                setIsCooldown(false);
            }, 60000);
        }
    };
    


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
        setSnapClick(prevValue => prevValue + 1); // Update snapClick state when the button is clicked
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
                    <Link color="inherit" href="/forgot-password">Forgot Password</Link>
                </Breadcrumbs>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                    {sidebarPosition === 'right' && isSmall && (
                        <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                            <KeyboardDoubleArrowRightIcon />
                        </IconButton>
                    )}
                    <Typography variant='h5'>
                        Forgot your password?
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
                <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 5 }}>
                    <Typography variant="body1">Please enter the email address associated with your account </Typography>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', }}>
                    <div className="challengeSearchBox">
                        <input type="text"
                            className="challengeSearchInput"
                            value={email}
                            style={{width:'100%'}}
                            onChange={handleEmailChange}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendResetLink() }}
                            placeholder="Enter your email"
                        />
                        <button className="challengeSearchButton" onClick={handleSendResetLink}><SendIcon fontSize="small"/></button>
                    </div>
                </div>
                <Typography style={{ color: messageColour, marginTop: 5 }} variant="body2">{message}</Typography>

            </Container>
        </Container>
    );
};

export default ForgotPassword;
