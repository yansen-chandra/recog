import { AsyncStorage } from "react-native";
import Base64 from 'react-native-base64';

export const USER_KEY = "auth-key";

export const onSignIn = (user, mobile) => {
  return AsyncStorage.setItem(USER_KEY, JSON.stringify( { id: user, mobile: mobile }));
};

export const onSignOut = () => {
  return AsyncStorage.removeItem(USER_KEY);
};

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(USER_KEY)
      .then(res => {
        if (res !== null) {
          console.log("User Key", res);
          resolve(JSON.parse(res));
        } else {
          resolve(false);
        }
      })
      .catch(err => reject(err));
  });
};

// export const getSignedInUser = () => {
//   return new Promise((resolve, reject) => {
//     AsyncStorage.getItem(USER_KEY)
//       .then(res => {
//         console.log(res);
//         if (res !== null) {
//           resolve(JSON.parse(res));
//         } else {
//           resolve(null);
//         }
//       })
//       .catch(err => reject(err));
//   });
//   //const str = await AsyncStorage.getItem(USER_KEY);
//   //return JSON.parse(str);
// };

export const getAuthString = (appid,password) => {
  //appid = appid || 'aileronstahn1';
  //password = password || 'gbQgnNINdFG5G2UHyipTiF1n';
  appid = appid || 'fjdemoapp';
  password = password || '7Ks2ZIlOa303WARixoFFI+Kz';

  var text = `${appid}:${password}`;
  console.log('auth', text);
  var encoded = Base64.encode(text);
  console.log('auth encoded', encoded);
  return  `Basic ${encoded}`;
}

//export default isSignedIn;
