import React, { useState, useEffect } from 'react';
import { Container, Typography, IconButton, Breadcrumbs, Link, Paper } from '@mui/material';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { useParams } from 'react-router-dom';
import SideBar from './SideBar';
import baseURL from './config';
import { generate as randomWordsGenerate } from 'random-words';
import { Remove as RemoveIcon, Add as AddIcon } from '@mui/icons-material';
import CodeSubmissionViewer from './CodeSubmissionViewer';



const ChallengeSubmissions = () => {

  const [isSmall, setIsSmall] = useState(window.innerWidth < 1150);
  const [toggleSidebar, setToggleSidebar] = useState(false)
  const [guestName, setGuestName] = useState('')
  const [isGuest, setIsGuest] = useState(true)
  const [isLoading, setIsLoading] = useState(true);
  const [challengeNotFound, setChallengeNotFound] = useState(false)
  const [challengeData, setChallengeData] = useState({});
  const [admin, setAdmin] = useState(false)
  const [deniedAccess, setDeniedAccess] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [userCompletion, setUserCompletion] = useState(false)
  const minTime = 1000;
  const maxTime = 3000;
  const { url } = useParams();

  // Sidebar position
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

  // Minimise exampleSolutionBox
  const [isMinimizedExampleSolution, setIsMinimizedExampleSolution] = useState(true);
  const toggleMinimizedMyGroups = () => {
    setIsMinimizedExampleSolution(prevState => !prevState);
    if (toggleSidebar) { setToggleSidebar(!toggleSidebar) }
  };

  // Gets challenge data from url
  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        const response = await fetch(`${baseURL}/achallenge/${url}`);
        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            setChallengeNotFound(true)
            return
          }
          setChallengeData(data);
        }
      } catch (error) {
        console.error('Error fetching challenge data', error);
      }
    };
    fetchChallengeData();
  }, [url]);

  // Checks if user accessing page created the challenge
  useEffect(() => {
    const testAdmin = async () => {
      if (challengeData[0]) {
        const guestDataResponse = await fetch(`${baseURL}/user/data`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (guestDataResponse.ok) {
          const guestData = await guestDataResponse.json();
          if (guestData.username === challengeData[0].created_by) {
            setAdmin(true)
          } else {
            setAdmin(false)
            setDeniedAccess(true)
          }
        } else {
          setAdmin(false)
          setDeniedAccess(true)
        }
      }
    };
    testAdmin();
  }, [challengeData, isGuest]);


  // Gets submissions for challenge
  const getSubmissions = async () => {
    try {
      const response1 = await fetch(
        `${baseURL}/groupchallengeid/${challengeData[0].challengeid}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response1.ok) {
        console.error('Failed to fetch groupchallengeid from challenge');
        return;
      }

      const gcid = await response1.json();

      const response = await fetch(`${baseURL}/submissions/${gcid}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) { return }
      const data = await response.json();
      if (data === null) { return }

      const groupedSubmissions = data.reduce((acc, submission) => {
        const { username } = submission;
        if (!acc[username]) {
          acc[username] = [];
        }
        acc[username].push(submission);
        return acc;
      }, {});

      const submissionsList = Object.values(groupedSubmissions);
      setSubmissions(submissionsList);
    } catch (error) {
    }
  };


  // Checks if user who didn't create the challenge has completed it
  const hasUserCompletedChallenge = async () => {
    try {
      const response1 = await fetch(
        `${baseURL}/groupchallengeid/${challengeData[0].challengeid}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!response1.ok) { return }
      const gcid = await response1.json();

      const checkCompletionResponse = await fetch(
        `${baseURL}/check-submission?username=${guestName}&challengeId=${gcid}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (!checkCompletionResponse.ok) {
        setUserCompletion(false);
        return;
      }

      const submissionExists = await checkCompletionResponse.text();
      setUserCompletion(submissionExists === 'true');
    } catch (error) {

    }
  }


  useEffect(() => {
    setIsLoading(true)
    if (challengeData.length > 0) {
      getSubmissions();
    }
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    setTimeout(() => {
      setIsLoading(false);
    }, randomTime);
  }, [challengeData]);

  useEffect(() => {
    if (challengeData[0]) {
      hasUserCompletedChallenge()
    }
  }, [challengeData, guestName]);

  useEffect(() => {
    if (!isSmall) { setToggleSidebar(false) }
  }, [isSmall]);


  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1150);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Styling
  const pageStyle = {
    height: '100vh',
    width: '100%',
    backgroundColor: '#F5F5F5',
    position: 'relative',

  };

  const mainContainerStyle = {
    marginLeft: isSmall ? '0' : sidebarPosition === 'left' ? '255px' : 'auto',
    marginRight: isSmall ? '0' : sidebarPosition === 'right' ? '255px' : 'auto',
    height: '100vh',
    width: isSmall ? '100%' : 'calc(100% - 250px)',
    overflowX: 'hidden',
    transition: '0.3s',
  };

  const exampleSolutionBox = {
    borderRadius: '10px',
    transition: 'height 0.7s cubic-bezier(0.68, -0.55, 0.27, 1.55), padding 0.5s ease',
    backgroundColor: 'white',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    height: isMinimizedExampleSolution ? '50px' : 'auto',
    boxShadow: 'none',
    borderBottom: '6px solid #dfd9d9',
    position: 'relative',
    marginTop: 4,
    overflow: 'hidden',
  };



  if (isLoading && challengeData[0]) {
    return (
      <Container sx={pageStyle} maxWidth="false">
        <SideBar
          isOpen={!isSmall}
          toggleOpen={toggleSidebar}
          setGuestName={setGuestName}
          setIsGuest={setIsGuest}
          randomWordsGenerate={randomWordsGenerate}
          guestName={guestName}
          setIsLoading={setIsLoading}
          onSnapClick={handleSnapClick}
        />

        <Container sx={mainContainerStyle} maxWidth="false">
          <Breadcrumbs sx={{ marginTop: 3 }} aria-label="breadcrumb">
            <Link color="inherit" href="/">
              Homepage
            </Link>
            <Link color="inherit">Challenge</Link>
            <Link color="inherit">Submissions</Link>
          </Breadcrumbs>

          <div style={{ display: 'flex', marginTop: 20, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {sidebarPosition === 'right' && isSmall && (
                <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                  <KeyboardDoubleArrowRightIcon />
                </IconButton>
              )}
              <Typography variant="h5">
                {challengeData[0].title} Submissions
              </Typography>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              {sidebarPosition === 'left' && (
                <div
                  style={{
                    marginLeft: sidebarPosition === 'left' ? 'auto' : '0',
                    marginRight: sidebarPosition === 'right' ? 'auto' : '0',
                  }}
                >
                  {isSmall && (
                    <IconButton onClick={handleToggleSidebar} sx={{}}>
                      <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                  )}
                </div>
              )}
            </div>
          </div>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
            <div className="loader"></div>
          </div>
        </Container>
      </Container>
    );

  }
  if ((isLoading && challengeNotFound) || (deniedAccess && isLoading)) {
    return (
      <Container sx={pageStyle} maxWidth="false">
        <SideBar
          isOpen={!isSmall}
          toggleOpen={toggleSidebar}
          setGuestName={setGuestName}
          setIsGuest={setIsGuest}
          randomWordsGenerate={randomWordsGenerate}
          guestName={guestName}
          setIsLoading={setIsLoading}
          onSnapClick={handleSnapClick}
        />

        <Container sx={mainContainerStyle} maxWidth="false">
          <Breadcrumbs sx={{ marginTop: 3 }} aria-label="breadcrumb">
            <Link color="inherit" href="/">
              Homepage
            </Link>
            <Link color="inherit">Challenge</Link>
            <Link color="inherit">Submissions</Link>
          </Breadcrumbs>

          <div style={{ display: 'flex', marginTop: 20, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {sidebarPosition === 'right' && isSmall && (
                <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                  <KeyboardDoubleArrowRightIcon />
                </IconButton>
              )}
              <Typography variant="h5">
                {challengeData[0] ? `${challengeData[0].title} Submissions` : 'Submissions'}
              </Typography>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              {sidebarPosition === 'left' && (
                <div
                  style={{
                    marginLeft: sidebarPosition === 'left' ? 'auto' : '0',
                    marginRight: sidebarPosition === 'right' ? 'auto' : '0',
                  }}
                >
                  {isSmall && (
                    <IconButton onClick={handleToggleSidebar} sx={{}}>
                      <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
            <div style={{ marginTop: 100 }} className="loader"></div>
          </div>
        </Container>
      </Container>
    );

  }
  if ((admin && challengeData[0]) || (userCompletion && challengeData[0])) {
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
            <Link color="inherit" href={`/challenge/${challengeData[0].url}`}>Challenge</Link>
            <Link color="inherit" href={`/challenge/${challengeData.length > 0 ? challengeData[0].url + '/submissions' : ''}`}>Submissions</Link>
          </Breadcrumbs>

          <div style={{ display: 'flex', marginTop: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {sidebarPosition === 'right' && isSmall && (
                <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                  <KeyboardDoubleArrowRightIcon />
                </IconButton>
              )}
              <Typography variant='h5'>
                {challengeData[0].title} Submissions
              </Typography>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              {sidebarPosition === 'left' && (
                <div style={{ marginLeft: sidebarPosition === 'left' ? 'auto' : '0', marginRight: sidebarPosition === 'right' ? 'auto' : '0', }}>
                  {isSmall && (
                    <IconButton onClick={handleToggleSidebar} sx={{}}>
                      <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                  )}

                </div>
              )}
            </div>

          </div>

          <div style={{ flex: 1, }}>
            <Paper sx={exampleSolutionBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body1">Example Solution</Typography>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>

                  <div>
                    {isMinimizedExampleSolution ? (
                      <IconButton onClick={toggleMinimizedMyGroups}>
                        <AddIcon sx={{ marginLeft: 'auto', pointerEvents: isGuest ? 'none' : 'auto' }} />
                      </IconButton>
                    ) : (
                      <IconButton onClick={toggleMinimizedMyGroups}>
                        <RemoveIcon sx={{ marginLeft: 'auto', pointerEvents: isGuest ? 'none' : 'auto' }} />
                      </IconButton>
                    )}
                  </div>

                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {isMinimizedExampleSolution ? null : (<div style={{ width: '100%' }}>  <pre style={{
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                }}>
                  {challengeData[0].example_solution}
                </pre></div>)}
              </div>

            </Paper>
          </div>



          {submissions.length > 0 ? <CodeSubmissionViewer submissions={submissions} title={challengeData[0].title} /> :
            <div style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'column' }}>
              <Typography sx={{marginTop: 1}}>There are currently 0 submissions for this challenge</Typography>
            </div>
          }
        </Container>
      </Container>
    );
  }
  else if (deniedAccess) {
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
            <Link color="inherit" href={`/challenge/${challengeData[0].url}`}>Challenge</Link>
            <Link color="inherit" href={`/challenge/${challengeData.length > 0 ? challengeData[0].url + '/submissions' : ''}`}>Submissions</Link>
          </Breadcrumbs>

          <div style={{ display: 'flex', marginTop: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {sidebarPosition === 'right' && isSmall && (
                <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                  <KeyboardDoubleArrowRightIcon />
                </IconButton>
              )}
              <Typography variant='h5'>
                {challengeData[0].title} Submissions
              </Typography>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              {sidebarPosition === 'left' && (
                <div style={{ marginLeft: sidebarPosition === 'left' ? 'auto' : '0', marginRight: sidebarPosition === 'right' ? 'auto' : '0', }}>
                  {isSmall && (
                    <IconButton onClick={handleToggleSidebar} sx={{}}>
                      <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                  )}

                </div>
              )}
            </div>
          </div>

          <Typography variant='body2'>
            You must have created or completed this challenge to view submissions
          </Typography>
        </Container>
      </Container>
    )
  }
  else if (challengeNotFound) {
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
            <Link color="inherit" href={`/challenge`}>Challenge</Link>
            <Link color="inherit" >Submissions</Link>
          </Breadcrumbs>

          <div style={{ display: 'flex', marginTop: 20, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {sidebarPosition === 'right' && isSmall && (
                <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                  <KeyboardDoubleArrowRightIcon />
                </IconButton>
              )}
              <Typography variant='h5'>
                Submissions
              </Typography>
            </div>

            <div style={{ marginLeft: 'auto' }}>
              {sidebarPosition === 'left' && (
                <div style={{ marginLeft: sidebarPosition === 'left' ? 'auto' : '0', marginRight: sidebarPosition === 'right' ? 'auto' : '0', }}>
                  {isSmall && (
                    <IconButton onClick={handleToggleSidebar} sx={{}}>
                      <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                  )}
                </div>
              )}
            </div>
          </div>
          <Typography sx={{ marginBottom: 2 }} >Challenge not found</Typography>
        </Container>
      </Container>
    )
  }
  else {
    return (
      <Container sx={pageStyle} maxWidth="false">
        <SideBar
          isOpen={!isSmall}
          toggleOpen={toggleSidebar}
          setGuestName={setGuestName}
          setIsGuest={setIsGuest}
          randomWordsGenerate={randomWordsGenerate}
          guestName={guestName}
          setIsLoading={setIsLoading}
          onSnapClick={handleSnapClick}
        />

        <Container sx={mainContainerStyle} maxWidth="false">
          <Breadcrumbs sx={{ marginTop: 3 }} aria-label="breadcrumb">
            <Link color="inherit" href="/">
              Homepage
            </Link>
            <Link color="inherit">Challenge</Link>
            <Link color="inherit">Submissions</Link>
          </Breadcrumbs>

          <div style={{ display: 'flex', marginTop: 20, flexWrap: 'wrap', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {sidebarPosition === 'right' && isSmall && (
                <IconButton onClick={handleToggleSidebar} sx={{ marginRight: '10px' }}>
                  <KeyboardDoubleArrowRightIcon />
                </IconButton>
              )}

            </div>

            <div style={{ marginLeft: 'auto' }}>
              {sidebarPosition === 'left' && (
                <div
                  style={{
                    marginLeft: sidebarPosition === 'left' ? 'auto' : '0',
                    marginRight: sidebarPosition === 'right' ? 'auto' : '0',
                  }}
                >
                  {isSmall && (
                    <IconButton onClick={handleToggleSidebar} sx={{}}>
                      <KeyboardDoubleArrowRightIcon />
                    </IconButton>
                  )}
                </div>
              )}
            </div>
          </div>
          <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', }}>
            <div className="loader"></div>
          </div>
        </Container>
      </Container>
    );
  }

}

export default ChallengeSubmissions;
