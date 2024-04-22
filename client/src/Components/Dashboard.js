import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, IconButton, Breadcrumbs, Link, } from '@mui/material';
import SideBar from './SideBar';
import MyGroups from './MyGroups';
import ManageGroupDashboard from './ManageGroupDashboard';
import JoinedGroups from './JoinedGroups';
import { Remove as RemoveIcon, Add as AddIcon, KeyboardDoubleArrowRight as KeyboardDoubleArrowRightIcon } from '@mui/icons-material';
import './Textfield.css';
import './ButtonStyles.css';
import { generate as randomWordsGenerate } from 'random-words';
import HelpIcon from '@mui/icons-material/Help';

import Tooltip from '@mui/material/Tooltip';

const Dashboard = () => {
  const loggedIn = localStorage.getItem('loggedIn');
  const initialIsGuest = loggedIn === 'true';
  const [isGuest, setIsGuest] = useState(!initialIsGuest);
  const [isSmall, setIsSmall] = useState(window.innerWidth < 1150);
  const [guestName, setGuestName] = useState('')
  const [, setIsLoading] = useState(true);
  const [manageGroup, setManageGroup] = useState('');

  // Component updater (passed into various components)
  const [updater, setUpdater] = useState(0)

  // General state updater
  const updateState = (newValue) => {
    setUpdater(newValue);
  };

  // Updates the group being managed (passed into ManageGroupDashboard)
  const updateManageGroup = (newManageGroup) => { setManageGroup(newManageGroup) };

  const handleManageGroup = (value) => {
    setManageGroup(value);
    setIsMinimizedGroupDash(false);
  };

  // Sidebar
  const [toggleSidebar, setToggleSidebar] = useState(false)
  const handleToggleSidebar = () => { setToggleSidebar(!toggleSidebar) }
  const [sidebarPosition, setSidebarPosition] = useState(localStorage.getItem('sidebarPosition') || 'right');
  const [snapClick, setSnapClick] = useState(0) // Each time the sidebar snap is clicked it sends an update
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

  // Minimises all boxes if not logged in
  useEffect(() => {
    if (isGuest) {
      setIsMinimizedGroupDash(true)
      setIsMinimizedMyGroups(true)
      setIsMinimizedJoinedGroups(true)
    }
  }, [isGuest]);

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

  // Minimise boxes
  const [isMinimizedMyGroups, setIsMinimizedMyGroups] = useState(true);
  const toggleMinimizedMyGroups = () => {
    setIsMinimizedMyGroups(prevState => !prevState);
    if (toggleSidebar) { setToggleSidebar(!toggleSidebar) }
  };

  const [isMinimizedJoinedGroups, setIsMinimizedJoinedGroups] = useState(true);
  const toggleMinimizedJoinedGroups = () => {
    setIsMinimizedJoinedGroups(prevState => !prevState);
    if (toggleSidebar) { setToggleSidebar(!toggleSidebar) }
  };

  const [isMinimizedGroupDash, setIsMinimizedGroupDash] = useState(true);
  const toggleMinimizeGroupDash = () => {
    if (toggleSidebar) { setToggleSidebar(!toggleSidebar) }
    setIsMinimizedGroupDash(prevState => !prevState);
  };

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

  const myGroupsStyle = {
    transition: 'padding 0.5s ease, height 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    backgroundColor: isGuest ? '#f0f0f0' : 'white',
    opacity: isGuest ? 0.7 : 1,
    pointerEvents: isGuest ? 'none' : 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: isMinimizedMyGroups ? '20px' : '20px',
    height: isMinimizedMyGroups ? '50px' : '460px',
    boxShadow: 'none',
    overflow: 'hidden',
    borderBottom: '6px solid #dfd9d9',
    borderRadius: '10px',
    position: 'relative',
    marginRight: isSmall ? '0px' : '10px',
    marginBottom: isSmall ? '10px' : '0px'
  }

  const joinedGroupStyle = {
    backgroundColor: isGuest ? '#f0f0f0' : 'white',
    opacity: isGuest ? 0.7 : 1,
    pointerEvents: isGuest ? 'none' : 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: isMinimizedJoinedGroups ? '20px' : '20px',
    height: isMinimizedJoinedGroups ? '50px' : '460px',
    transition: 'padding 0.5s ease, height 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    boxShadow: 'none',
    overflow: 'hidden',
    borderBottom: '6px solid #dfd9d9',

    borderRadius: '10px',
    position: 'relative',
    marginRight: isSmall ? '0px' : '10px',
    marginBottom: isSmall ? '10px' : '0px',
  }

  const manageGroupDashboardStyle = {
    backgroundColor: isGuest ? '#f0f0f0' : 'white',
    opacity: isGuest ? 0.7 : 1,
    pointerEvents: isGuest ? 'none' : 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: isMinimizedGroupDash ? '20px' : '20px',
    height: isMinimizedGroupDash ? '50px' : (isSmall ? manageGroup === '' ? '100px' : '850px' : manageGroup === '' ? '100px' : '600px'),
    transition: 'padding 0.5s ease, height 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    boxShadow: 'none',
    overflow: 'hidden',
    borderBottom: '6px solid #dfd9d9',
    borderRadius: '10px',
    position: 'relative',
    marginRight: isSmall ? '0px' : '10px',
    marginBottom: isSmall ? '10px' : '0px',
    marginTop: isSmall ? '0px' : '10px',
  }

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
            <Link color="inherit" href="/dashboard">Dashboard</Link>
          </Breadcrumbs>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
            {sidebarPosition === 'right' && isSmall && (
              <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                <KeyboardDoubleArrowRightIcon />
              </IconButton>
            )}
            <Typography variant='h5'>Dashboard</Typography>
            {isGuest && (
              <Tooltip
               className='scale-in-center'
                placement="bottom"
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'transparent',
                      '& .MuiTooltip-arrow': {
                        color: 'transparent',
                      },
                    },
                  },
                }}
               
                title={
                  <>
                    <div style={{ backgroundColor: 'purple', padding: 10, borderTopLeftRadius: '10px', borderTopRightRadius: '10px', width: '325px', }}>
                      <Typography variant='body2' sx={{ color: 'white', }} color="inherit">
                        Dashboard
                      </Typography>
                    </div>
                    <div style={{ backgroundColor: '#e9e9e9', padding: 10, borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderBottom: '6px solid #dfd9d9', width: '325px' }}>
                      <Typography variant='body2' sx={{ color: 'black', }} color="inherit">
                        To utilize the dashboard features, an account is required. With authenticated access, users can create and manage groups and challenges, as well as view and participate in joined groups.
                      </Typography>

                    </div>
                  </>

                }
              >
                <HelpIcon sx={{ color: 'purple', marginLeft: 1 }} />
              </Tooltip>
            )}
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
          {isGuest && (<Typography variant="body1">Guest access, {localStorage.getItem('username')}</Typography>)}
          {!isGuest && (<Typography variant="body1">Logged in as, {localStorage.getItem('username')}</Typography>)}
            
          </div>
          <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', marginTop: 10, transition: 'height 0.3s ease', }}>
            <div style={{ flex: 1, }}>
              <Paper sx={myGroupsStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">My Groups</Typography>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!isGuest && (
                      <div>
                        {isMinimizedMyGroups ? (
                          <IconButton onClick={toggleMinimizedMyGroups}>
                            <AddIcon sx={{ marginLeft: 'auto', pointerEvents: isGuest ? 'none' : 'auto' }} />
                          </IconButton>
                        ) : (
                          <IconButton onClick={toggleMinimizedMyGroups}>
                            <RemoveIcon sx={{ marginLeft: 'auto', pointerEvents: isGuest ? 'none' : 'auto' }} />
                          </IconButton>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isGuest ? (<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{isMinimizedMyGroups ? null : (<Typography>Create an account to access this</Typography>)}</div>)
                  :
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {isMinimizedMyGroups ? null : (<div style={{ width: '100%' }}><MyGroups username={guestName} onManageGroup={handleManageGroup} isSmall={isSmall} updater={updater} /></div>)}
                  </div>
                }
              </Paper>
            </div>

            <div style={{ flex: 1 }}>
              <Paper sx={joinedGroupStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body1">My Joined Groups</Typography>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!isGuest && (
                      <div>
                        {isMinimizedJoinedGroups ? (
                          <IconButton onClick={toggleMinimizedJoinedGroups}>
                            <AddIcon sx={{ marginLeft: 'auto', pointerEvents: isGuest ? 'none' : 'auto' }} />
                          </IconButton>
                        ) : (
                          <IconButton onClick={toggleMinimizedJoinedGroups}>
                            <RemoveIcon sx={{ marginLeft: 'auto', pointerEvents: isGuest ? 'none' : 'auto' }} />
                          </IconButton>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isGuest ? (<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{isMinimizedJoinedGroups ? null : (
                  <Typography>
                    Create an account to access this
                  </Typography>
                )}</div>)
                  :
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {isMinimizedJoinedGroups ? null : (
                      <div style={{ width: '100%' }}>
                        <JoinedGroups onManageGroup={handleManageGroup} updater={updater} />
                      </div>
                    )}
                  </div>
                }
              </Paper>
            </div>
          </div>

          <div style={{ flex: 1, marginBottom: 25 }}>
            <Paper sx={manageGroupDashboardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">Group Dashboard</Typography>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {!isGuest && (
                    <div>
                      {isMinimizedGroupDash ? (
                        <IconButton onClick={toggleMinimizeGroupDash}>
                          <AddIcon sx={{ marginLeft: 'auto', pointerEvents: isGuest ? 'none' : 'auto' }} />
                        </IconButton>
                      ) : (
                        <IconButton onClick={toggleMinimizeGroupDash}>
                          <RemoveIcon sx={{ marginLeft: 'auto', pointerEvents: isGuest ? 'none' : 'auto' }} />
                        </IconButton>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {isGuest ? (<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{isMinimizedGroupDash ? null : (
                <Typography >
                  Create an account to access this
                </Typography>
              )}</div>)
                :
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ width: '100%' }}>
                    <ManageGroupDashboard isSmall={isSmall} group={manageGroup} updateManageGroup={updateManageGroup} minimized={isMinimizedGroupDash} updater={updater} updateState={updateState} />
                  </div>
                </div>
              }
            </Paper>
          </div>
        </div>
      </Container>
    </Container>
  );
};

export default Dashboard;
