const express = require('express');
const cookieOptions = require('./cookies');
require('dotenv').config()
const app = express();
const PORT = 5000
const axios = require('axios');
const path = require('path');
const jwt = require('jsonwebtoken')
const pool = require('./db');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const nodemailer = require('nodemailer');
app.use(express.static(path.join(__dirname, '../client/build')));
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = ['https://bytebuds.co.uk',];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));


const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: 'josh@juxtaj.com',
    pass: 'tfkgvxlbcplxnxgv',
  },
});

let tokenStorage = new Set(); 

// Sends welcome email
function sendWelcomeEmail(email) {
  const mailOptions = {
    from: 'bytebuds@juxtaj.com',
    to: email,
    subject: 'Welcome to Byte Buds',
    text: `Thank you for creating an account with Byte Buds!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {

    }
  });
}

// Sends password reset email
function sendPasswordReset(email, link) {
  const mailOptions = {
    from: 'bytebuds@juxtaj.com',
    to: email,
    subject: 'Reset your Password',
    text: `Having trouble logging in? You can reset your password with the following link (expires in 30 minutes): ${link}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {

    }
  });
}

// Sends password reset confirmation email
function sendConfirmPasswordReset(email) {
  const mailOptions = {
    from: 'bytebuds@juxtaj.com',
    to: email,
    subject: 'Byte Buds Password Reset',
    text: `You have successfully updated your password!`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {

    }
  });
}

// Creates challenge URL
function generateRandomString(length) {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

// Serve other specific routes 
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.get('/reset-password?token=:token', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.get('/challenge/:url', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.get('/challenge/:url/submissions', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.get('/challenge', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


// Authenticates guest tokens
function authenticateToken(req, res, next) {
  const token = req.cookies.guest_access;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, id) => {
    if (err) return res.sendStatus(403);
    req.id = id;
    next();
  });
}

// Checks if signed in and gives user details
app.get('/guest/data', authenticateToken, (req, res) => {
  res.json(req.id.id)
})

// Authenticates user tokens
function authenticateUserToken(req, res, next) {
  const token = req.cookies.user_access;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, username) => {
    if (err) {
      const tokenToRemove = [...tokenStorage].find(t => t.token === token);
      if (tokenToRemove) {
        tokenStorage.delete(tokenToRemove);
      }
      return res.sendStatus(403);
    }
    req.username = username;
    next();
  });
}

// Checks if signed in and gives user details
app.get('/user/data', authenticateUserToken, (req, res) => {
  res.json(req.username)

})

// Clear cookies
app.get('/clear-user-cookie', (req, res) => {
  res.clearCookie('user_access'); // Clear the 'user_access' cookie
  res.send('User cookie cleared');
});

app.get('/clear-guest-cookie', (req, res) => {
  res.clearCookie('guest_access'); // Clear the 'guest_access' cookie
  res.send('Guest cookie cleared');
});



// Verifies a guest token
app.post('/guest/verify', async (req, res) => {
  try {
    const { id } = req.body
    const token = jwt.sign({ id: id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
    res.cookie('guest_access', token, cookieOptions);
    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in /guest/verify:', error);
  }
})

// Verifies both
function authenticateAccess(req, res, next) {
  const guestToken = req.cookies.guest_access;
  const userToken = req.cookies.user_access;
  if (guestToken) {
    jwt.verify(guestToken, process.env.ACCESS_TOKEN_SECRET, (err, id) => {
      if (err) {
        console.error('Error verifying guest token:', err);
        return res.sendStatus(403);
      }
      req.id = id;
      next();
    });
  } else if (userToken) {
    jwt.verify(userToken, process.env.ACCESS_TOKEN_SECRET, (err, username) => {
      if (err) {
        console.error('Error verifying user token:', err);
        return res.sendStatus(403);
      }
      req.username = username;
      next();
    });
  } else {
    return res.sendStatus(401);
  }
}



// Generates a reset token 
app.post('/generate-reset-token', async (req, res) => {
  try {
    const { email } = req.body;
    const checkEmailQuery = 'SELECT * FROM users WHERE email = $1';
    const checkEmailValues = [email];
    const emailResult = await pool.query(checkEmailQuery, checkEmailValues);
    let emailExists = true
    if (emailResult.rows.length === 0) {
      emailExists = false
    }

    if (emailExists) {
      const token = jwt.sign({ email }, process.env.PASSWORD_RESET, { expiresIn: '10m' });
      const resetLink = `http://bytebuds.co.uk/reset-password?token=${token}`;
      sendPasswordReset(email, resetLink)
    }
    res.json({ message: 'Reset link sent successfully' });
  } catch (error) {
    console.error('Error occurred in /generate-reset-token: ', error);
  }
});

// Validate reset password
app.post('/validatereset', async (req, res) => {
  try {
    const { token } = req.body;

    jwt.verify(token, process.env.PASSWORD_RESET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      else { res.status(200) }
    });
  } catch (error) {
    console.error('Error occurred in /validatereset: ', error);
  }
});

// Reset password
app.post('/resetpassword', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    jwt.verify(token, process.env.PASSWORD_RESET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      const { email } = decoded;

      let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.json('Invalid email format');
      }

      if (newPassword.length < 8) {
        return res.json('Invalid password format');
      }

      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const updateQuery = `UPDATE users SET password = $1 WHERE email = $2 RETURNING email;`;
      const updateValues = [hashedPassword, email];
      const updateResult = await pool.query(updateQuery, updateValues);

      if (updateResult.rows.length === 0) {
        return res.json('Email not found');
      }

      sendConfirmPasswordReset(email)
      return res.json('Password reset successful');
    });
  } catch (error) {
    console.error('Error occurred in /resetpassword: ', error);
  }
});

