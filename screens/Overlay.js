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

export default class Overlay extends React.Component {

  constructor(props) {
     super(props);
     this.state = {message: props.message, processing: props.processing};
   }

   componentWillReceiveProps(props) {
    this.setState({message: props.message, processing: props.processing});
   }

   _maybeRenderUploadingOverlay = () => {
     if (this.state.processing) {
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
             {this.state.message}
           </Text>
           <ActivityIndicator color="#fff" animating size="large" />
         </View>
       );
     }
     else {
     {
       return null;
     }
     }
   };

  render() {
    return (
        this._maybeRenderUploadingOverlay()
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  overlayLabel: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    padding: 10,
    marginBottom: 20,
  },
});
