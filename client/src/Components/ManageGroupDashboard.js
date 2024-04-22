import React, { useState, useEffect } from 'react';
import { Typography, Paper, Container, IconButton } from '@mui/material';
import { ReactComponent as CreateIcon } from './icons/create.svg';
import { ReactComponent as DeleteIcon } from './icons/delete.svg';
import { ReactComponent as LeaveIcon } from './icons/leave.svg';
import GroupChallenges from './GroupChallenges';
import DeleteGroup from './DeleteGroup';
import CreateChallenge from './CreateChallenge';
import baseURL from './config';
import CloseIcon from '@mui/icons-material/Close';

const ManageGroupDashboard = ({ isSmall, group, updateManageGroup, minimized, updater, updateState }) => {
  const minTime = 1000;
  const maxTime = 3000;
  const [loading, setLoading] = useState(true)
  const [firstMount, setFirstMount] = useState(false)
  const [showLeaveGroupPopUp, setShowLeaveGroupPopUp] = useState(false)
  const toggleShowLeavePopUp = () => {
    setShowLeaveGroupPopUp(!showLeaveGroupPopUp)
  }

  const handleUpdate = () => {
    updateState(updater + 1);
  };

  const handleManageGroup = () => {
    updateManageGroup('')
  }

  // Admin Checks
  const [isAdmin, setIsAdmin] = useState(false)
  const adminGroupAccess = async () => {
    try {
      if (group !== '') {
        const response = await fetch(`${baseURL}/admin/access/${group}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) { return }
        const data = await response.json();
        if (data) { setIsAdmin(true) } else {setIsAdmin(false)}
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    setLoading(true)
    if (firstMount === false) {
      const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
      setTimeout(() => {
        setLoading(false);
      }, randomTime);
      setFirstMount(true)
    }
    adminGroupAccess();
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    setTimeout(() => {
      setLoading(false);
    }, randomTime);
  }, [group]);

  // Delete group stuff
  const [deletePopUp, setDeletePopUp] = useState(false)
  const toggleDeletePopUp = () => { setDeletePopUp(!deletePopUp) }

  //Manage members stuf
  const [, setGroupMembers] = useState([])
  const getMembers = async () => {
    try {
      const payload = { "group_name": group }

      const response = await fetch(`${baseURL}/group/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const responseData = await response.json();
      setGroupMembers(responseData)
      if (response.status === 200) {

      }
    } catch (error) {
      console.error('Error joining group', error);
    }
  };

  const leaveGroup = async (group_name) => {
    try {
      const response = await fetch(`${baseURL}/leave/group`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ group_name: group_name }),
      });

      if (response.status === 200) {
        toggleShowLeavePopUp()
        handleUpdate()
        handleManageGroup()
      } 
      await getMembers();
    } catch (error) {
    }
  };

  useEffect(() => {
    if (isAdmin) { getMembers() }
  }, [isAdmin, group]);

  // Create challenge stuff
  const [createChallengePopUp, setCreateChallengePopUp] = useState(false);
  const toggleCreateChallengePopUp = () => { setCreateChallengePopUp(!createChallengePopUp); }

  if (loading) {
    return (
      <div style={{ height: '400px', top: '50%', left: '50%', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
        <div style={{marginTop: 100}} className="loader"></div>
      </div>)
  }

  return (
    <div style={{ flex: 1, }}>
      <div style={{ transition: 'opacity 0.7s ease', opacity: minimized ? 0 : 1 }}>
        {group.trim() && (
          <Typography variant="body1">
            {isAdmin ? "Managing" : "Viewing"}: {group}
          </Typography>
        )}
      </div>

      <div>
        {!group.trim() ? (
          <div style={{ marginTop: 5 }}>
            {!minimized && (
              <Typography variant="body1">No group data to show</Typography>
            )}
          </div>
        ) : (
          <div>
            {isAdmin ? (
              <div
                style={{
                  backgroundColor: 'white',
                  display: 'flex',
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  paddingBottom: '5px', 
                  borderRadius: '10px',
                  position: 'relative',
                  marginRight: isSmall ? '0px' : '10px',
                  marginBottom: isSmall ? '5px' : '0px',
                  marginTop: isSmall ? '20px' : '15px',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                  <button style={{ marginRight: 5 }} className="createChallengeButton" onClick={toggleCreateChallengePopUp} >
                    <div className="sign">
                      <CreateIcon alt="Create Icon" />
                    </div>
                    <div className="text">Create Challenge</div>
                  </button>

                  <button style={{ backgroundColor: 'red' }} className="createChallengeButton" onClick={toggleDeletePopUp} >
                    <div className="sign">
                      <DeleteIcon alt="Delete Icon" style={{}} />
                    </div>
                    <div className="text"> Delete {group.length > 6 ? `${group.substring(0, 6)}...` : group}</div>
                  </button>
                </div>
              </div>
            ) : <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', flexWrap: 'wrap', }}>
                  <button style={{ backgroundColor: 'red', marginTop: 5 }} className="createChallengeButton" onClick={toggleShowLeavePopUp}>
                    <div className="sign">
                      <LeaveIcon alt="Leave Icon" style={{}} />
                    </div>
                    <div className="text">Leave  {group.length > 6 ? `${group.substring(0, 6)}...` : group}</div>
                  </button>
                </div>}

            <div style={{ flex: 1, display: 'flex', flexDirection: isSmall ? 'column' : 'column', marginTop: 10, }}>
              <div style={{
                marginTop: 5,
                backgroundColor: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <Typography style={{ marginBottom: 5 }} variant='body1'>Group Challenges</Typography>
                <GroupChallenges group={group} isAdmin={isAdmin} updater={updater} updateState={updateState} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '5%', background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1))',}} />
              </div>
            </div>
          </div>
        )}
      </div>

   
      {deletePopUp && (<DeleteGroup  group={group} toggleDeletePopUp={toggleDeletePopUp} updater={updater} updateState={updateState} updateManageGroup={updateManageGroup} />)}
      {createChallengePopUp && (<CreateChallenge isSmall={isSmall} group={group} toggleCreateChallenge={toggleCreateChallengePopUp} updater={updater} updateState={updateState} />)}
      {showLeaveGroupPopUp && (
        <Container style={{ backdropFilter: 'blur(3px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, flexDirection: 'column' }} maxWidth="false">
           <div className='scale-in-center'>
              <Paper style={{ width: 300, padding: '10px', display: 'flex', borderRadius: '0px', backgroundColor: 'purple', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}>
                <Typography sx={{ color: 'white', marginTop: 1, marginBottom: 1, marginLeft: 3 }} variant='h6' style={{ flex: 1 }}>
                  Leave {group}?
                </Typography>
                <IconButton sx={{ color: 'white', marginRight: 1 }} onClick={toggleShowLeavePopUp} >
                  <CloseIcon />
                </IconButton>
              </Paper>
              <Paper style={{ display: 'inline-block', background: '#fff', padding: '10px', borderRadius: '0px', zIndex: 10000, flexDirection: 'column', height: 100, width: 300, borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderBottom: '6px solid #dfd9d9', boxShadow: 'none' }}>
                <Container>
                  <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <button style={{ backgroundColor: 'red', width: 200 }} className="actionButton" onClick={() => leaveGroup(group)}>
                      <div className="text">Confirm Leave </div>
                    </button>
                  </div>
                </Container>
              </Paper>
          </div>
        </Container>
        )}
    </div >
  );
};

export default ManageGroupDashboard;