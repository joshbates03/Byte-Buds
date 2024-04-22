import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Breadcrumbs, Link, Paper } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SideBar from './SideBar';
import { generate as randomWordsGenerate } from 'random-words';


const About = () => {

  const [isSmall, setIsSmall] = useState(window.innerWidth < 1150);
  const [toggleSidebar, setToggleSidebar] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [isGuest, setIsGuest] = useState(true);
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

  const myGroupsStyle = {
    borderRadius: '10px',
    transition: 'padding 0.5s ease, height 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    backgroundColor: 'white',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    height: 'auto',
    boxShadow: 'none',
    borderBottom: '6px solid #dfd9d9',
    position: 'relative',
    marginTop: 4,
    overflow: 'hidden',
    position: 'relative',
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
          <Link color="inherit" href="/about">About</Link>
        </Breadcrumbs>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 20 }}>
          {sidebarPosition === 'right' && isSmall && (
            <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
              <KeyboardDoubleArrowRightIcon />
            </IconButton>
          )}
          <Typography variant='h5'>
            About
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

        <Paper sx={{ ...myGroupsStyle }}>
          <Typography variant="h6">
            What is ByteBuds?
          </Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            ByteBuds is a web application that aims to facilitate coding practice within lessons, making the learning experience more accessible and effective. ByteBuds provides a user-friendly environment for students to enhance their coding skills and engage in interactive programming exercises.
          </Typography>
        </Paper>

      
        <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', }}>
          <Paper sx={{ ...myGroupsStyle, marginTop: isSmall ? 1 : 1, marginRight: isSmall ? 0 : 1.25, marginBottom: isSmall ? 1 : 0 }}>
            <Typography variant="h6">
              Inspiration Behind ByteBuds
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              ByteBuds originated from my BSc thesis in Computer Science at the University of Birmingham. It was driven by a desire to address common challenges students encounter while learning to code. The platform aims to provide a user-friendly solution that enhances the learning experience. By combining academic knowledge with practical application, ByteBuds offers a valuable resource for learners of all levels.
            </Typography>
          </Paper>
        
          <Paper sx={{ ...myGroupsStyle, marginTop: isSmall ? 0 : 1, marginBottom: isSmall ? 1 : 0 }}>
            <Typography variant="h6">
              Who Can Use ByteBuds
            </Typography>
            <Typography variant="body1" sx={{ marginTop: 2 }}>
              Originally designed for teachers and students in classroom environments, ByteBuds evolved to become accessible to anyone interested in coding. While initially intended to support learning within academic settings, its development process led to the creation of a versatile platform suitable for learners of all backgrounds and skill levels. Whether you're a student, educator, or coding enthusiast, ByteBuds provides a user-friendly environment to enhance your coding skills.
            </Typography>
          </Paper>
        </div>
        <Paper sx={{ ...myGroupsStyle, marginTop: isSmall ? 0 : 1, marginBottom: isSmall ? 1:0}}>
          <Typography variant="h6">
            User Feedback
          </Typography>
          <Typography variant="body1" style={{ marginTop: 2 }}>
          Your input is vital for ByteBuds. Please select the survey you wish to complete. 
          </Typography>
          <button
            style={{ color: 'white', width: '100%', backgroundColor: 'purple', margin: '5px auto' }}
            className="actionButton"
            onClick={() => window.open('https://docs.google.com/forms/d/19z3U0qBWFEJH3J8NITqm2c_6ZzZ3MHmK-UbDss0UKvY', '_blank', 'noopener,noreferrer')}
          >
            <div className="text">Initial Teacher Survey</div>
          </button>
          <button
            style={{ color: 'white', width: '100%', backgroundColor: 'purple', margin: '5px auto' }}
            className="actionButton"
            onClick={() => window.open('https://docs.google.com/forms/d/13aKXzdflOkq-U0Zp8LpGeOl99pAIam192jxkfKdOfi0', '_blank', 'noopener,noreferrer')}
          >
            <div className="text">Post Teacher Survey</div>
          </button>
          <button
            style={{ color: 'white', width: '100%', backgroundColor: 'purple', margin: '5px auto' }}
            className="actionButton"
            onClick={() => window.open('https://docs.google.com/forms/d/1f-IM1YzPNj2mal69IbjdalXMIKxkB6vyr4EGLlGykEU', '_blank', 'noopener,noreferrer')}
          >
            <div className="text">Initial Student Survey</div>
          </button>
          <button
            style={{ color: 'white', width: '100%', backgroundColor: 'purple', margin: '5px auto' }}
            className="actionButton"
            onClick={() => window.open('https://docs.google.com/forms/d/1YlV_lLVmfqCPPxGOOPZar15vZDE4t40nk_x2zBnvuCo', '_blank', 'noopener,noreferrer')}
          >
            <div className="text">Post Student Survey</div>
          </button>
        </Paper>

      </Container>
    </Container>
  );

};

export default About;
