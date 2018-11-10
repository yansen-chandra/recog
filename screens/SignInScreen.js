

import React from 'react';
import {
  Image, Platform,
  ScrollView, StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { WebBrowser } from 'expo';
import { MonoText } from '../components/StyledText';
import { Card, Button, FormLabel, FormInput, FormValidationMessage } from "react-native-elements";
import { onSignIn, onSignOut, isSignedIn } from "../app/auth";
import Overlay from "./Overlay";
import Spinner from 'react-native-loading-spinner-overlay';

export default class SignInScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const {state} = navigation;
    console.log(state);
    return {
      title: 'Login',
      tabBarLabel: state.params && state.params.signedIn ? 'My Account' : 'Sign In',
    };
  };

  state = {
    username: '',
    password: '',
    processing: false,
    signedIn: false,
  };

  _maybeRenderUploadingOverlay = () => {
    if (this.state.processing) {
      return (
        <Overlay message="Loading..." processing="true" />
      );
    }
    // return(
    //   <Spinner
    //     visible={this.state.processing}
    //     textContent={'Loading'}
    //     textStyle={{color: '#eee'}}
    //   />
    // );
  };

  componentDidMount() {
    isSignedIn()
      .then(res => this.setState({ signedIn: res }))
      .catch(err => alert(err));
  }
  _showError = (error) => {
    this.setState({error});
    //alert(error);
  };

  _onLogin = () => {
    if(!this.state.username)
    {
      this._showError('Please key in user name.');
      return;
    }
    this.setState({processing: true});
    fetch(`https://fj-demo-app.azurewebsites.net/api/user/get/${this.state.username}`)
    .then((response) => response.json())
    .then(user => {
      this.setState({processing: false});
      console.log(user);
      if(!user)
      {
        this._showError('User not found.');
      }
      else if(user.MobileNumber != this.state.password)
      {
        this._showError('Password not valid.');
      }
      else if(user.Deleted)
      {
        this._showError('User not active.');
      }
      else {
        onSignIn().then(() => {
          this.setState({signedIn: true, username: '', password: ''});
          this.props.navigation.setParams({ signedIn: true })
          this.props.navigation.navigate('Links');
        });
      }
    })
    ;
  };

  render() {
    let form = this.state.signedIn ?
      <Card image={require('../assets/images/header.png')}>
        <Button
          buttonStyle={{ marginTop: 10 }}
          backgroundColor="#03A9F4"
          title="SIGN OUT"
          onPress={() => {
            this.setState({processing: true});
            onSignOut().then(() => {
              this.setState({signedIn: false, processing: false});
              this.props.navigation.setParams({ signedIn: false })
            });
          }}
        />
      </Card>
    :
      <Card image={require('../assets/images/header.png')}>
        <FormLabel>Username</FormLabel>
        <FormInput placeholder="Username..."
          value={this.state.username}
          onChangeText={text => this.setState({ username: text})}
        />
        <FormLabel>Password</FormLabel>
        <FormInput secureTextEntry placeholder="Password..."
          value={this.state.password}
          onChangeText={text => this.setState({ password: text})}
        />

        <FormValidationMessage>{this.state.error}</FormValidationMessage>
        <Button
          buttonStyle={{ marginTop: 20 }}
          backgroundColor="#03A9F4"
          title="SIGN IN"
          onPress={this._onLogin}
        />
      </Card>
    ;

    return(
      <View style={{ paddingVertical: 10 }}>
        {form}
        <Spinner
          visible={this.state.processing}
          textContent={'Loading'}
          textStyle={{color: '#eee'}}
        />
      </View>
    );

  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
