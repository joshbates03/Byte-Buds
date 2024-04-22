import { Typography, Button, TextField, Collapse, IconButton } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import React, { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import baseURL from './config'
import Cookies from 'js-cookie';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SwitchLeftIcon from '@mui/icons-material/SwitchLeft';
import LoginIcon from '@mui/icons-material/Login';
import SwitchRightIcon from '@mui/icons-material/SwitchRight';
import './ButtonStyles.css';
const SideBar = ({ isOpen, toggleOpen, setGuestName, setIsGuest, randomWordsGenerate, guestName, setIsLoading, onSnapClick }) => {
  const [messageColour, setMessageColour] = useState('red')
  //Navigate to different routes
  const [updater, setUpdater] = useState(0)
  const navigate = useNavigate()
  const currentPathname = window.location.pathname

  //Remove cookies
  // Function to clear the user_access cookie
  function clearUserCookie() {
    fetch(`${baseURL}/clear-user-cookie`, {
      method: 'GET'
    })
      .then(response => response.text())
      .then(data => {

      })
      .catch(error => console.error('Error:', error));

  }

  // Function to clear the guest_access cookie
  function clearGuestCookie() {
    fetch(`${baseURL}/clear-guest-cookie`, {
      method: 'GET'
    })
      .then(response => response.text())
      .then(data => {


      })
      .catch(error => console.error('Error:', error));
  }

  //Sign up
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [surname, setSurname] = useState('')
  const [signupPassword, setSignupPassword] = useState('');
  const [signUpMessage, setSignUpMessage] = useState('')

  const handleSignUpUsernameChange = (event) => { setUsername(event.target.value) }
  const handleEmailChange = (event) => { setEmail(event.target.value) }
  const handleFirstNameChange = (event) => { setFirstName(event.target.value) }
  const handleSurnameChange = (event) => { setSurname(event.target.value) }
  const handleSignupPasswordChange = (event) => { setSignupPassword(event.target.value) }

  const handleSignUp = async () => {
    try {
      //Exit if a field is empty
      if (username === ''
        || email === ''
        || firstName === ''
        || surname === ''
        || signupPassword === '') {
        setSignUpMessage("Please fill in all fields")
        return
      }
      //Account to be made
      let newAccount = {
        "username": username,
        "email": email,
        "firstname": firstName,
        "surname": surname,
        "password": signupPassword
      }
      //Server request to create account
      const response = await fetch(`${baseURL}/create/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      });
      //Recieved data from server
      const responseData = await response.json();
      //Sever handles messgae responses
      setMessageColour('#ff2128')

      if (responseData === "Username format invalid") {
        setUsername('')
        setSignUpMessage("Usernames must be between 5 and 15 characters")
      }
      else if (responseData === "Email format invalid") {
        setEmail('')
        setSignUpMessage("Please enter a valid email")
      }
      else if (responseData === "Password format invalid") {
        setSignupPassword('')
        setSignUpMessage("Passwords must be minimum 8 characters")
      }
      else if (responseData === "Username already exists") {
        setUsername('')
        setSignUpMessage(responseData)
      }
      else if (responseData === "Email is already registered") {
        setEmail('')
        setSignUpMessage(responseData)
      }
      else {
        //Set all fields back to empty
        setMessageColour('#07f82e')
        setFirstName('')
        setSurname('')
        setEmail('')
        setUsername('')
        setSignupPassword('')
        setSignUpMessage("")
        setShowSignUpForm(false)
        setTimeout(() => {
          setShowLoginForm(prevState => !prevState);
        }, 550);
      }



    }
    //Display server-side error to user
    catch (error) {
      setSignUpMessage("An error occured")
      setTimeout(function () {
        setSignUpMessage("")
      }, 2500);
    }
  }

  const [showSignUpForm, setShowSignUpForm] = useState(false);

  const handleSignUpButtonClick = () => {
    setLoginMessage('')
    if (showLoginForm === true) {
      setShowLoginForm(false)
      setTimeout(() => {
        setShowSignUpForm(prevState => !prevState);
      }, 550);
    }
    else { setShowSignUpForm(!showSignUpForm) }
  }

  //Login
  const [loginUsernameOrEmail, setLoginUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('');
  const loggedIn = localStorage.getItem('loggedIn');
  const initialLoggedIn = loggedIn === 'true';
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);

  const checkUserLoginStatus = async () => {
    try {
      const userResponse = await fetch(`${baseURL}/user/data`, {
        method: 'GET',
        credentials: 'include',
      });
      if (userResponse.status === 200) {
        const userData = await userResponse.json();

        setGuestName(userData.username)
        localStorage.setItem('username', userData.username)

        setIsLoggedIn(true);
        setIsGuest(false)
        setShowLoginForm(false)
      }
      else {
        setIsLoggedIn(false);
        localStorage.removeItem('loggedIn')

        setIsGuest(true)

        try {
          const guestResponse = await fetch(`${baseURL}/guest/data`, {
            method: 'GET',
            credentials: 'include',
          });

          if (guestResponse.status === 200) {
            const guestData = await guestResponse.json();

            setGuestName(guestData)
            localStorage.setItem('username', guestData)
          }
          else {

            const randomWords = randomWordsGenerate({ exactly: 2, join: '-' });
            const capitalizedID = randomWords
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join('');
            const x = { "id": capitalizedID }


            const response = await fetch(`${baseURL}/guest/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(x),
            });

            const responseData = await response.json();
            if (response.status === 200) {
              const token = responseData.token;
              const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 24 hours
              if (process.env.NODE_ENV === 'production') {

                Cookies.set('guest_access', token, {
                  expires: new Date(Date.now() + oneDayInMilliseconds), // 1 day expiration
                  path: '/',
                  sameSite: 'none',
                  secure: true

                });

              } else {

                Cookies.set('guest_access', token, {
                  expires: new Date(Date.now() + oneDayInMilliseconds), // 1 day expiration
                  path: '/',
                });
              }
              try {
                const guestResponse = await fetch(`${baseURL}/guest/data`, {
                  method: 'GET',
                  credentials: 'include',
                });

                if (guestResponse.status === 200) {
                  const guestData = await guestResponse.json();

                  setGuestName(guestData)
                  localStorage.setItem('username', guestData)
                }
              } catch { }
            }
          }

        }
        catch (error) { }
      }

    } catch (error) {
      console.error('Error checking user login status:', error);
      setIsLoggedIn(false);
      setIsGuest(true)

    }
  };

  useEffect(() => {
    checkUserLoginStatus();
  }, [updater]);

  const [loginMessage, setLoginMessage] = useState('')
  const [showLoginForm, setShowLoginForm] = useState(false)

  const handleLoginButtonClick = () => {
    setSignUpMessage('')
    if (showSignUpForm === true) {
      setShowSignUpForm(false)
      setTimeout(() => {
        setShowLoginForm(prevState => !prevState);
      }, 550);
    }
    else { setShowLoginForm(!showLoginForm) };
  }

  const handleUsernameChange = (event) => { setLoginUsernameOrEmail(event.target.value) }
  const handlePasswordChange = (event) => { setPassword(event.target.value) }

  const handleLogin = async () => {
    try {
      setMessageColour('#ff2128')
      if (loginUsernameOrEmail === '' || password === '') {
        setLoginMessage("Please fill in all fields")
        return
      }
      //Account to log in
      let loginEmail = '';
      let loginUsername = '';
      //Determine whether a username or email was entered
      if (loginUsernameOrEmail.includes("@")) { loginEmail = loginUsernameOrEmail }
      else { loginUsername = loginUsernameOrEmail }
      //Json for user to login
      const loginDetails = { "email": loginEmail, "username": loginUsername, "password": password };
      //Server request to login
      const response = await fetch(`${baseURL}/user/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginDetails),
      })
      //Recieved data from server
      const responseData = await response.json();
      if (!response.ok) {
        setLoginMessage("Invalid login details")
        return;
      }
      //If response data is ok
      if (response.status === 200) {
        setLoginMessage("")
        clearGuestCookie()
        document.cookie = 'guest_access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        //Get token from response
        const token = responseData.token;
        //Create user access cookie
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000
        if (process.env.NODE_ENV === 'production') {

          Cookies.set('user_access', token, {
            expires: new Date(Date.now() + oneDayInMilliseconds), // 1 day expiration
            path: '/',
            sameSite: 'none',
            secure: true
          });
        } else {

          Cookies.set('user_access', token, {
            expires: new Date(Date.now() + oneDayInMilliseconds), // 1 day expiration
            path: '/',
          });
        }
        setLoginUsernameOrEmail('')
        setPassword('')
        localStorage.setItem('loggedIn', true)
        //Update sidebar
        checkUserLoginStatus()

        return;
      }
      
    } catch (error) {
      
    }

  };

  //If local storage is modified, it sets it back to its original value
  window.addEventListener('storage', (event) => {
    if (event.key === 'username') {
      localStorage.setItem('username', guestName);
    }
    if (event.key === 'loggedIn') {
      localStorage.setItem('loggedIn', 'true');
    }
    if (event.key === 'sidebarPosition') {
      if (isSnapped) { localStorage.setItem('sidebarPosition', 'right'); }
      else { localStorage.setItem('sidebarPosition', 'left') }

    }
  });

  const signOut = () => {
    clearUserCookie();
    setUpdater(prevUpdater => prevUpdater + 1);
    document.cookie = 'user_access=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  // Navigation
  const navigateAbout = () => {
    navigate('/about');
  }
  const navigateHomepage = () => {
    navigate('/')
  }
  const navigateDash = () => {
    navigate('/dashboard')
  }

  // Sidebar position
  const [isSnapped, setIsSnapped] = useState(localStorage.getItem('sidebarPosition') === 'right');

  useEffect(() => {
    let sidebarPositionX = localStorage.getItem('sidebarPosition');
    if (!sidebarPositionX) {
      sidebarPositionX = 'left';
      localStorage.setItem('sidebarPosition', sidebarPositionX);
    }
    const sidebarPosition = localStorage.getItem('sidebarPosition');
    if (sidebarPosition === 'right') {
      setIsSnapped(true);
    } else {
      setIsSnapped(false)
    }
  }, []);

  const updateSidebarPosition = (position) => {
    localStorage.setItem('sidebarPosition', position);
  };

  const toggleSnappedPosition = () => {
    setIsSnapped(!isSnapped);
    updateSidebarPosition(isSnapped ? 'left' : 'right');
    onSnapClick()
  };

  // Styles
  const sidebarStyle = {
    width: isOpen || toggleOpen ? '250px' : '0',
    height: '100%',
    position: 'fixed',
    right: isSnapped ? '0' : 'auto',
    left: isSnapped ? 'auto' : '0',
    backgroundColor: '#333',
    overflowX: 'hidden',
    transition: 'width 0.3s ease',
    zIndex: 99,
    boxShadow: isOpen || toggleOpen ? '0px 3px 8px rgba(0, 0, 0, 0.3)' : 'none',
    borderRight: isSnapped || !isOpen ? 'none' : '10px solid rgba(0, 0, 0, .3)',
    borderLeft: isSnapped && isOpen ? '10px solid rgba(0, 0, 0, .3)' : 'none',
  };

  const separatorStyle = {
    width: '100%',
    height: '1px',
    color: isOpen || toggleOpen ? 'white' : 'transparent',
    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%, rgba(255, 255, 255, 0) 100%)',
    margin: '10px 0',
    marginBottom: 25
  };

  return (
    <div style={sidebarStyle}>
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          alignItems: 'center',
          display: 'flex',
          justifyContent: 'center',
          marginTop: 3,
          fontFamily: 'Roboto, sans-serif',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        Byte Buds
      </Typography>

      {!isLoggedIn && (<div style={{ display: 'flex', justifyContent: 'center' }}>
        <IconButton onClick={handleLoginButtonClick} sx={{}}>
          <LoginIcon sx={{ color: 'white' }} />
        </IconButton>

        <IconButton onClick={handleSignUpButtonClick} sx={{}}>
          <PersonAddAlt1Icon sx={{ color: 'white' }} />
        </IconButton>
      </div>
      )}

      {isLoggedIn && (
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='body1' sx={{ marginRight: 1, color: 'white' }}>
            User:
          </Typography>
          <Typography variant='body1' sx={{ marginRight: 0.5, fontWeight: 'bold', color: 'white' }}>
            {localStorage.getItem('username')}
          </Typography>
          <IconButton onClick={signOut} sx={{}}>
            <ExitToAppIcon sx={{ color: 'white' }} />
          </IconButton>
        </div>
      )}

      <Collapse in={showLoginForm} timeout="auto" unmountOnExit>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', }} className="input-wrapper">
            <input
              style={{ marginBottom: 10, width: '74%' }}
              placeholder="Username"
              name="username"
              value={loginUsernameOrEmail}
              onChange={handleUsernameChange}
              type="text"
            />
          </div>
        
          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', }} className="input-wrapper">
            <input
              style={{ marginBottom: 10, width: '74%' }}
              placeholder="Password"
              name="password"
              value={password}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
              onChange={handlePasswordChange}
              type="password"
            />
          </div>
          <button onClick={handleLogin} style={{ color: isOpen || toggleOpen ? 'white' : 'transparent', width: '80%', marginTop: 4 }} className="actionButton">
            <div className="text">Login</div>
          </button>
          <Typography variant="body2" style={{ color: `${messageColour}`, maxWidth: '190px', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            {loginMessage}
          </Typography>
          <Link to="/forgot-password" variant="subtitle" style={{ textDecoration: 'underline', color: 'white', fontSize: 'smaller', }}>
            Forgot Password?
          </Link>
        </div>
      </Collapse>

      <Collapse in={showSignUpForm} timeout="auto" unmountOnExit>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }} className="input-wrapper">
            <input
              style={{ marginBottom: 10, width: '74%' }}
              placeholder="Username"
              name="username"
              value={username}
              onChange={handleSignUpUsernameChange}
              required
              type="text"
            />
          </div>

          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }} className="input-wrapper">
            <input
              style={{ marginBottom: 10, width: '74%' }}
              placeholder="Email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              required
              type="email"
            />
          </div>

          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }} className="input-wrapper">
            <input
              style={{ marginBottom: 10, width: '74%' }}
              placeholder="First Name"
              name="firstName"
              value={firstName}
              onChange={handleFirstNameChange}
              required
              type="text"
            />
          </div>

          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }} className="input-wrapper">
            <input
              style={{ marginBottom: 10, width: '74%' }}
              placeholder="Surname"
              name="surname"
              value={surname}
              onChange={handleSurnameChange}
              required
              type="text"
            />
          </div>

          <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }} className="input-wrapper">
            <input
              style={{ marginBottom: 10, width: '74%' }}
              placeholder="Password"
              name="password"
              value={signupPassword}
              onChange={handleSignupPasswordChange}
              required
              type="password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSignUp();
              }}
            />
          </div>

          <button onClick={handleSignUp} style={{ color: isOpen || toggleOpen ? 'white' : 'transparent', width: '80%', marginTop: 4 }} className="actionButton">
            <div className="text">Sign Up</div>
          </button>

          <Typography variant="body2" style={{ color: `${messageColour}`, maxWidth: '190px', marginTop: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', }}>
            {signUpMessage}
          </Typography>
        </div>
      </Collapse>

      {isOpen || toggleOpen ? (
        <div style={separatorStyle}></div>
      ) : null}

      <button onClick={navigateHomepage} style={{ color: isOpen || toggleOpen ? 'white' : 'transparent', width: '80%', backgroundColor: currentPathname !== '/' ? '#3f3f3f' : 'auto', margin: '10px auto', }} className="actionButton">
        <div className="text">Homepage</div>
      </button>

      <button onClick={navigateDash} style={{ color: isOpen || toggleOpen ? 'white' : 'transparent', width: '80%', backgroundColor: currentPathname !== '/dashboard' ? '#3f3f3f' : 'auto', margin: '10px auto', }} className="actionButton">
        <div className="text">Dashboard</div>
      </button>

      <button onClick={navigateAbout} style={{ color: isOpen || toggleOpen ? 'white' : 'transparent', width: '80%', backgroundColor: currentPathname !== '/about' ? '#3f3f3f' : 'auto', margin: '10px auto', }} className="actionButton">
        <div className="text">About</div>
      </button>

      <IconButton onClick={toggleSnappedPosition} style={{
        color: 'white', position: 'absolute',
        bottom: '20px', 
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
      }}>
        {isSnapped ? <SwitchRightIcon /> : <SwitchLeftIcon />}
      </IconButton>
    </div>
  );
};

export default SideBar;
