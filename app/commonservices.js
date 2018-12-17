import Base64 from 'react-native-base64';

export const getAuthString = (appid,password) => {
  var text = `${appid}:${password}`;
  console.log('auth', text);
  var encoded = Base64.encode(text);
  console.log('auth encoded', encoded);
  return  `Basic ${encoded}`;
}

export default CommonServices = {
  getAuthString
};
