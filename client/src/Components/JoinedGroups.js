import React, { useState, useEffect } from 'react';
import { Typography, MenuItem, Select, FormControl, InputLabel, } from '@mui/material';
import { ReactComponent as ViewIcon } from './icons/view.svg';
import { Paper, } from '@mui/material';
import baseURL from './config';
import './Animations.css';

const JoinedGroups = ({  onManageGroup,  updater }) => {
  const [myGroups, setMyGroups] = useState([])
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

  const handleManage = (x) => {
    setManageGroup(x);
    onManageGroup(x);
  };

  const getMyGroups = async () => {
    const response = await fetch(`${baseURL}/my/groups`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) { return }
    const myGroupsData = await response.json();
    if (myGroupsData === null) { return; }
    setMyGroups(myGroupsData);
  }

  const getGroups = async () => {
    const response = await fetch(`${baseURL}/groups/joined`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) { return }
    const data = await response.json();
    if (data === null) { return; }
    const uniqueItems = data.filter((item2) => !myGroups.some((item1) => item1.group_name === item2.group_name));
    setGroups(uniqueItems);
  };

  useEffect(() => {
    getMyGroups()
  }, []);

  useEffect(() => {
    setIsLoading(true)
    getGroups()
    const randomTime = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    setTimeout(() => {
      setIsLoading(false);
    }, randomTime);

  }, [myGroups, updater]);


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
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <Typography>No groups to display</Typography>
        </div>
      ) : (
        <>
          <div style={{ maxWidth: '120px', width: '100%', marginBottom: '5px', marginLeft: 'auto', marginTop: 5 }}>
            <FormControl variant="outlined" style={{ maxWidth: '550px', width: '100%', marginBottom: '10px', marginLeft: 'auto' }}>
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
              <Paper key={index} style={{ boxShadow: 'none', borderBottom: '3px solid #dfd9d9', marginBottom: index === groups.length - 1 ? '0' : '1px', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',}}>
                <div style={{ marginLeft: 20, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" style={{ whiteSpace: 'nowrap', marginBottom: '5px', marginTop: 5 }}>
                    {group.group_name}
                  </Typography>
                  <Typography style={{ whiteSpace: 'nowrap', marginBottom: '10px' }}>
                    Joined: {new Date(group.datejoined).toLocaleDateString('en-UK')}
                  </Typography>
                </div>

                <div style={{ marginRight: 20, marginBottom: 10 }}>
                  <button className="groupControlButton" onClick={() => handleManage(group.group_name)}>
                    <div className="sign">
                      <ViewIcon alt="View Icon" style={{}} />
                    </div>
                    <div className="text">View</div>
                  </button>
                </div>
              </Paper>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default JoinedGroups
