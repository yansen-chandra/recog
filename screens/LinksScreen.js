import React from 'react';
import {
  ActivityIndicator,
  Button,
  Clipboard,
  Image,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Constants, ImagePicker, Permissions } from 'expo';
import uuid from 'uuid';
import Base64 from 'react-native-base64';

export default class App extends React.Component {
  static navigationOptions = {
    title: 'Submit Receipt',
  };

  state = {
    image: null,
    uploading: false,
    processMessage: '',
  };

  async componentDidMount() {
    await Permissions.askAsync(Permissions.CAMERA_ROLL);
    await Permissions.askAsync(Permissions.CAMERA);
  }

  render() {
    let { image } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {image ? null : (
          <Image
            source={require('../assets/images/abbyy.png')}
            style={styles.welcomeImage}
          />
          // <Text
          //   style={{
          //     fontSize: 20,
          //     marginBottom: 20,
          //     textAlign: 'center',
          //     marginHorizontal: 15,
          //   }}>
          //   Submit Your Receipt
          // </Text>
        )}

        <Button
          onPress={this._pickImage}
          title="Pick from gallery"
        />

        <Button
          onPress={this._takePhoto}
          title="Take a photo" />

        <Button
          onPress={this._recognizeImageDummy}
          title="Sample Receipt" />

        {this._maybeRenderImage()}
        {this._maybeRenderUploadingOverlay()}

        <StatusBar barStyle="default" />
      </View>
    );
  }

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}>
          <Text style={styles.overlayLabel} >
            {this.state.processMessage}
          </Text>
          <ActivityIndicator color="#fff" animating size="large" />
        </View>
      );
    }
  };

  _maybeRenderImage = () => {
    let { image } = this.state;
    if (!image) {
      return;
    }

    return (
      <View
        style={{
          marginTop: 30,
          width: 250,
          borderRadius: 3,
          elevation: 2,
        }}>
        <View
          style={{
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            shadowColor: 'rgba(0,0,0,1)',
            shadowOpacity: 0.2,
            shadowOffset: { width: 4, height: 4 },
            shadowRadius: 5,
            overflow: 'hidden',
          }}>
          <Image source={{ uri: image }} style={{ width: 250, height: 250 }} />
        </View>

        <Text
          onPress={this._copyToClipboard}
          onLongPress={this._share}
          style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
          {image}
        </Text>

        <Button
          onPress={this._recognizeImage}
          title="Recognize Receipt"
        />

      </View>
    );
  };

  _share = () => {
    Share.share({
      message: this.state.image,
      title: 'Check out this photo',
      url: this.state.image,
    });
  };

  _copyToClipboard = () => {
    Clipboard.setString(this.state.image);
    alert('Copied image URL to clipboard');
  };

  _takePhoto = async () => {
    let pickerResult = await ImagePicker.launchCameraAsync({
      //allowsEditing: true,
      //aspect: [4, 3],
      quality: 0.2,
    });

    this.setState({ uploading: true });
    this._handleImagePicked(pickerResult);
  };

  _pickImage = async () => {
    let pickerResult = await ImagePicker.launchImageLibraryAsync({
      //allowsEditing: true,
      //aspect: [4, 3],
    });

    this.setState({ uploading: true });
    this._handleImagePicked(pickerResult);
  };

  _handleImagePicked = async pickerResult => {
    try {
      this.setState({ uploading: true });

      if (!pickerResult.cancelled) {
        //uploadUrl = await uploadImageAsync(pickerResult.uri);
        this.setState({ image: pickerResult.uri });
        await this._recognizeImage();
      }
    } catch (e) {
      console.log(e);
      alert('Upload failed, sorry :(');
    } finally {
      this.setState({ uploading: false });
    }
  };

  _goToForm = (receipt) => {
    this.props.navigation.navigate('Form', {receipt});
  };

  _recognizeImageDummy = async () => {

    this._fetchTaskStatus('5d5f41ad-c2fd-493c-8555-1c109c80a18c')
      .then(resultUrl => this._fetchTaskResult(resultUrl))
      .then(receipt => {
        //this.props.navigation.getParam("setScannedReceipt", (receipt) => { return; })(receipt);
        console.log('parsed receipt', receipt);
        this._goToForm(receipt);
      })
      .catch(err => {
        console.log(err);
        alert(err);
        this.setState({ uploading: false });
      });

  };

  _recognizeImage = async () => {
    uri = this.state.image;
    if (uri) {
        this.setState({ uploading: true, processMessage: "Uploading Receipt ..." });

      const url = 'https://cloud.ocrsdk.com/processReceipt?exportFormat=xml&country=Singapore&imageSource=photo';
      const response = await fetch(uri);
      const blob = await response.blob();
      const config = {
        method: 'POST',
        headers: {
          Accept: 'application/xml',
          'Content-Type': 'application/octec-stream;',
          Authorization: getAuthString()//'Basic ZmFwbF9yZWNlaXB0X3NjYW46UGdjZlVXblcvcERmVWFWVWRTOWQ5NHFl'
        },
        body: blob
      };

      fetch(url, config)
       .then(response => response.text()) //get response xml
       .then(xml => xml2JsParser(xml)) //parse xml object
       .then(result => {
         console.log("xml result", result);
         console.log("xml id", result.response.task[0].$.id);
         this.setState({ uploading: true, processMessage: "Processing Receipt ... " });
         return result.response.task[0].$.id;
       }) // get task id
       .then(taskId => this._fetchTaskStatus(taskId, 1000)) //poll task until complete
       .then(resultUrl => this._fetchTaskResult(resultUrl)) //result url
       .then(receipt => {
         //this.props.navigation.getParam("setScannedReceipt", (receipt) => { return; })(receipt);
         this.props.navigation.navigate('Form', {receipt: receipt});
       })
       .catch(err => {
         console.log(err);
         alert(err);
         this.setState({ uploading: false });
        });
     }
  };

  _fetchTaskStatus = (taskId, interval) => {
    interval = interval || 1000;
    var getResult = function(resolve, reject) {
      const config = {
        method: 'GET',
        headers: {
          //Accept: 'application/xml',
          Authorization: getAuthString()//'Basic ZmFwbF9yZWNlaXB0X3NjYW46UGdjZlVXblcvcERmVWFWVWRTOWQ5NHFl'
        }
      };
      const url = 'https://cloud.ocrsdk.com/getTaskStatus?taskId='+taskId;
      fetch(url, config)
       .then(response => response.text())
       .then(xml => xml2JsParser(xml))
       .then(result => {
         console.log("xml task status:", result);
         const status = result.response.task[0].$.status;
         complete = status == "Completed";
         if(complete)
         {
           var resultUrl = result.response.task[0].$.resultUrl;
           resolve(resultUrl);
         }
         else {
          setTimeout(getResult, interval, resolve, reject);
         }
       })
       .catch(err => { reject(err); });
    };
    return new Promise(getResult);
  }

  _fetchTaskResult = async (url) => {
    this.setState({ uploading: true, processMessage: "Get Receipt Info... " });
    console.log("xml task result url:", url);
    var receipt = await fetch(url)
      .then(response => response.text())
      .then(xml => xml2JsParser(xml))
      .then(result => {
        console.log("xml receipt result:", result.receipts.receipt[0].total);
        console.log("xml receipt result:", result.receipts.receipt[0].date[0].normalizedValue);
        console.log("xml receipt result:", result.receipts.receipt[0].total[0].normalizedValue);
        this.setState({ uploading: false, processMessage: "Completed." });
        let rec = result.receipts.receipt[0];
        const total = rec.total ? rec.total[0].normalizedValue[0] : 0;
        const date =  rec.date ? rec.date[0].normalizedValue[0] : null;
        const receipt = { total, date : date ? new Date(date) : null };
        return receipt;
      });
      return receipt;
  }


}

// async function uploadImageAsync(uri) {
//   // const response = await fetch(uri);
//   // const blob = await response.blob();
//   // const ref = firebase
//   //   .storage()
//   //   .ref()
//   //   .child(uuid.v4());
//   //
//   // const snapshot = await ref.put(blob);
//   // return snapshot.downloadURL;
//   return uri;
// }


const xml2JsParser = (xml) => {
  return new Promise(function(resolve, reject)
  {
      var parseString = require('xml2js').parseString;
      parseString(xml, function(err, result){
           if(err){
               reject(err);
           }
           else {
               resolve(result);
           }
      });
  });
}

const getAuthString = (appid,password) => {
  appid = appid || 'aileronstahn1';
  password = password || 'gbQgnNINdFG5G2UHyipTiF1n';
  var text = `${appid}:${password}`;
  console.log('auth', text);
  var encoded = Base64.encode(text);
  console.log('auth encoded', encoded);
  return  `Basic ${encoded}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 24,
    textAlign: 'center',
  },
  tabBarInfoText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
  overlayLabel: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 20,
  },
});
