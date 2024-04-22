import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Breadcrumbs, Link } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SideBar from './SideBar';
import { useLocation } from 'react-router-dom';
import './Textfield.css';
import './ButtonStyles.css';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { generate as randomWordsGenerate } from 'random-words';
import baseURL from './config';


const ResetPassword = () => {

    const [isSmall, setIsSmall] = useState(window.innerWidth < 1150);
    const [toggleSidebar, setToggleSidebar] = useState(false)
    const [guestName, setGuestName] = useState('')
    const [, setIsGuest] = useState(true)
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [noToken, setNoToken] = useState(false)
    const [showMessage, setShowMessage] = useState(false)
    const [messageColour, setMessageColour] = useState('green')
    const minTime = 1000;
    const maxTime = 3000;

    const decodeToken = (token) => {
        try {
            const [, payloadBase64] = token.split('.');
            const decodedPayload = atob(payloadBase64);
            const payload = JSON.parse(decodedPayload);
            const { email } = payload;
            return email;
        } catch (error) {
            console.error('Error decoding token:', error.message);
            setNoToken(true)
            return null;
        }
    };

    const checkTokenValidity = async () => {
        try {
            const response = await fetch(`${baseURL}/validatereset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (response.ok) {
                setNoToken(false);
            } else {
                setNoToken(true);
            }
        } catch (error) {
            console.error('Error occurred during token validation: ', error);
        }
    };




    useEffect(() => {
        if (token) {
            checkTokenValidity()
        } else {
            setNoToken(true);
        }
        const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
        setTimeout(() => {
            setIsLoading(false);
        }, randomTime);
    }, [token, ]);

    useEffect(() => {
        if (token) {
            const decodedEmail = decodeToken(token);
            if (decodedEmail) {
                setEmail(decodedEmail);
            }
        } else {
            setNoToken(true);
        }
        const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
        setTimeout(() => {
            setIsLoading(false);
        }, randomTime);
    }, [token]);

    const handlePasswordChange = (e) => {
        setNewPassword(e.target.value);
    };

    const handleResetPassword = async () => {
        try {
            setMessageColour('green')
            if (newPassword.length < 8) {
                setShowMessage(true)
                setMessage('Your password must be longer than 8 characters')
                setMessageColour('red')
                setTimeout(() => {
                    setMessage('')
                    setShowMessage(false)
                }, 3000);
                return;
            }

            const response = await fetch(`${baseURL}/resetpassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    newPassword,
                }),
            });

            if (response.ok) {
                setShowMessage(true)
                setMessage('You have successfully changed your password!')
                setNewPassword('')
            } else {
                const errorMessage = await response.text();
                console.error(errorMessage);
            }
        } catch (error) {
            console.error(error);
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

    const pageStyle = {
        height: '100vh',
        width: '100%',
        backgroundColor: '#F5F5F5',
        position: 'relative',
    };


    if (isLoading) {
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
                        <Link color="inherit" >Reset Password</Link>
                    </Breadcrumbs>

                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                        {sidebarPosition === 'right' && isSmall && (
                            <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                                <KeyboardDoubleArrowRightIcon />
                            </IconButton>
                        )}
                        <Typography variant='h5'>
                            Reset your password
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
                    <div style={{ height: '280px', top: '50%', left: '50%', alignItems: 'center', justifyContent: 'center', display: 'flex', }}>
                        <div style={{ marginTop: 100 }} className="loader"></div>
                    </div>
                </Container>
            </Container>
        );
    }

    if (noToken) {
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
                        <Link color="inherit" >Reset Password</Link>
                    </Breadcrumbs>

                    <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                        {sidebarPosition === 'right' && isSmall && (
                            <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                                <KeyboardDoubleArrowRightIcon />
                            </IconButton>
                        )}
                        <Typography variant='h5'>
                            Reset your password
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

                    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 13 }}>
                        <Typography variant="body1">Invalid link</Typography>
                    </div>
                </Container>
            </Container>
        );
    }


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
                    <Link color="inherit" >Reset Password</Link>
                </Breadcrumbs>

                <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
                    {sidebarPosition === 'right' && isSmall && (
                        <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                            <KeyboardDoubleArrowRightIcon />
                        </IconButton>
                    )}
                    <Typography variant='h5'>
                        Reset your password
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
                    <Typography variant="body1">Please enter your new password, associated with {email}</Typography>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', }}>
                    <div className="challengeSearchBox">
                        <input type="password"
                            className="challengeSearchInput"
                            onKeyDown={(e) => { if (e.key === 'Enter') handleResetPassword() }}
                            value={newPassword} onChange={handlePasswordChange}
                            placeholder="Enter your new password"
                        />
                        <button className="challengeSearchButton" onClick={handleResetPassword}><SaveAltIcon fontSize="small" /></button>
                    </div>
                </div>

                {showMessage && (
                    <Typography sx={{ color: messageColour, marginTop: 1 }} variant="body2">
                        {message}
                    </Typography>
                )}

            </Container>
        </Container>
    );
};

export default ResetPassword;
