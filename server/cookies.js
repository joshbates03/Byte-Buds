const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day in milliseconds

let cookieOptions = {
  expires: new Date(Date.now() + oneDayInMilliseconds),
  path: '/',
};

if (process.env.NODE_ENV === 'production') {
  cookieOptions = {
    ...cookieOptions,
    sameSite: 'None',
    secure: true,
    httpOnly: true,
  };
}

module.exports = cookieOptions;
