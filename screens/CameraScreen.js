import { Constants, Camera, FileSystem, Permissions, BarCodeScanner } from 'expo';
import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Slider,
  Platform,
  ActivityIndicator
} from 'react-native';
import GalleryScreen from './GalleryScreen';
//import isIPhoneX from 'react-native-is-iphonex';
//import RNFetchBlob from 'react-native-fetch-blob';
import b64 from 'base64-js';

import {
  Ionicons,
  MaterialIcons,
  Foundation,
  MaterialCommunityIcons,
  Octicons
} from '@expo/vector-icons';

const landmarkSize = 2;

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

const flashIcons = {
  off: 'flash-off',
  on: 'flash-on',
  auto: 'flash-auto',
  torch: 'highlight'
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto',
};

const wbIcons = {
  auto: 'wb-auto',
  sunny: 'wb-sunny',
  cloudy: 'wb-cloudy',
  shadow: 'beach-access',
  fluorescent: 'wb-iridescent',
  incandescent: 'wb-incandescent',
};

export default class CameraScreen extends React.Component {
  static navigationOptions = {
    title: 'Snap Receipt',
  };
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    type: 'back',
    whiteBalance: 'auto',
    ratio: '16:9',
    ratios: [],
    barcodeScanning: false,
    faceDetecting: false,
    faces: [],
    newPhotos: false,
    permissionsGranted: false,
    pictureSize: undefined,
    pictureSizes: [],
    pictureSizeId: 0,
    showGallery: false,
    showMoreOptions: false,
    uploading: false,
    processMessage: '',
  };

  async componentWillMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ permissionsGranted: status === 'granted' });
  }

  componentDidMount() {
    FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'photos').catch(e => {
      console.log(e, 'Directory exists');
    });
  }

  getRatios = async () => {
    const ratios = await this.camera.getSupportedRatios();
    return ratios;
  };

  toggleView = () => this.setState({ showGallery: !this.state.showGallery, newPhotos: false });

  toggleMoreOptions = () => this.setState({ showMoreOptions: !this.state.showMoreOptions });

  toggleFacing = () => this.setState({ type: this.state.type === 'back' ? 'front' : 'back' });

  toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

  setRatio = ratio => this.setState({ ratio });

  toggleWB = () => this.setState({ whiteBalance: wbOrder[this.state.whiteBalance] });

  toggleFocus = () => this.setState({ autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on' });

  zoomOut = () => this.setState({ zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1 });

  zoomIn = () => this.setState({ zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1 });

  setFocusDepth = depth => this.setState({ depth });

  toggleBarcodeScanning = () => this.setState({ barcodeScanning: !this.state.barcodeScanning });

  toggleFaceDetection = () => this.setState({ faceDetecting: !this.state.faceDetecting });

  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ base64: true, onPictureSaved: this.onPictureSaved });
    }
  };

  handleMountError = ({ message }) => console.error(message);

  onPictureSaved = async photo => {
      console.log('captured photo : ', photo.uri);
      if (photo.uri) {
        this.setState({ uploading: true, processMessage: "Uploading Receipt ..." });
        const url = 'https://cloud.ocrsdk.com/processReceipt?exportFormat=xml&country=Singapore&imageSource=photo';
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        const config = {
          method: 'POST',
          headers: {
            Accept: 'application/xml',
            'Content-Type': 'application/octec-stream;',
            Authorization: 'Basic ZmFwbF9yZWNlaXB0X3NjYW46UGdjZlVXblcvcERmVWFWVWRTOWQ5NHFl'
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
         .then(taskId => this.fetchTaskStatus(taskId, 1000)) //poll task until complete
         .then(resultUrl => this.fetchTaskResult(resultUrl)) //result url
         .catch(err => { console.log(err); });
       }

  {/*
    await FileSystem.moveAsync({
      from: photo.uri,
      to: `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`,
    });
    this.setState({ newPhotos: true });
  */}

  }

  checkStatus = (taskId) => {
    const config = {
      method: 'GET',
      headers: {
        //Accept: 'application/xml',
        Authorization: 'Basic ZmFwbF9yZWNlaXB0X3NjYW46UGdjZlVXblcvcERmVWFWVWRTOWQ5NHFl'
      }
    };
    var complete = false;
    var resultUrl = null;
    const url = 'https://cloud.ocrsdk.com/getTaskStatus?taskId='+taskId;
    fetch(url, config)
     .then(response => { return response.text(); })
     .then(xml => {
          xml2JsParser(xml)
         .then((result) => {
           console.log("xml task status:", result);
           complete = result.response.task[0].$.status == "Completed";
           if(complete)
           {
             resultUrl = result.response.task[0].$.resultUrl;
             //this.resultUrl = result.response.task[0].$.resultUrl;
             //this.timer = null;
             //this.fetchTaskResult(resultUrl);
           }
         })
       .catch(err => { console.log(err); });
     })
     .catch(err => {
       console.log(err);
       result = true;
     });
     return resultUrl;
   }

  pollFetch = (fn, cnd, timeout, interval) => {
     var endTime = Number(new Date()) + (timeout || 2000);
     interval = interval || 100;

     var checkCondition = function(resolve, reject) {
         // If the condition is met, we're done!
         var result = fn();
         console.log(result);
         var stop = cnd(result);
         console.log(stop);
         if(stop) {
             resolve(result);
         }
         // If the condition isn't met but the timeout hasn't elapsed, go again
         else if (Number(new Date()) < endTime) {
             setTimeout(checkCondition, interval, resolve, reject);
         }
         // Didn't match and too much time, reject!
         else {
             reject(new Error('timed out for ' + fn + ': ' + arguments));
         }
     };
     return new Promise(checkCondition);
  }

  fetchTaskStatus = (taskId, interval) => {
    interval = interval || 1000;
    var getResult = function(resolve, reject) {
      const config = {
        method: 'GET',
        headers: {
          //Accept: 'application/xml',
          Authorization: 'Basic ZmFwbF9yZWNlaXB0X3NjYW46UGdjZlVXblcvcERmVWFWVWRTOWQ5NHFl'
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

  fetchTaskResult = (url) => {
    this.setState({ uploading: true, processMessage: "Get Receipt Info... " });
    console.log("xml task result url:", url);
     fetch(url)
      .then(response => response.text())
      .then(xml => xml2JsParser(xml))
      .then(result => {
        //console.log("xml receipt result:", result.receipts.receipt);
        console.log("xml receipt result:", result.receipts.receipt[0].total);
        console.log("xml receipt result:", result.receipts.receipt[0].date[0].normalizedValue);
        console.log("xml receipt result:", result.receipts.receipt[0].total[0].normalizedValue);
        this.setState({ uploading: false, processMessage: "Completed." });
        const total = result.receipts.receipt[0].total[0].normalizedValue[0];
        const date = result.receipts.receipt[0].date[0].normalizedValue[0];
        const receipt = { total, date };
        this.props.navigation.getParam("setScannedReceipt", (receipt) => { return; })(receipt);
        this.props.navigation.navigate('Form', {receipt});
      });
  }

  _maybeRenderUploadingOverlay = () => {
    if (this.state.uploading) {
      return (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: 'rgba(0,0,0,0.7)',
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

  onBarCodeScanned = code => {
    this.setState(
      { barcodeScanning: !this.state.barcodeScanning },
      Alert.alert(`Barcode found: ${code.data}`)
    );
  };

  onFacesDetected = ({ faces }) => this.setState({ faces });
  onFaceDetectionError = state => console.warn('Faces detection error:', state);

  collectPictureSizes = async () => {
    if (this.camera) {
      const pictureSizes = await this.camera.getAvailablePictureSizesAsync(this.state.ratio);
      let pictureSizeId = 0;
      if (Platform.OS === 'ios') {
        pictureSizeId = pictureSizes.indexOf('High');
      } else {
        // returned array is sorted in ascending order - default size is the largest one
        pictureSizeId = pictureSizes.length-1;
      }
      this.setState({ pictureSizes, pictureSizeId, pictureSize: pictureSizes[pictureSizeId] });
    }
  };

  previousPictureSize = () => this.changePictureSize(1);
  nextPictureSize = () => this.changePictureSize(-1);

  changePictureSize = direction => {
    let newId = this.state.pictureSizeId + direction;
    const length = this.state.pictureSizes.length;
    if (newId >= length) {
      newId = 0;
    } else if (newId < 0) {
      newId = length -1;
    }
    this.setState({ pictureSize: this.state.pictureSizes[newId], pictureSizeId: newId });
  }

  renderGallery() {
    return <GalleryScreen onPress={this.toggleView.bind(this)} />;
  }

  renderFace({ bounds, faceID, rollAngle, yawAngle }) {
    return (
      <View
        key={faceID}
        transform={[
          { perspective: 600 },
          { rotateZ: `${rollAngle.toFixed(0)}deg` },
          { rotateY: `${yawAngle.toFixed(0)}deg` },
        ]}
        style={[
          styles.face,
          {
            ...bounds.size,
            left: bounds.origin.x,
            top: bounds.origin.y,
          },
        ]}>
        <Text style={styles.faceText}>ID: {faceID}</Text>
        <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
        <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
      </View>
    );
  }

  renderLandmarksOfFace(face) {
    const renderLandmark = position =>
      position && (
        <View
          style={[
            styles.landmark,
            {
              left: position.x - landmarkSize / 2,
              top: position.y - landmarkSize / 2,
            },
          ]}
        />
      );
    return (
      <View key={`landmarks-${face.faceID}`}>
        {renderLandmark(face.leftEyePosition)}
        {renderLandmark(face.rightEyePosition)}
        {renderLandmark(face.leftEarPosition)}
        {renderLandmark(face.rightEarPosition)}
        {renderLandmark(face.leftCheekPosition)}
        {renderLandmark(face.rightCheekPosition)}
        {renderLandmark(face.leftMouthPosition)}
        {renderLandmark(face.mouthPosition)}
        {renderLandmark(face.rightMouthPosition)}
        {renderLandmark(face.noseBasePosition)}
        {renderLandmark(face.bottomMouthPosition)}
      </View>
    );
  }

  renderFaces = () =>
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>

  renderLandmarks = () =>
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderLandmarksOfFace)}
    </View>

  renderNoPermissions = () =>
    <View style={styles.noPermissions}>
      <Text style={{ color: 'white' }}>
        Camera permissions not granted - cannot open camera preview.
      </Text>
    </View>

  renderTopBar = () =>
    <View
      style={styles.topBar}>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFacing}>
        <Ionicons name="ios-reverse-camera" size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFlash}>
        <MaterialIcons name={flashIcons[this.state.flash]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleWB}>
        <MaterialIcons name={wbIcons[this.state.whiteBalance]} size={32} color="white" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.toggleFocus}>
        <Text style={[styles.autoFocusLabel, { color: this.state.autoFocus === 'on' ? "white" : "#6b6b6b" }]}>AF</Text>
      </TouchableOpacity>
    </View>

  renderBottomBar = () =>
    <View
      style={styles.bottomBar}>
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleMoreOptions}>
        <Octicons name="kebab-horizontal" size={30} color="white"/>
      </TouchableOpacity>
      <View style={{ flex: 0.4 }}>
        <TouchableOpacity
          onPress={this.takePicture}
          style={{ alignSelf: 'center' }}
        >
          <Ionicons name="ios-radio-button-on" size={70} color="white" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.bottomButton} onPress={this.toggleView}>
        <View>
          <Foundation name="thumbnails" size={30} color="white" />
          {this.state.newPhotos && <View style={styles.newPhotosDot}/>}
        </View>
      </TouchableOpacity>
    </View>

  renderMoreOptions = () =>
    (
      <View style={styles.options}>
        <View style={styles.detectors}>
          <TouchableOpacity onPress={this.toggleFaceDetection}>
            <MaterialIcons name="tag-faces" size={32} color={this.state.faceDetecting ? "white" : "#858585" } />
          </TouchableOpacity>
          <TouchableOpacity onPress={this.toggleBarcodeScanning}>
            <MaterialCommunityIcons name="barcode-scan" size={32} color={this.state.barcodeScanning ? "white" : "#858585" } />
          </TouchableOpacity>
        </View>

        <View style={styles.pictureSizeContainer}>
          <Text style={styles.pictureQualityLabel}>Picture quality</Text>
          <View style={styles.pictureSizeChooser}>
            <TouchableOpacity onPress={this.previousPictureSize} style={{ padding: 6 }}>
              <Ionicons name="md-arrow-dropleft" size={14} color="white" />
            </TouchableOpacity>
            <View style={styles.pictureSizeLabel}>
              <Text style={{color: 'white'}}>{this.state.pictureSize}</Text>
            </View>
            <TouchableOpacity onPress={this.nextPictureSize} style={{ padding: 6 }}>
              <Ionicons name="md-arrow-dropright" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );

  renderCamera = () =>
    (
      <View style={{ flex: 1 }}>
        <Camera
          ref={ref => {
            this.camera = ref;
          }}
          base64={true}
          style={styles.camera}
          onCameraReady={this.collectPictureSizes}
          type={this.state.type}
          flashMode={this.state.flash}
          autoFocus={this.state.autoFocus}
          zoom={this.state.zoom}
          whiteBalance={this.state.whiteBalance}
          ratio={this.state.ratio}
          pictureSize={this.state.pictureSize}
          onMountError={this.handleMountError}
          onFacesDetected={this.state.faceDetecting ? this.onFacesDetected : undefined}
          onFaceDetectionError={this.onFaceDetectionError}
          barCodeScannerSettings={{
            barCodeTypes: [
              BarCodeScanner.Constants.BarCodeType.qr,
              BarCodeScanner.Constants.BarCodeType.pdf417,
            ],
          }}
          onBarCodeScanned={this.state.barcodeScanning ? this.onBarCodeScanned : undefined}
          >
          {this.renderTopBar()}
          {this.renderBottomBar()}
        </Camera>
        {this.state.faceDetecting && this.renderFaces()}
        {this.state.faceDetecting && this.renderLandmarks()}
        {this.state.showMoreOptions && this.renderMoreOptions()}
      </View>
    );

  render() {
    const cameraScreenContent = this.state.permissionsGranted
      ? this.renderCamera()
      : this.renderNoPermissions();
    const content = this.state.showGallery ? this.renderGallery() : cameraScreenContent;
    return <View style={styles.container}>{content} {this._maybeRenderUploadingOverlay()} </View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },
  overlayLabel: {
    backgroundColor: '#ffffff',
    padding: 10,
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight / 2,
  },
  bottomBar: {
    //paddingBottom: isIPhoneX ? 25 : 5,
    paddingBottom:  5,
    backgroundColor: 'transparent',
    alignSelf: 'flex-end',
    justifyContent: 'space-between',
    flex: 0.12,
    flexDirection: 'row',
  },
  noPermissions: {
    flex: 1,
    alignItems:'center',
    justifyContent: 'center',
    padding: 10,
  },
  gallery: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toggleButton: {
    flex: 0.25,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autoFocusLabel: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  bottomButton: {
    flex: 0.3,
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newPhotosDot: {
    position: 'absolute',
    top: 0,
    right: -5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4630EB'
  },
  options: {
    position: 'absolute',
    bottom: 80,
    left: 30,
    width: 200,
    height: 160,
    backgroundColor: '#000000BA',
    borderRadius: 4,
    padding: 10,
  },
  detectors: {
    flex: 0.5,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pictureQualityLabel: {
    fontSize: 10,
    marginVertical: 3,
    color: 'white'
  },
  pictureSizeContainer: {
    flex: 0.5,
    alignItems: 'center',
    paddingTop: 10,
  },
  pictureSizeChooser: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  pictureSizeLabel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  facesContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    top: 0,
  },
  face: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 2,
    position: 'absolute',
    borderColor: '#FFD700',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  landmark: {
    width: landmarkSize,
    height: landmarkSize,
    position: 'absolute',
    backgroundColor: 'red',
  },
  faceText: {
    color: '#FFD700',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
  },
});

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
