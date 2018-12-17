import { AsyncStorage } from "react-native";
import Base64 from 'react-native-base64';
import FJService from './fjservices';
import CommonServices from './commonservices';

export const USER_KEY = "auth-key";
//export const SETTING_KEY = "setting-key";

export const doLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    FJService.getUser(username).then((user) => {
      if(!user)
      {
        reject('User not found.');
      }
      else if(user.MobileNumber != password)
      {
        reject('Password not valid.');
      }
      else if(user.Deleted)
      {
        reject('User not active.');
      }
      else
      {
        let loginUser = { id: user.Username, mobile: user.MobileNumber, name: user.Fullname };
        if(user.Company)
        {
          loginUser.settings = { OCRAppName : user.Company.OCRAppName, OCRPassword: user.Company.OCRPassword };
          loginUser.options = user.Company.Options;
        }
        onSignIn(loginUser).then(() => {
           resolve(loginUser);
        });
      }
    })
    .catch(err => reject(err));
  });
}

export const onSignIn = (user) => {
  return AsyncStorage.setItem(USER_KEY, JSON.stringify( user ));
};

export const onSyncSettings = () => {
  return new Promise((resolve, reject) => {
    isSignedIn()
      .then(res => {
        if (res) {
          doLogin(res.id, res.mobile)
          .then((user) => {
            resolve(user);
          })
          .catch(err => {
            onSignOut().then(
              () => {resolve(true);}
            );
          });
        }
        else {
          resolve(true);
        }
      })
      .catch(err => reject(err));
  });

};

export const onSignOut = () => {
  return AsyncStorage.removeItem(USER_KEY);
};

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(USER_KEY)
      .then(res => {
        if (res !== null) {
          //console.log("Issignedin User Key", res);
          resolve(JSON.parse(res));
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};

// export const getAuthString = (appid,password) => {
//   //appid = appid || 'aileronstahn1';
//   //password = password || 'gbQgnNINdFG5G2UHyipTiF1n';
//   //appid = appid || 'fjdemoapp';
//   //password = password || '7Ks2ZIlOa303WARixoFFI+Kz';
//
//   var text = `${appid}:${password}`;
//   console.log('auth', text);
//   var encoded = Base64.encode(text);
//   console.log('auth encoded', encoded);
//   return  `Basic ${encoded}`;
// }

export default Auth = {
  onSignIn, onSignOut, isSignedIn, onSyncSettings, doLogin
};