// Create user
app.post('/create/user', async (req, res) => {
  let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  try {
    const { username, email, firstname, surname, password } = req.body;
    if (username.length < 5 || username.length > 15) { res.json("Username format invalid") }
    else if (!emailRegex.test(email)) { res.json("Email format invalid") }
    else if (password.length < 8) { res.json("Password format invalid") }
    else {
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const query = `INSERT INTO users (username, email, firstname, surname, password) VALUES ($1, $2, $3, $4, $5) RETURNING username;`
      const values = [username, email, firstname, surname, hashedPassword];
      await pool.query(query, values);
      const clientMessage = "Successfully created user"
      sendWelcomeEmail(email)
      res.json(clientMessage)
    }
  } catch (error) {
    if (error.code === '23505') {
      if (error.constraint === 'users_username_key') {
        res.json('Username already exists');
      } else if (error.constraint === 'users_email_key') {
        res.json('Email is already registered');
      }
      else {
        res.json(error);
      }
    }
    else { res.json("Something went wrong") }
    console.error('Error occured in /create/user: ', error)
  }
})

// User sign in


function getToken(username) {
  return [...tokenStorage].find(token => token.username === username)?.token;
}

function storeToken(username, token, expirationTime) {
  tokenStorage.add({ username, token, expirationTime });
}

function removeExpiredTokens() {
  const now = Date.now();
  tokenStorage.forEach(token => {
    if (token.expirationTime <= now) {
      tokenStorage.delete(token);
    }
  });
}

setInterval(removeExpiredTokens, 60 * 60 * 1000); 


