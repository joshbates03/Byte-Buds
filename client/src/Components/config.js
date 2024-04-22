let baseURL = '';
if (process.env.NODE_ENV === 'development') {baseURL = 'http://82.34.172.26:5000'} 
else {baseURL = 'https://bytebuds.co.uk'}
export default baseURL;
