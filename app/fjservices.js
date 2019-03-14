import Constants from './constants';
import Base64 from 'react-native-base64';
import { getAuthString } from './commonservices';

function createHeader()
{
  return {
    Authorization: getAuthString(Constants.FJApi.apiUser, Constants.FJApi.apiPassword)
  };
}

async function get(url) {
   try {
     const config = {
       method: 'GET',
       headers: createHeader(),
     };
     const resp = await fetch(url, config)
      .then((response) => response.json());
     //console.log(`Get ${url} response:`, resp);
     return resp;
   } catch (err) {
        console.log(err)
   }
}

async function post(url, data) {
   try {
     let headers = createHeader();
     headers['Accept'] = 'application/json';
     headers['Content-Type'] = 'application/json';
     const config = {
       method: 'POST',
       headers: headers,
       body: JSON.stringify(data)
     };
     const resp = await fetch(url, config)
     .then((response) => response.json());
     console.log(`POST ${url} response:`, resp);
     return resp;
   } catch (err) {
        console.log(err)
   }
}

export default {
  getCompany: function(companyId){
    const url = `${Constants.FJApi.getCompany}/${companyId}`;
    return get(url);
  },
  getUser: function(userid){
    const url = `${Constants.FJApi.getUser}/${userid}`;
    return get(url);
  },
  getExchangeRate: function(){
    const url = `${Constants.FJApi.getLookup}?type=ExchangeRate`;
    return get(url);
  },
  postClaim: function(data){
    const url = Constants.FJApi.postClaim;
    return post(url, data);
  }
}
