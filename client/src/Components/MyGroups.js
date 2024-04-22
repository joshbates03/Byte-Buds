import React, { useState, useEffect } from 'react';
import { Container, Typography, MenuItem, Select, FormControl, InputLabel, } from '@mui/material';
import { ReactComponent as CogIcon } from './icons/cog.svg';
import { ReactComponent as CreateIcon } from './icons/create.svg';
import { Paper, IconButton } from '@mui/material';
import baseURL from './config';
import CloseIcon from '@mui/icons-material/Close';
import './Animations.css';
import './Loader.css'

const MyGroups = ({ username, onManageGroup, isSmall, updater }) => {
  const [createGroupPopUp, setCreateGroupPopUp] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupCreationMessage, setGroupCreationMessage] = useState('')
  const [groups, setGroups] = useState([])
  const [, setManageGroup] = useState('')
  const [isLoading, setIsLoading] = useState(true);
  const [sortByOldest, setSortByOldest] = useState(true);
  const minTime = 1000;
  const maxTime = 3000;

  const toggleSortOrder = () => {
    setSortByOldest((prevSortByOldest) => !prevSortByOldest);
  };

  const sortedGroups = sortByOldest
    ? [...groups].reverse()
    : [...groups];

  const handleGroupNameChange = (e) => {
    const inputValue = e.target.value;
    if (/^[a-zA-Z0-9]*$/.test(inputValue) && inputValue.length <= 14) {
      setGroupName(inputValue);
    }
  };

  const getGroups = async () => {
    const response = await fetch(`${baseURL}/my/groups`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) { return }
    const data = await response.json();
    if (data === null) { return }
    setGroups(data);
  };

  const toggleCreatePopUp = () => {
    setGroupName('')
    setGroupCreationMessage('')
    setCreateGroupPopUp(!createGroupPopUp)
  }

  const handleManage = (x) => {
    setManageGroup(x);
    onManageGroup(x);
  };

  const createGroup = async () => {
    try {
      if (groupName === '') { return }
      const groupDetails = { username, groupName }

      const response = await fetch(`${baseURL}/group/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(groupDetails),
      });

      const responseData = await response.json()
      if (responseData === "Group name too long") {
        setGroupCreationMessage("Name must be less than 14 characters")
        return
      }

      if (response.status === 200) {
        setGroupCreationMessage('')
        toggleCreatePopUp()
      } else {
        setGroupCreationMessage(responseData)
      }

      getGroups()
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating group', error);
    }
  }

  useEffect(() => {
    setIsLoading(true)
    getGroups();
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    setTimeout(() => {
      setIsLoading(false);
    }, randomTime);
  }, [updater]);

  if (isLoading) {
    return (
      <div style={{ height: '280px', top: '50%', left: '50%', alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
        <div style={{ marginTop: 100 }} className="loader"></div>
      </div>
    )
  }

  return (
    <div>
      {groups.length === 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '5px', marginLeft: 'auto', marginTop: 3 }}>
            <button onClick={toggleCreatePopUp} style={{ marginRight: 0 }} className="createGroupButton">
              <div className="sign">
                <CreateIcon alt="Create Icon" />
              </div>
              <div className="text">Create Group</div>
            </button>
          </div>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Typography>You currently have 0 groups</Typography>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '5px', marginLeft: 'auto', marginTop: 3, }}>
            <button onClick={toggleCreatePopUp} style={{ marginRight: 0 }} className="createGroupButton">
              <div className="sign">
                <CreateIcon alt="Create Icon" />
              </div>
              <div className="text">Create Group</div>
            </button>
            <FormControl variant="outlined" style={{ maxWidth: '120px', width: '100%', marginBottom: '10px' }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                label="Sort By"
                onChange={toggleSortOrder}
                value={sortByOldest ? 'newest' : 'oldest'}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div style={{ position: 'absolute', width: '100%', height: '330px', overflowY: 'auto', borderRadius: '10px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0)', right: '2px', paddingBottom: '20px' }}>
            {sortedGroups.map((group, index) => (
              <Paper
                key={index}
                style={{
                  boxShadow: 'none',
                  borderBottom: '3px solid #dfd9d9',
                  marginBottom: index === groups.length - 1 ? '0' : '1px',
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" style={{ whiteSpace: 'nowrap', marginBottom: '5px', marginTop: 5 }}>
                    {group.group_name}
                  </Typography>
                  <Typography style={{ whiteSpace: 'nowrap', marginBottom: '10px' }}>
                    Created: {new Date(group.datecreated).toLocaleDateString('en-UK')}
                  </Typography>
                </div>

                <div style={{ marginRight: 20, marginBottom: 10 }}>
                  <button className="groupControlButton" onClick={() => handleManage(group.group_name)}>
                    <div className="sign">
                      <CogIcon alt="Manage Icon" style={{}} />
                    </div>
                    <div className="text">Manage</div>
                  </button>
                </div>
              </Paper>
            ))}
          </div>
        </>
      )}

      {createGroupPopUp && (
        <Container
          style={{
            backdropFilter: 'blur(3px)',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            flexDirection: 'column',
          }}
          maxWidth="false"
        >
          <div className={`scale-in-center`}>
            <Paper style={{ width: 300, padding: '10px', display: 'flex', borderRadius: '0px', backgroundColor: 'purple', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}>
              <Typography sx={{ color: 'white', marginTop: 1, marginBottom: 1, marginLeft: 3 }} variant='h6' style={{ flex: 1 }}>
                Create a group
              </Typography>
              <IconButton sx={{ color: 'white', marginRight: 1 }} onClick={toggleCreatePopUp}>
                <CloseIcon />
              </IconButton>
            </Paper>
            <Paper style={{ display: 'inline-block', background: '#fff', padding: '10px', borderRadius: '0px', zIndex: 10000, flexDirection: 'column', height: 145, width: 300, borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', borderBottom: '6px solid #dfd9d9', boxShadow: 'none'}}>
              <Container sx={{ marginTop: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                  <div style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', }} className="input-wrapper">
                    <input
                      style={{ width: '100%' }}
                      placeholder="Group Name"
                      name="groupName"
                      value={groupName}
                      type="text"
                      onChange={(e) => handleGroupNameChange(e)}
                      maxLength={14}
                    />
                  </div>

                  {groupCreationMessage !== '' && (
                    <Typography
                      className='heartbeat-once'
                      sx={{
                        position: 'absolute',
                        marginTop: 2,
                        marginBottom: 1,
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        color: 'red'
                      }}
                      variant='body2'
                    >
                      {groupCreationMessage}
                    </Typography>
                  )}
                  <button onClick={() => createGroup()} style={{ marginTop: 30, width: '224px' }} className="actionButton">
                    <div className="text">Create Group</div>
                  </button>
                </div>
              </Container>
            </Paper>
          </div>
        </Container>)}
    </div>
  )
}

export default MyGroups
