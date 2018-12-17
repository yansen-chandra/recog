import React, { Component } from 'react';
import {
  ScrollView, KeyboardAvoidingView,
  Text,
  StatusBar, TextInput, View, StyleSheet,
  DatePickerIOS, Platform,
  Picker, Label,
  Keyboard, TouchableOpacity, Alert,
} from 'react-native';
import { Card, Button, FormLabel, FormInput, CheckBox  } from "react-native-elements";
import DatePicker from 'react-native-datepicker';
import ModalWrapper from 'react-native-modal-wrapper';
import { Constants } from 'expo';
import { email } from 'react-native-communications';
import { isSignedIn, getAuthString } from "../app/auth";
import { FJApi, Styles } from "../app/constants";
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export default class EntertainmentForm extends Component {
  static navigationOptions = {
    title: 'Receipt Details',
  };
  constructor(props) {
    super(props);
    this.state = {
      user: props.user,
      receiptUri: '',
      receiptBase64: null,
      receiptDate: new Date(),
      receiptAmount: "0",
      receiptNo: '',
      costCenter: '',
      wbsElement: '',
      wbsElementLabel: '',
      amount: "0",
      amountPerHead: "0",
      type: '',
      typeLabel: '',
      reason: '',
      reasonLabel: '',
      hostOfficerName: '',
      delegatingOfficerName: '',
      noOfGuest: "2",
      guestNames: [],
      noOfStaff: "0",
      typePickerHide: true,
      reasonPickerHide: true,
      wbsPickerHide: true,
      receiptDateHide: true,

    };
  }

  componentDidMount(){
   console.log('form did mount');
   this.props.navigation.addListener('willFocus', this._load);
  }

  _load = () => {
    console.log('form load');
    isSignedIn()
    .then(user => {
      if(!user)
      {
        alert("Please Sign In!");
        this.props.navigation.navigate('SignIn');
      }
      else {
        console.log("Form Screen User:", user);
        this.setState({user: user, hostOfficerName: user.id});
      }
    })
    .catch(err => alert(err));

    const receipt = this.props.navigation.getParam("receipt", null);
    console.log('form receipt', receipt);
    if(receipt)
    {
      this.setState({
        receiptAmount: receipt.total,
        receiptDate: receipt.date ? receipt.date : new Date(),
        receiptUri: receipt.uri,
        receiptBase64: receipt.base64,
        type: this._getReceiptType(receipt)
      });
      this._calcAmountPerHead({receiptAmount: receipt.total});
    }
  }

  _getReceiptType = (receipt) =>
  {
    var type = "LUNCH";
    if(receipt.time)
    {
        var hour = parseInt(receipt.time.split(':')[0]);
        if(hour < 12)
        {
          type = "BREAKFAST";
        }
        else if(hour < 15)
        {
          type = "LUNCH";
        }
        else if(hour < 17)
        {
          type = "TEA";
        }
        else {
          type = "DINNER";
        }

    }
    return type;
  }

  render() {
    return (
      <KeyboardAwareScrollView
        extraScrollHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps='handled'
      >
         <View style={Styles.container}>
          <Card>
            <StatusBar barStyle="light-content" />
            {this._renderForm()}
            <Button
              buttonStyle={{ marginTop: 20 }}
              backgroundColor="#03A9F4"
              title="SUBMIT"
              onPress={this._submit}
            />
          </Card>
          <Spinner
            visible={this.state.processing}
            textContent={'Processing...'}
            textStyle={Styles.spinnerTextStyle}
          />
          </View>
          </KeyboardAwareScrollView>
    );
  }

  setStateData(propname, value)
  {
    var data = {...this.state.data};
    data[propname] = value;
    this.setState({data});
  }

  _calcAmountPerHead = (rec) =>
  {
    rec = rec || {};
    this.setState({amount: rec.receiptAmount || this.state.amount});
    var result =
      ( parseFloat(rec.receiptAmount || this.state.amount )
        / ( parseFloat(rec.noOfGuest || this.state.noOfGuest ) + parseFloat( rec.noOfStaff || this.state.noOfStaff ))
      ).toFixed(2)
    ;
    this.setState({amountPerHead: result});
    return result.toString();
  }

  _next = () => {
    //this._emailInput && this._emailInput.focus();
    Keyboard.dismiss();
  };

  _submit = async () => {
    //let data = JSON.stringify(this.state, null, 4);
    if(!this._validate())
      return;
    Alert.alert(
      'Confirm to submit this receipt?',
      '',
      [
        {text: 'Close', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Submit', onPress: () => this._sendResult()},
      ],
      { cancelable: false }
    )
  };

  _emailDialog = async (data) =>{
    email(['yansen.chandra@sg.fujitsu.com'], null, null, 'Receipt Scan Result', data);
  }

  _clearForm = () => {
    this.setState(
      {
        costCenter: '',
        wbsElement: '',
        receiptNo: '',
        receiptDate: new Date(),
        receiptAmount: "0",
        type: '',
        reason: '',
        noOfGuest: "2",
        guestNames: [],
        noOfStaff: "0",
        hostOfficerName: '',
        delegatingOfficerName: '',
        amount: "0",
        amountPerHead: "0",
        receiptUri: '',
        receiptBase64: null,
        typePickerHide: true,
        reasonPickerHide: true,
        receiptDateHide: true,
      }
    );
  };

  _validate = () => {
    let {
      receiptAmount,
      type,
      reason,
      noOfGuest,
      hostOfficerName,
      guestNames,
    } = this.state;
    if(receiptAmount <= 0)
    {
      alert('Receipt Amount cannot be 0.');
      return false;
    }
    if(noOfGuest <= 0)
    {
      alert('Number of Guest cannot be 0.');
      return false;
    }
    if(!type)
    {
      alert('Claim Per Diem Type is required.');
      return false;
    }
    if(!reason)
    {
      alert('Claim Reason is required.');
      return false;
    }
    if(!hostOfficerName)
    {
      alert('Host officer name is required.');
      return false;
    }
    return true;
  };

  _sendResult = async () => {
    try {
      this.setState({processing: true});
      var receiptImage = null;
      if(this.state.receiptUri)
      {
        const response = await fetch(this.state.receiptUri);
        let receiptImage = await response.blob();
        // const reader = new FileReader();
        // reader.readAsDataURL(receiptImage);
        // reader.onloadend = () => {
        //   let base64 = reader.result;
        //   console.log(base64);
        // };
      }
      const user = this.state.user;
      const data = {
        Claim: {
          ClaimType: 5,
          RequestBy: user.id,
          RequestPhoneNo: user.mobile,
          ReceiptDate: this.state.receiptDate,
          ReceiptAmount: this.state.receiptAmount,
          ReceiptNo: this.state.receiptNo,
          Type: this.state.type,
          Reason: this.state.reason,
          NoOfGuest: this.state.noOfGuest,
          GuestNames: this.state.guestNames.join(),
          ProjectNo: this.state.wbsElement,
          HostOfficerName: this.state.hostOfficerName,
          DelegatingOfficerName: this.state.delegatingOfficerName,
          NoOfStaff: this.state.noOfStaff,
        },
        ClaimImage: receiptImage,
        ClaimImageBase64: this.state.receiptBase64,
      };
      console.log("email post data", data);
      //const url = 'https://fj-demo-app.azurewebsites.net/api/user/postclaim'
      const config = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          Authorization: getAuthString('fjdemoadmin', 'Fuj1tsu123')
        },
        body: JSON.stringify(data)
      };
      fetch(FJApi.postClaim, config)
       .then(response => {
         console.log("send mail response",response);
         this.setState({ processing: false });
         return response.json();
       }) //\get response xml
       .then(res => {
         setTimeout(() => {
           //console.log(res.Message);
           //Alert.alert('Submit', res.Message);
           Alert.alert('Submit', `Claim ${res.Message.substring(0,8)} submitted successfully. (Approval amount subjected to claim limit.)`);
         }, 100);
         //clear form
         this._clearForm();
       })
       .catch(err => {
         console.log(err);
         alert(err);
         this.setState({ processing: false });
        });
    } catch (error) {
      console.error(error);
      this.setState({processing: false});
    }
  }

  _renderGuestInputs = () => {
    let inputs = [];
    if(this.state.noOfGuest && this.state.noOfGuest > 0) {
      this.setState((state) => {guestNames: new Array(parseInt(state.noOfGuest))});
    }
    for (let i = 0; i < this.state.noOfGuest; i++) {
      var name = `_inputGuestName${i}`;
      inputs.push(
        <FormLabel key={`text${name}`}>
          Guest #{(i+1).toString()}
        </FormLabel>
      );
      inputs.push(
        <FormInput
          key={name}
          style={Styles.input}
          value={this.state.guestNames[i]}
          onChangeText={text => {
            const items = this.state.guestNames;
            items[i] = text;
            this.forceUpdate();
          }}
          ref={ref => {this[name] = ref}}
          placeholder={`Name/Designation/Company`}
        />
      );
    }
    return inputs;
  }

  _closeButton = (onpress) => {
   return <Button
     buttonStyle={{ marginTop: 10, marginBottom: -10, alignSelf: 'flex-end', zIndex:9  }}
     title="Done"
     onPress={onpress}
   />
   ;
 }

  _renderTypeInput = (isIos) => {
    let luData = lutypes;
      let typePicker =
        <Picker style={{marginHorizontal:20}}
          selectedValue={this.state.type}
          mode="dialog"
          onValueChange={(itemValue, itemIndex) => {this.setState({type: itemValue, typePickerHide: true}) } }>
          {
              luData.map((item) => {
                  return (<Picker.Item label={item.label} value={item.label} />);
              })
          }
        </Picker>
      ;
      let typeModal =
       this.state.typePickerHide ? <Text/> :
       <ModalWrapper
           containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
           style={{ flex: 1 }}
           visible={!this.state.typePickerHide}>
           {this._closeButton(()=>{this.setState({typePickerHide:true})})}
           {typePicker}
       </ModalWrapper>
      ;

      if(isIos)
      {
        return (
          <View>
            <FormLabel>Type *</FormLabel>
            <TouchableOpacity style={Styles.inputButton} onPress={() => { this.setState({typePickerHide: false});  }}>
              <Text>{this.state.type ? this.state.type : "-- Choose Type --"}</Text>
            </TouchableOpacity>
            { typeModal }
          </View>
        );
      }
      else {
        return (
          <View>
            <FormLabel>Type *</FormLabel>
            { typePicker }
          </View>
        );

      }
  }

  _renderReasonInput = (isIos) => {
    let luData = lureasons;
    let reasonPicker =
      <Picker style={{marginHorizontal:20, zIndex:8}}
        selectedValue={this.state.reason}
        mode="dialog"
        onValueChange={(itemValue, itemIndex) => {this.setState({reason: itemValue, reasonLabel: luData[itemIndex].label , reasonPickerHide: true}) } }>
        {
            luData.map((item) => {
                return (<Picker.Item label={item.label} value={item.value} />);
            })
        }
      </Picker>
    ;
    let reasonModal =
      this.state.reasonPickerHide ? <Text/> :
      <ModalWrapper
          containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
          style={{ flex: 1 }}
          visible={!this.state.reasonPickerHide}>
          {this._closeButton(()=>{this.setState({reasonPickerHide:true})})}
          {reasonPicker}
      </ModalWrapper>
    ;

      if(isIos)
      {
        return (
          <View style={Styles.section}>
            <FormLabel>Reason *</FormLabel>
            <TouchableOpacity style={Styles.inputButton} onPress={() => { this.setState({reasonPickerHide: false});  }}>
              <Text>{this.state.reason ? this.state.reasonLabel : "-- Choose Reason --"}</Text>
            </TouchableOpacity>
            { reasonModal }
          </View>
        );
      }
      else {
        return (
          <View>
            <FormLabel>Reason *</FormLabel>
            { reasonPicker }
          </View>
        );

      }
    }

  _renderWbsInput = (isIos) => {
      let luData = luwbs;
      let picker =
        <Picker style={{marginHorizontal:20}}
          selectedValue={this.state.wbsElement}
          mode="dialog"
          onValueChange={(itemValue, itemIndex) => {this.setState({wbsElement: itemValue, wbsElementLabel: luData[itemIndex].label , wbsPickerHide: true}) } }>
          {
              luData.map((item) => {
                  return (<Picker.Item label={item.label} value={item.label} />);
              })
          }
        </Picker>
      ;
      let modal =
       this.state.wbsPickerHide ? <Text/> :
       <ModalWrapper
           containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
           style={{ flex: 1 }}
           visible={!this.state.wbsPickerHide}>
           {this._closeButton(()=>{this.setState({wbsPickerHide:true})})}
           {picker}
       </ModalWrapper>
      ;

      if(isIos)
      {
        return (
          <View style={Styles.section}>
            <FormLabel>WBS Element</FormLabel>
            <TouchableOpacity style={Styles.inputButton} onPress={() => { this.setState({wbsPickerHide: false});  }}>
              <Text>{this.state.wbsElement ? this.state.wbsElementLabel : "-- Choose WBS Element --"}</Text>
            </TouchableOpacity>
            { modal }
          </View>
        );
      }
      else {
        return (
          <View>
            <FormLabel>WBS Element</FormLabel>
            { picker }
          </View>
        );

      }
  }


  _renderForm = () => {
    const isIos = Platform.OS === 'ios';
    const userContent = this.state.user ?
    <Text>{this.state.user.Id}</Text>
    : <Text/>;

    return (
      <View>
        {userContent}
        <FormLabel>Receipt Date *</FormLabel>
        <DatePicker
          style={Styles.inputDate}
          date={this.state.receiptDate}
          mode="date"
          placeholder="select date"
          format="DD MMM YYYY"
          confirmBtnText="Select"
          cancelBtnText="Close"
          customStyles={{
            dateInput: {
              borderWidth: 0,
              borderBottomColor: '#ccc',
              borderBottomWidth: 1,
              alignItems: 'baseline',
              fontSize: 16,
            }
          }}
          onDateChange={(date) => {this.setState({receiptDate: date})}}
        />

        <FormLabel>Receipt Amount (inclusive of GST) *</FormLabel>
        <FormInput
          keyboardType="decimal-pad"
          returnKeyType="done"
          onSubmitEditing={this._next}
          placeholder="Enter Receipt Amount ..."
          value={this.state.receiptAmount}
          onChangeText={text => {
            this.setState({ receiptAmount: text });
            this._calcAmountPerHead({receiptAmount: text});
          }}
        />

        <FormLabel>Receipt No</FormLabel>
        <FormInput
          placeholder="Enter Receipt Number ..."
          value={this.state.receiptNo}
          onChangeText={text => this.setState({ receiptNo: text})}
        />

        {this._renderTypeInput(isIos)}
        {this._renderReasonInput(isIos)}
        {this._renderWbsInput(isIos)}

        <FormLabel>Host Officer Name *</FormLabel>
        <FormInput
          placeholder="Enter Host Officer Name ..."
          value={this.state.hostOfficerName}
          onChangeText={text => this.setState({ hostOfficerName: text})}
        />

        <FormLabel>Delegating Officer Name</FormLabel>
        <FormInput
          placeholder="Enter Delegation Officer Name ..."
          value={this.state.delegatingOfficerName}
          onChangeText={text => this.setState({ delegatingOfficerName: text})}
        />

        <FormLabel>No. of Guest</FormLabel>
        <FormInput
          style={Styles.input}
          value={this.state.noOfGuest}
          onChangeText={text => {
            if(text > 10)
            {
              alert('Max No. of Guest is 10.');
              text = 10;
            }
            this.setState({ noOfGuest: text, guestNames: text ? new Array(parseInt(text)) : null});
            this._calcAmountPerHead({noOfGuest: text});
          }}
          ref={ref => {this._inputWbsElement = ref}}
          placeholder="Enter No of Guest"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={this._next}
          blurOnSubmit={false}
        />

        {this._renderGuestInputs()}

        <FormLabel>No. of Staff (excluding hosting officer)</FormLabel>
        <FormInput
          style={Styles.input}
          value={this.state.noOfStaff}
          onChangeText={text => {
            this.setState({ noOfStaff: text });
            this._calcAmountPerHead({noOfStaff: text});
          }}
          ref={ref => {this._inputNoOfStaff = ref}}
          placeholder="Enter No of Staff"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={this._next}
          blurOnSubmit={false}
        />

      </View>

    );

  };

}

const lutypes = [
    {
      label: 'Breakfast'
    },
    {
      label: 'Lunch'
    },
    {
      label: 'Dinner'
    },
    {
      label: 'Refreshment'
    },
    {
      label: 'Tea'
    }
  ];

const lureasons = [
    {
      label: 'None', value: ''
    },
    {
      label: 'Collaborators / Industry Partner', value: 'CI'
    },
    {
      label: 'Conference Speaker', value: 'CS'
    },
    {
      label: 'Meeting / Discussion', value: 'MD'
    },
  ];

const luwbs = [
    {
      label: 'None', value: ''
    },
    {
      label: 'WBS-AAA-001 / WBS ZERO ONE', value: 'WBS-AAA-001'
    },
    {
      label: 'WBS-BBB-002 / WBS ZERO TWO', value: 'WBS-BBB-002'
    },
    {
      label: 'WBS-CCC-003 / WBS ZERO THREE', value: 'WBS-CCC-003'
    },
  ];
