

import React from 'react';
import {
  Image, Platform,
  ScrollView, StyleSheet,
  Text, TouchableOpacity,
  View
} from 'react-native';
import { WebBrowser } from 'expo';
import { MonoText } from '../components/StyledText';
import { Card, Button, FormLabel, FormInput } from "react-native-elements";
import { onSignIn, onSignOut, isSignedIn } from "../app/auth";
import Overlay from "./Overlay";

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
  };

  componentDidMount() {
    isSignedIn()
      .then(res => this.setState({ signedIn: res }))
      .catch(err => alert(err));
  }

  render() {
    if(!this.state.signedIn)
    {
      return(
        <View style={{ paddingVertical: 20 }}>
          <Card>
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

            <Button
              buttonStyle={{ marginTop: 20 }}
              backgroundColor="#03A9F4"
              title="SIGN IN"
              onPress={() => {
                this.setState({processing: true});
                fetch(`https://fj-demo-app.azurewebsites.net/api/user/get/${this.state.username}`)
                .then((response) => response.json())
                .then(user => {
                  this.setState({processing: false});
                  console.log(user);
                  if(user.MobileNumber != this.state.password)
                  {
                    alert('Password not valid');
                  }
                  else if(user.Deleted)
                  {
                    alert('User not active');
                  }
                  else {
                    onSignIn().then(() => {
                      this.setState({signedIn: true, username: '', password: ''});
                      this.props.navigation.setParams({ signedIn: true })
                      this.props.navigation.navigate('Links');
                    });
                  }
                });
              }}
            />
          </Card>
          {this._maybeRenderUploadingOverlay()}
        </View>
      );
    }
    else {
      return (
        <View style={{ paddingVertical: 20 }}>
          <Card>
            <Button
              buttonStyle={{ marginTop: 20 }}
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
        </View>
      );
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
