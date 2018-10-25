import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { Camera, Permissions, FileSystem } from 'expo';

export default class ScanScreen extends React.Component {
  static navigationOptions = {
    title: 'Scan Receipt',
  };

  state = {
     hasCameraPermission: null,
     type: Camera.Constants.Type.back,
     message: '',
     captured: null
  };

  async componentWillMount() {
   const { status } = await Permissions.askAsync(Permissions.CAMERA);
   this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
      const { hasCameraPermission } = this.state;
      if (hasCameraPermission === null) {
        return <ScrollView />;
      } else if (hasCameraPermission === false) {
        return <Text>No access to camera</Text>;
      } else {
        return (
          <View style={styles.container} >
          <View style={{flex: 0.3}}>
          if(this.state.captured)
          {
            <Image
              source={{
                  uri: this.state.captured === null ? '' : this.state.captured.uri,
                }}
              style={{height: 100, width:100}}
              />
          }
            </View>
            <Camera style={{ flex: 0.5 }} type={this.state.type}
              ref={ (ref) => {this.camera = ref} }
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  flexDirection: 'row',
                }}>
                <TouchableOpacity
                  style={{
                    flex: 0.1,
                    alignSelf: 'flex-end',
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    this.setState({
                      type: this.state.type === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back,
                    });
                  }}>
                  <Text
                    style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                    {' '}Flip{' '}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ flex: 0.1, alignSelf: 'flex-end', alignItems: 'center', }}
                  onPress={() => { this.snapPhoto(); }}>
                  <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                    {' '}Snap{' '}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ alignSelf: 'center' }}
                  onPress={this.takePicture}
                >
                        <Text
                          style={{ fontSize: 18, marginBottom: 10, color: 'black' }}>
                          {' '}Capture{' '}
                        </Text>
                  </TouchableOpacity>

              </View>
            </Camera>
            <View  style={{ flex: 0.2 }}>
              <Text
                style={{ fontSize: 18, marginBottom: 10, color: 'red' }}>
                {this.state.message}
              </Text>
            </View>
          </View>
        );
      }
    }

    async snapPhoto() {
        console.log('Button Pressed');
        if (this.camera) {
           console.log('Taking photo');
           const options = { quality: 1, base64: true, fixOrientation: true,
           exif: true};
           await this.camera.takePictureAsync(options).then(photo => {
              photo.exif.Orientation = 1;
              this.setMessage("snapPhoto capturedred");
              this.setState({captured : photo});
               console.log(photo);
           });
         }
    }


  takePicture = () => {
    if (this.camera) {
      this.camera.takePictureAsync({ onPictureSaved: this.onPictureSaved });
    }
  };

  handleMountError = ({ message }) => console.error(message);
  setMessage(msg){
    this.setState({message: msg});
  }
  onPictureSaved = async photo => {
    this.setMessage("Photo Captured");
    await FileSystem.moveAsync({
      from: photo.uri,
      to: `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`,
    });
    //this.setState({ newPhotos: true });
  }


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
