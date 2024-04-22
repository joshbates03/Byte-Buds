import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as AttemptIcon } from './icons/attempt.svg';
import { ReactComponent as SubmissionsIcon } from './icons/submissions.svg';
import { ReactComponent as RedStarIcon } from './icons/redstar.svg';
import { ReactComponent as OrangeStarIcon } from './icons/orangestar.svg';
import { ReactComponent as GreenStarIcon } from './icons/greenstar.svg';
import { ReactComponent as CompleteIcon } from './icons/complete.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import { Paper, Typography, Container, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import baseURL from './config';
const GroupChallenges = ({ group, isAdmin, updater, updateState }) => {
  const [groupChallenges, setGroupChallenges] = useState([])
  const [challengeCompletionStatus, setChallengeCompletionStatus] = useState({});
  const [showDeletePopUp, setShowDeletePopUp] = useState(false)
  const [challengeToDelete, setChallengeToDelete] = useState('')

  const toggleShowDeletePopUp = (id) => {
    setChallengeToDelete(id)
    setShowDeletePopUp(!showDeletePopUp)
  }

  const [deleted, setDeleted] = useState(0)
  const navigate = useNavigate();
  useEffect(() => {
    getGroupChallenges()


  }, [updater, deleted])

  const renderStars = (difficulty) => {
    const starStyle = {
      width: '20px',
      height: '20px',
      marginRight: '2px', verticalAlign: 'middle',
      marginBottom: 5,
      marginLeft: 1
    };

    switch (difficulty) {
      case 'easy':
        return <GreenStarIcon style={starStyle} />;
      case 'medium':
        return (
          <>
            <OrangeStarIcon style={starStyle} />
            <OrangeStarIcon style={starStyle} />
          </>
        );
      case 'hard':
        return (
          <>
            <RedStarIcon style={starStyle} />
            <RedStarIcon style={starStyle} />
            <RedStarIcon style={starStyle} />
          </>
        );
      default:
        return null;
    }
  };

  const getGroupChallenges = async () => {

    const response = await fetch(`${baseURL}/group/challenges/${group}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to fetch challenges for this group.');
      return;
    }

    const data = await response.json();
    if (data === null) { return }
    setGroupChallenges(data.reverse())
  }

  const hasUserCompletedChallenge = async (id) => {
    const response = await fetch(
      `${baseURL}/groupchallengeid/${id}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {

      return;
    }
    const data1 = await response.json();

    const checkCompletionResponse = await fetch(
      `${baseURL}/check-submission-2?challengeId=${data1}&username=${localStorage.getItem('username')}`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!checkCompletionResponse.ok) {
      console.error('Failed to check completion status');

      return;
    }

    const submissionExists = await checkCompletionResponse.text();

    return submissionExists === 'true';
  }



  // Function to fetch completion status for all challenges
  const fetchAllCompletionStatus = async () => {
    const completionStatuses = {};
    for (const challenge of groupChallenges) {
      const status = await hasUserCompletedChallenge(challenge.challengeid);
      completionStatuses[challenge.challengeid] = status;
    }
    setChallengeCompletionStatus(completionStatuses);
  };


  useEffect(() => {
    fetchAllCompletionStatus();
  }, [groupChallenges]);

  const deleteChallenge = async (challengeID) => {
    try {
      const response = await fetch(`${baseURL}/delete/challenge`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ challengeid: challengeID }),
      });

      if (!response.ok) {

        console.error('Failed to delete challenge.');
        return;
      }
      setShowDeletePopUp(false)
      const result = await response.json();
      if (!result.success) {
        console.error(result.message);
        return;
      }

      setDeleted(deleted + 1)


    } catch (error) {
      console.error('Error deleting challenge:', error);
    }
  };


  const attemptChallenge = (x) => {
    navigate(`/challenge/${x}`);
  }


  const [sortByOldest, setSortByOldest] = useState(true);

  const toggleSortOrder = () => {
    setSortByOldest((prevSortByOldest) => !prevSortByOldest);
  };

  const getSortedChallenges = () => {
    return sortByOldest ? groupChallenges : [...groupChallenges].reverse();
  };

  return (
    <>

      {groupChallenges.length === 0 ? (
        <div style={{ marginTop: 10, }}>
          <Typography variant='body1'>No challenges to display</Typography>
        </div>
      ) : (
        <div style={{ height: window.innerWidth < 1150 ? '700px' : '450px', overflowY: 'auto', width: '100%' }}>

          <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 100 }}>
            <FormControl style={{ marginBottom: '10px', marginTop: 10, marginRight: 'auto' }}>
              <InputLabel>Sort Order</InputLabel>
              <Select
                label="Sort Order"
                value={sortByOldest ? 'newest' : 'oldest'}
                onChange={toggleSortOrder}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
              </Select>
            </FormControl>


            {getSortedChallenges().map((challenge) => (
              <Paper
                key={challenge.challengeid}
                style={{
                  boxShadow: 'none',
                  borderBottom: '3px solid #dfd9d9',
                  marginBottom: '1px',
                  display: 'flex',
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',


                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '15px', boxShadow: '0px 0px 5px 0px rgba(0,0,0,0.2)', backgroundColor: 'white' }}>
                  <div style={{ marginLeft: -8, display: 'flex', flexDirection: 'column', width: '100%', marginBottom: 20 }}>
                    <Typography variant="h6" sx={{ marginBottom: '3px' }}>
                      {challenge.title}
                      {challengeCompletionStatus[challenge.challengeid] && <> <CompleteIcon className='scale-in-center' style={{
                        width: '20px',
                        height: '20px',
                        verticalAlign: 'middle',
                        marginBottom: 4
                      }} /></>}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: '5px', fontFamily: 'Consolas, monospace', }}>
                      {challenge.language} {renderStars(challenge.difficulty)}
                    </Typography>
                  </div>

                  <div style={{ marginLeft: 'auto', marginBottom: 10, display: 'flex', flexDirection: 'row', }}>
                    {isAdmin && (
                      <>
                        <button style={{ marginRight: 5, backgroundColor: 'red' }} className="groupControlButton" onClick={() => toggleShowDeletePopUp(challenge.challengeid)}>
                          <div className="sign">
                            <DeleteIcon alt="Delete Icon" style={{}} />
                          </div>
                          <div className="text">Delete</div>
                        </button>
                        <button style={{ marginRight: 5 }} className="submissionButton" onClick={() => navigate(`/challenge/${challenge.url}/submissions`)}>
                          <div style={{}} className="sign">
                            <SubmissionsIcon alt="Submissions Icon" style={{}} />
                          </div>
                          <div className="text">Submissions</div>
                        </button>
                      </>
                    )}

                    {!isAdmin && challengeCompletionStatus[challenge.challengeid] && (
                      <button style={{ marginRight: 5 }} className="submissionButton" onClick={() => navigate(`/challenge/${challenge.url}/submissions`)}>
                        <div style={{}} className="sign">
                          <SubmissionsIcon alt="Submissions Icon" style={{}} />
                        </div>
                        <div className="text">Submissions</div>
                      </button>
                    )}

                    <button className="groupControlButton" onClick={() => attemptChallenge(challenge.url)}>
                      <div className="sign">
                        <AttemptIcon alt="Attempt Icon" style={{}} />
                      </div>
                      <div className="text">Attempt</div>
                    </button>

                  </div>



                </div>

              </Paper>
            ))}


          </ul>
        </div>
      )}


      {showDeletePopUp && (
        <Container style={{ backdropFilter: 'blur(3px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, flexDirection: 'column' }} maxWidth="false">
          <div className='scale-in-center'>
            <Paper
              style={{
                width: 300,
                padding: '10px',
                display: 'flex',
                borderRadius: '0px',
                backgroundColor: 'purple',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0px',
                borderTopLeftRadius: '10px',
                borderTopRightRadius: '10px'
              }}
            >
              <Typography
                sx={{ color: 'white', marginTop: 1, marginBottom: 1, marginLeft: 3 }}
                variant='h6'
                style={{ flex: 1 }}
              >
                Delete challenge?
              </Typography>
              <IconButton sx={{ color: 'white', marginRight: 1 }} onClick={() => toggleShowDeletePopUp('')} >
                <CloseIcon />
              </IconButton>
            </Paper>



            <Paper style={{
              display: 'inline-block', background: '#fff', padding: '10px', borderRadius: '0px', zIndex: 10000, flexDirection: 'column', height: 100, width: 300, borderBottomLeftRadius: '10px',
              borderBottomRightRadius: '10px',
              borderBottom: '6px solid #dfd9d9',
              boxShadow: 'none'
            }}>
              <Container sx={{}}>
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>


                  <button style={{ backgroundColor: 'red', width: 200 }} onClick={() => deleteChallenge(challengeToDelete)} className="actionButton">
                    <div className="sign">
                    </div>
                    <div className="text">Confirm Deletion</div>
                  </button>


                </div>
              </Container>
            </Paper>
          </div>
        </Container>)}

    </>
  )
}

export default GroupChallenges