app.post('/user/signin', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!email && !username) {
      res.status(404).json({ error: 'Email or username is required.' });
      return;
    }
    const query = `SELECT userid, username, email, password FROM users WHERE email = $1 OR username = $2 `;
    const result = await pool.query(query, [email, username]);

    if (result.rowCount === 0) {
      res.status(404).json({ error: 'Invalid details' });
      return;
    }

    const user = { "username": result.rows[0].username };
   
    const hashedPassword = result.rows[0].password;

    bcrypt.compare(password, hashedPassword, (err, match) => {
      if (err) {
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      if (match) {
        let token = getToken(user.username);
        if (!token) {
          token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
          storeToken(user.username, token, Date.now() + (24 * 60 * 60 * 1000));
          
        }
        res.cookie('user_access', token, cookieOptions);
        return res.status(200).json({ token, username: user.username });
      } else {
        res.status(401).json({ error: 'Invalid details' });
      }
    });
  } catch (error) {
    console.error('Error occurred in /user/signin: ', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Create a group
app.post('/group/create', async (req, res) => {
  try {
    const { username, groupName } = req.body;
    if (groupName.length > 14) { res.json('Group name too long') }
    else {
      const currentDate = new Date().toISOString();
      const query = `INSERT INTO groups (group_name,member_count, admin_username, datecreated) VALUES ($1, $2, $3, $4)`
      const values = [groupName, 1, username, currentDate];
      await pool.query(query, values);
      const query2 = `INSERT INTO groupmembers (group_name, username, datejoined) VALUES ($1, $2, $3)`
      const values2 = [groupName, username, currentDate];
      await pool.query(query2, values2);
      res.json("You have created group: " + groupName)
    }
  } catch (error) {
    if (error.code === '23505') {
      if (error.constraint === 'groups_group_name_key') {
        res.status(409).json("This group name already exists");
      }
    } else { res.json("An error has occured") }
    console.error('Error occurred in /group/create: ', error)
  }
})

// Get user groups
app.get('/my/groups', authenticateUserToken, async (req, res) => {
  try {
    const username = req.username.username
    const query = `SELECT group_name, member_count ,datecreated FROM groups WHERE admin_username = $1`
    const values = [username]
    const results = await pool.query(query, values)
    if (results.rows.length === 0) {
      return res.json(null)
    }
    res.json(results.rows)
  } catch (error) {
    console.error('Error occurred in /my/groups: ', error)
  }

})

// Get joined groups
app.get('/groups/joined', authenticateUserToken, async (req, res) => {
  try {
    const username = req.username.username
    const query = `SELECT group_name, datejoined FROM groupmembers WHERE username = $1`
    const values = [username,]
    const result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error('Error occurred in /groups/joined: ', error)
  }
})

// If admin, gives access to extra features in group dashboard
app.get('/admin/access/:name', authenticateUserToken, async (req, res) => {
  try {
    const username = req.username.username;
    const groupName = req.params.name;
    const query = `SELECT * FROM groups WHERE admin_username = $1 AND group_name = $2`;
    const values = [username, groupName];
    result = await pool.query(query, values);
    if (result.rows.length === 1) {
      res.status(200).json(true); // Return true if a match is found
    } else {
      res.status(200).json(false); // Return false if no match is found
    }
  } catch (error) {
    console.error('Error occurred in /admin/access/:name: ', error)
  }
});

// Create challenge
app.post('/challenge/create', authenticateUserToken, async (req, res) => {
  try {
    const created_by = req.username.username;
    const { title, description, difficulty, language, expected_output, example_solution, code_template, codeql_query, privacy, group_name } = req.body
    const url = generateRandomString(6);
    const currentDate = new Date().toISOString();

    const query = `INSERT into challenges (title, description, language, difficulty, expected_output, example_solution, code_template, codeql_query, privacy, created_by, datecreated, url) 
        VALUES ($1, $2, $3, $4, $5,$6, $7,$8,$9,$10 ,$11, $12) RETURNING challengeid`

    const values = [title, description, language, difficulty, expected_output, example_solution, code_template, codeql_query, privacy, created_by, currentDate, url]
    const result = await pool.query(query, values)
    const challengeid = result.rows[0].challengeid

    const query2 = `INSERT into groupchallenges (group_name, challengeid, created_by) VALUES ($1, $2, $3)`
    const values2 = [group_name, challengeid, created_by]
    await pool.query(query2, values2)
    res.json("Successfully created challenge")
  } catch (error) {
    console.error('Error occurred in /challenge/create: ', error)

  }

})

// Get group challenges
app.get('/group/challenges/:name', async (req, res) => {
  try {
    const groupName = req.params.name;
    const query = `
      SELECT GC.groupchallengeid, C.*
      FROM Challenges AS C
      INNER JOIN GroupChallenges AS GC
      ON C.challengeid = GC.challengeid
      WHERE GC.group_name = $1;
          `;
    const values = [groupName]
    result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error('Error occurred in /group/challenges/:name: ', error)
  }
})

app.get('/challenges/community', async (req, res) => {
  try {
    const query = `SELECT * FROM Challenges WHERE privacy = true;`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error occurred in /challenges/community: ', error);

  }
});

// Get challenge data from its URL
app.get('/achallenge/:url', async (req, res) => {
  try {
    const url = req.params.url;
    const query = `
      SELECT challenges.*, groupchallenges.group_name
      FROM challenges
      JOIN groupchallenges ON challenges.challengeid = groupchallenges.challengeid
      WHERE challenges.url = $1;
    `;
    const values = [url];
    result = await pool.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Error occured in /achallenge/:url: ', error);
  }
});



// Judge0
const languageConversion = {
  "Python (3.8.1)": 71,
  "JavaScript (Node.js 12.14.0)": 63,
  "Bash (5.0.0)": 46,
  "C (GCC 9.2.0)": 50,
  "C++ (GCC 9.2.0)": 54,
  "C# (Mono 6.6.0.161)": 51,
  "Go (1.13.5)": 60,
  "Java (OpenJDK 13.0.1)": 62,
  "Lua (5.3.5)": 64,
  "PHP (7.4.1)": 68,
  "Ruby (2.7.0)": 72,
  "Rust (1.40.0)": 73,
  "TypeScript (3.7.4)": 74
};

const queue = []; 
const maxConcurrentRequests = 75; 
let processingCount = 0; 

app.post('/execute', authenticateAccess, async (req, res) => {
  const startTime = new Date(); 
  queue.push({ req, res, startTime });
 
  while (queue.length > 0 && processingCount < maxConcurrentRequests) {
    const { req, res, startTime } = queue.shift();
    processingCount++;
    const { languageID, code, inputs } = req.body;
    let lang;

    try {
      if (languageID && languageConversion.hasOwnProperty(languageID)) {
        lang = languageConversion[languageID];
      } else {
        console.error('Invalid or missing language ID:', languageID);
        return;
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }

    try {
      const requestData = {
        language_id: lang,
        source_code: code,
        stdin: inputs.join('\n')
      };

      let response;
      let submissionToken;
      let result = null;
      let isPostRequestDone = false; 
      let retryCount = 0;
      const maxRetries = 10;
      let retryDelay = 5000; 
      do {
        try {
          response = await axios.post(`http://152.67.143.182:2358/submissions`, requestData);
          submissionToken = response.data.token;
          isPostRequestDone = true; 
          break; 
        } catch (error) {
          if (error.response && error.response.data && error.response.data.error === 'queue is full') {
            if (retryCount >= maxRetries / 2) {
              retryDelay = 10000;
            }
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            retryCount++;
          } else {
            throw error; 
          }
        }
      } while (retryCount < maxRetries);

      if (retryCount === maxRetries) {
        return res.json({ output: 'The server is currently busy, please try again shortly.' });
      }

      
      while (!isPostRequestDone) {
        await new Promise(resolve => setTimeout(resolve, 100)); 
      }

      while (!result || (result.status.id === 1 || result.status.id === 2)) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before checking again
        const statusResponse = await axios.get(`http://152.67.143.182:2358/submissions/${submissionToken}`);
        result = statusResponse.data;
      }

     
      if (result.status.id === 2) {
        res.json({ output: "processing" })
      } else if (result.status.id === 3) {
        res.json({ output: result.stdout })
      } else if (result.status.id === 11) {
        res.json({ output: result.stderr + result.message })
      } else if (result.status.id === 6) {
        res.json({ output: result.compile_output })
      } else {
        res.json({ output: 'An error occurred while executing the code.' });
      }

    } catch (error) {
      console.error(error);
      res.json({ output: 'An error occurred while executing the code.' });
    } finally {
      processingCount--;
    }
  }
});




// Join a group (from challenge page)
app.post('/join/group', authenticateUserToken, async (req, res) => {

  try {
    const username = req.username.username;
    const { group_name } = req.body;
    const datejoined = new Date().toISOString();

    const query = `INSERT INTO groupmembers (group_name, username, datejoined) VALUES ($1, $2, $3);`;
    const values = [group_name, username, datejoined];
    await pool.query(query, values);

    res.status(201).json({ message: 'joined group created successfully.' });
  } catch (error) {
    console.error('Error occurred in /join/group: ', error);
  }
});

// Checks if user is in the group of the creator of the challenge 
app.post('/in/group', authenticateUserToken, async (req, res) => {
  try {
    const { group_name } = req.body;
    const username = req.username.username;

    const result = await pool.query(
      'SELECT EXISTS (SELECT 1 FROM groupmembers WHERE username = $1 AND group_name = $2) AS exists',
      [username, group_name]
    );

    const exists = result.rows[0].exists;
    res.json({ exists });
  } catch (error) {
    console.error('Error occured in /in/group: ', error);
  }
});

// Get groupchallengeid from challengeid
app.get('/groupchallengeid/:challengeid', async (req, res) => {
  try {
    const challengeID = req.params.challengeid;
    const query = `SELECT groupchallengeid FROM groupchallenges WHERE challengeid = $1;`;
    const values = [challengeID]
    result = await pool.query(query, values)
    res.json(result.rows[0].groupchallengeid)
  } catch (error) {
    console.error('Error occurred in /groupchallengeid/:challengeid: ', error)
  }
})

// Delete challenge 
app.delete('/delete/challenge', async (req, res) => {
  try {
    const challengeIDToDelete = req.body.challengeid;
    const deleteQuery = `DELETE FROM challenges WHERE challengeid = $1;`;
    const deleteValues = [challengeIDToDelete];
    await pool.query(deleteQuery, deleteValues);
    res.json({ success: true, message: 'Challenge deleted successfully.' });
  } catch (error) {
    console.error("Error occcurred in /delete/challenge: ", error);
  }
});

// Submit challenge code
app.post('/submit', async (req, res) => {
  try {
    const { groupchallengeid, username, code, codeoutput, isCorrect, allConstructs } = req.body
    const time = new Date().toLocaleString('en-UK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const query = `INSERT into submissions (groupchallengeid, username, code, code_output, iscorrect, allconstructs, time_submitted) VALUES ($1, $2, $3, $4, $5, $6, $7) `
    const values = [groupchallengeid, username, code, codeoutput, isCorrect, allConstructs, time]
    const result = await pool.query(query, values)
    if (result.rowCount === 1) {
      res.json("Successfully submitted your code.")
    } else { res.json("You're code was not submitted") }
  } catch (error) {
    console.error('Error occurred in /submit: ', error)
  }
})

// Gets submissions 
app.get('/submissions/:groupchallengeid', async (req, res) => {
  try {
    const groupchallengdID = req.params.groupchallengeid;
    const query = `
      SELECT username, code, code_output, isCorrect, allConstructs, time_submitted
      FROM submissions
      WHERE groupchallengeid = $1;
    `;
    const values = [groupchallengdID]
    result = await pool.query(query, values)
    res.json(result.rows)
  } catch (error) {
    console.error('Error occurred in /submissions/:groupchallengeid: ', error)
  }
})

// Checks if a submission exists for a given username and challenge ID
app.get('/check-submission', async (req, res) => {
  try {
    const { username, challengeId } = req.query;
    const query = `
      SELECT COUNT(*) AS submission_count
      FROM submissions 
      WHERE groupchallengeid = $1 
      AND username = $2;
    `;
    const values = [challengeId, username];
    const result = await pool.query(query, values);
    const submissionCount = result.rows[0].submission_count;
    res.send(submissionCount > 0 ? 'true' : 'false');
  } catch (error) {
    console.error('Error occurred in /check-submission:', error);
  }
});

// Same as check-submission (not sure why I made this)
app.get('/check-submission-2', async (req, res) => {
  try {
    const { challengeId, username } = req.query;
    const query = `
      SELECT COUNT(*) AS submission_count
      FROM submissions 
      WHERE groupchallengeid = $1 
      AND username = $2;
    `;
    const values = [challengeId, username];
    const result = await pool.query(query, values);
    const submissionCount = result.rows[0].submission_count;
    res.send(submissionCount > 0 ? 'true' : 'false');
  } catch (error) {
    console.error('Error occurred in /check-submission:', error);
  }
});


// Get group members
app.post('/group/members', authenticateUserToken, async (req, res) => {
  try {
    const { group_name } = req.body;
    const username = req.username.username;
    const result = await pool.query(
      'SELECT username, datejoined FROM groupmembers WHERE group_name = $1',
      [group_name]
    );

    const users = result.rows;
    const filteredUsers = users.filter((user) => user.username !== username);
    res.json(filteredUsers);
  } catch (error) {
    console.error('Error occurred in /group/members: ', error);
  }
});

// Leave a group
app.delete('/leave/group', authenticateUserToken, async (req, res) => {
  try {
    const username = req.username;
    const { group_name } = req.body;

    const result = await pool.query(
      'DELETE FROM groupmembers WHERE group_name = $1 AND username = $2',
      [group_name, username.username]
    );

    if (result.rowCount > 0) {
      res.status(200).json({ success: true, message: 'Row removed successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Row not found!' });
    }
  } catch (error) {
    console.error('Error occurred in /leave/group: ', error);

  }
});

// Delete a group - also delete challenges from all places for that group
app.delete('/delete/group', authenticateUserToken, async (req, res) => {
  try {
    const { groupName } = req.body;

    const query1 = `
      DELETE FROM groupchallenges
      WHERE group_name = $1
      RETURNING challengeid;
    `;
    const values1 = [groupName];
    const result1 = await pool.query(query1, values1);

    if (result1.rows.length != 0) {
      const challengeId = result1.rows[0].challengeid;

      const query2 = `
      DELETE FROM challenges
      WHERE challengeid = $1;
    `;
      const values2 = [challengeId];
      await pool.query(query2, values2);
    }

    const query3 = `
      DELETE FROM groups
      WHERE group_name = $1;
    `;
    const values3 = [groupName];
    await pool.query(query3, values3);
    res.json({ success: true, message: 'Left group successfully.' });

  } catch (error) {
    console.error('Error occurred in /delete/group: ', error);

  }
});

// AST for analysis of code submissions
const Parser = require('tree-sitter');
const Bash = require('tree-sitter-bash');
const C = require('tree-sitter-c');
const CSharp = require('tree-sitter-c-sharp');
const Cpp = require('tree-sitter-cpp');
const Go = require('tree-sitter-go');
const Java = require('tree-sitter-java');
const JavaScript = require('tree-sitter-javascript');
const Lua = require('tree-sitter-lua');
const PHP = require('tree-sitter-php');
const Python = require('tree-sitter-python');
const Ruby = require('tree-sitter-ruby');
const Rust = require('tree-sitter-rust');
const TypeScript = require('tree-sitter-typescript');
const jsonParser = express.json();

// Judge0 lanaguage to parser type
const languageToParser = {
  'Python (3.8.1)': Python,
  'Ruby (2.7.0)': Ruby,
  'Java (OpenJDK 13.0.1)': Java,
  'Bash (5.0.0)': Bash,
  'C (GCC 9.2.0)': C,
  'C++ (GCC 9.2.0)': Cpp,
  'C# (Mono 6.6.0.161)': CSharp,
  'Go (1.13.5)': Go,
  'JavaScript (Node.js 12.14.0)': JavaScript,
  'Lua (5.3.5)': Lua,
  'PHP (7.4.1)': PHP,
  'Python (3.8.1)': Python,
  'Ruby (2.7.0)': Ruby,
  'Rust (1.40.0)': Rust,
  'TypeScript (3.7.4)': TypeScript,
};

// Check code submissions for use of required constructs
app.post('/check-code', jsonParser, (req, res) => {

  try {
    const { code, constructs, language } = req.body;
    const parser = new Parser();
    const selectedLanguageParser = languageToParser[language];
    
    if (selectedLanguageParser) {
      parser.setLanguage(selectedLanguageParser);
    } else {
      console.error('Unsupported language:', language);
    }

    if (!code || !constructs || !Array.isArray(constructs)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const tree = parser.parse(code);
    const foundConstructs = new Set(constructs);
    const matchedConstructs = new Set();

    const findMatchingConstructs = (node) => {
      if (constructs.includes(node.type)) {
        matchedConstructs.add(node.type);
        foundConstructs.delete(node.type);
      }
      node.children.forEach((childNode) => {
        findMatchingConstructs(childNode);
      });
    };

    findMatchingConstructs(tree.rootNode);
    const foundResult = Array.from(matchedConstructs);
    const notFoundResult = Array.from(foundConstructs);

    res.json({ foundConstructs: foundResult, notFoundConstructs: notFoundResult });
  } catch (error) {
    console.error('Error occurred in /check-code: ', error)
  }
});

// Gets constructs based off example solution provided by challenge creator
app.post('/constructs', jsonParser, (req, res) => {
  try {
    const { code, language } = req.body;
    const parser = new Parser();

    const selectedLanguageParser = languageToParser[language];
    if (selectedLanguageParser) {
      parser.setLanguage(selectedLanguageParser);
    } else {
      console.error('Unsupported language:', language);
      return res.status(400).json({ error: 'Unsupported language' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const tree = parser.parse(code);
    const uniqueConstructs = new Set();

    const findUniqueConstructs = (node) => {
      if (node.type.length > 1 && node.type !== 'module' && node.type !== 'program') {
        uniqueConstructs.add(node.type);
      }
      node.children.forEach((childNode) => {
        findUniqueConstructs(childNode);
      });
    };

    findUniqueConstructs(tree.rootNode);
    const uniqueConstructsList = Array.from(uniqueConstructs);
    res.json({ uniqueConstructs: uniqueConstructsList });
  } catch (error) {
    console.error('Error occurred in /constructs: ', error)
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});


// Run server
app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});





