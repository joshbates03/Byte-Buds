import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, IconButton, Breadcrumbs, Link, } from '@mui/material';
import SideBar from './SideBar';
import CommunityChallenges from './CommunityChallenges';
import { Search as SearchIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import './Textfield.css';
import './ButtonStyles.css';
import { generate as randomWordsGenerate } from 'random-words';

const Homepage = () => {
  const navigate = useNavigate()
  const loggedIn = localStorage.getItem('loggedIn');
  const initialIsGuest = loggedIn === 'true';
  const [, setIsGuest] = useState(!initialIsGuest);
  const [isSmall, setIsSmall] = useState(window.innerWidth < 1150);
  const [guestName, setGuestName] = useState('')
  const [, setIsLoading] = useState(true);
 

  // Challenge code search
  const [challengeCode, setChallengeCode] = useState('')
  const handleChallengeSearch = () => {
    if (challengeCode === '') { return }
    navigate(`/challenge/${challengeCode}`);
  };

  // Component updater (passed into various components)
  const [updater, ] = useState(0)

 
  // Sidebar
  const [toggleSidebar, setToggleSidebar] = useState(false)
  const handleToggleSidebar = () => { setToggleSidebar(!toggleSidebar) }
  const [sidebarPosition, setSidebarPosition] = useState(localStorage.getItem('sidebarPosition') || 'right');
  const [snapClick, setSnapClick] = useState(0) 
  const handleSnapClick = () => { setSnapClick(prevValue => prevValue + 1) };

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


  // Styling
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

  return (
    <Container sx={pageStyle} maxWidth="false">
      <SideBar isOpen={!isSmall}
        toggleOpen={toggleSidebar}
        setGuestName={setGuestName}
        setIsGuest={setIsGuest}
        randomWordsGenerate={randomWordsGenerate}
        guestName={guestName}
        setIsLoading={setIsLoading}
        onSnapClick={handleSnapClick}
      />
      <Container sx={mainContainerStyle} maxWidth="false">
        <div>
          <Breadcrumbs sx={{ marginTop: 3 }} aria-label="breadcrumb">
            <Link color="inherit" href="/">Homepage</Link>
          </Breadcrumbs>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
            {sidebarPosition === 'right' && isSmall && (
              <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                <KeyboardDoubleArrowRightIcon />
              </IconButton>
            )}
            <Typography variant='h5'>Community Challenges</Typography>
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

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1">Welcome, {localStorage.getItem('username')}</Typography>
            <div style={{ display: 'flex', alignItems: 'center', }}>
              <div className="challengeSearchBox">
                <input type="text"
                style={{width:'100%'}}
                  className="challengeSearchInput"
                  value={challengeCode}
                  onChange={(e) => { if (e.target.value.length <= 10) { setChallengeCode(e.target.value) } }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleChallengeSearch() }}
                  placeholder="Enter a challenge code"
                />
                <button className="challengeSearchButton" onClick={handleChallengeSearch}><SearchIcon /></button>
              </div>
            </div>
          </div>

          <div style={{ marginLeft: -6 }}>
            <CommunityChallenges isSmall={isSmall} updater={updater} guestName={localStorage.getItem('username')} />
          </div>
        </div>
      </Container>
    </Container>
  );
};

export default Homepage;
