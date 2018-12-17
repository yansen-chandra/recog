import React, { Component } from 'react';
import {
  ScrollView, KeyboardAvoidingView, Text,
  StatusBar, TextInput, View, StyleSheet,
} from 'react-native';
import { Card, Button, FormLabel, FormInput, CheckBox  } from "react-native-elements";
import { Constants } from 'expo';
import Spinner from 'react-native-loading-spinner-overlay';

import { isSignedIn, getAuthString } from "../app/auth";
import { FJApi, Styles, ClaimTypes } from "../app/constants";
import EntertainmentForm from '../Components/EntertainmentForm';

export default class ClaimScreen extends Component {
  static navigationOptions = {
    title: 'Submit Receipt',
  };

  constructor(props) {
    super(props);
    this.state = {
      receipt: null,
      user: null,
    };
  }

  componentDidMount(){
   console.log('form did mount');
   this.props.navigation.addListener('willFocus', this._load);
  }

  _load = () => {
    console.log('form load');
    isSignedIn()
    .then(res => {
      if(!res)
      {
        alert("Please Sign In");
        this.props.navigation.navigate('SignIn');
      }
      else {
        console.log("Form Screen User:", res);
        this.setState({user: res});
      }
    })
    .catch(err => alert(err));

    const receipt = this.props.navigation.getParam("receipt", null);
    console.log('Scanned receipt', receipt);
    if(receipt)
    {
      this.setState({ receipt: receipt });
    }
  }


  render() {
    return (
      <EntertainmentForm claimType={ClaimTypes.Entertainment} receipt={this.state.receipt} />
    );
  }



}
