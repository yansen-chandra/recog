import React, { Component } from 'react';
import _ from 'lodash';
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
import { isSignedIn } from "../app/auth";
import { getAuthString } from "../app/commonservices";
import FJServices from "../app/fjservices";
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import ClaimTypeSelect from "./ClaimTypeSelect";
import { ClaimTypes } from '../app/constants';

export default class ExpenseFormScreen extends Component {
  static navigationOptions = {
    title: 'Expense Receipt Details',
  };
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      receiptUri: '',
      receiptBase64: null,
      receiptDate: new Date(),
      receiptAmount: "0",
      receiptNo: '',
      costCenter: '',
      wbsElement: '',
      wbsElementLabel: '',
      amount: "0",
      reason: '',
      reasonLabel: '',
      reasonPickerHide: true,
      currencyPickerHide: true,
      wbsPickerHide: true,
      receiptDateHide: true,
      currency: 'SGD',
      currencyLabel: 'Singapore Dollar (SGD)',
      currencyRate: "1",
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
        //console.log("Form Screen User:", user);
        this.setState({user: user, hostOfficerName: user.id});
      }
    })
    .catch(err => alert(err));

    const receipt = this.props.navigation.getParam("receipt", null);
    console.log('form receipt', receipt);
    if(receipt)
    {
      this.setState({
        receipt: receipt,
        receiptAmount: receipt.total,
        receiptDate: receipt.date ? receipt.date : new Date(),
        receiptUri: receipt.uri,
        receiptBase64: receipt.base64
      });
    }
  }

  render() {
    return (
      <KeyboardAwareScrollView
        extraScrollHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps='handled'
      >
         <View style={styles.container}>
          <Card>
            <StatusBar barStyle="light-content" />
            <ClaimTypeSelect selected={ClaimTypes.Expense}
              receipt={this.state.receipt}
              navigation={this.props.navigation}></ClaimTypeSelect>
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
            textStyle={{color: '#EEE'}}
          />
          </View>
          </KeyboardAwareScrollView>
    );
  }

  _next = () => {
    //this._emailInput && this._emailInput.focus();
    Keyboard.dismiss();
  };

  _submit = async () => {
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

  _clearForm = () => {
    this.setState(
      {
        costCenter: '',
        wbsElement: '',
        receiptNo: '',
        receiptDate: new Date(),
        receiptAmount: "0",
        reason: '',
        amount: "0",
        receiptUri: '',
        receiptBase64: null,
        reasonPickerHide: true,
        currencyPickerHide: true,
        receiptDateHide: true,
        currency: 'SGD',
        currencyRate: "1",
      }
    );
  };

  _validate = () => {
    let {
      receiptAmount,
      reason,
      currency,
    } = this.state;
    if(receiptAmount <= 0)
    {
      alert('Receipt Amount cannot be 0.');
      return false;
    }
    if(!reason)
    {
      alert('Claim Reason is required.');
      return false;
    }
    if(!currency)
    {
      alert('Currency is required.');
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
      }
      const user = this.state.user;
      const data = {
        Claim: {
          ClaimType: ClaimTypes.Expense,
          RequestBy: user.id,
          RequestPhoneNo: user.mobile,
          ReceiptDate: this.state.receiptDate,
          ReceiptAmount: this.state.receiptAmount,
          ReceiptNo: this.state.receiptNo,
          Reason: this.state.reason,
          ProjectNo: this.state.wbsElement,
          Currency: this.state.currency,
          CurrencyRate: this.state.currencyRate,
        },
        ClaimImage: receiptImage,
        ClaimImageBase64: this.state.receiptBase64,
      };
      console.log('claim submit data', data);
      FJServices.postClaim(data)
      .then((result) => {
        console.log('after submit', result);
        this.setState({ processing: false });
        setTimeout(() => {
          console.log(result);
          Alert.alert('Submit Success', `Claim ${result.Message.substring(0,8)} submitted successfully. (Approval amount subjected to claim limit)`);
        }, 100);
        this._clearForm();
      })
      .catch((err) => {
        console.log(err);
        this.setState({ processing: false });
        setTimeout(() => {
          Alert.alert('Submit Failed', err);
        }, 100);
      });

    } catch (error) {
      console.error(error);
      this.setState({processing: false});
      setTimeout(() => {
        Alert.alert('Submit Failed', error);
      }, 100);
    }
  }

  _closeButton = (onpress) => {
   return <Button
     buttonStyle={{ marginTop: 10, marginBottom: -10, alignSelf: 'flex-end', zIndex:9  }}
     title="Done"
     onPress={onpress}
   />
   ;
 }

 _renderCurrencyInput = (isIos) => {
   let luData = lucurrencies;
   let reasonPicker =
     <Picker style={{marginHorizontal:20, zIndex:8}}
       selectedValue={this.state.currency}
       mode="dialog"
       onValueChange={(itemValue, itemIndex) => {
         this.setState({
           currency: itemValue, currencyLabel: luData[itemIndex].label , currencyPickerHide: true, currencyRate: luData[itemIndex].ExtraProperties[0].value
         });
        } }>
       {
           luData.map((item) => {
               return (<Picker.Item  key={item.value} label={item.label} value={item.value} />);
           })
       }
     </Picker>
   ;
   let reasonModal =
     this.state.currencyPickerHide ? <Text/> :
     <ModalWrapper
         containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
         style={{ flex: 1 }}
         visible={!this.state.currencyPickerHide}>
         {this._closeButton(()=>{this.setState({currencyPickerHide:true})})}
         {reasonPicker}
     </ModalWrapper>
   ;

     if(isIos)
     {
       return (
         <View style={styles.section}>
           <FormLabel>Reason *</FormLabel>
           <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({currencyPickerHide: false});  }}>
             <Text>{this.state.currency ? this.state.currencyLabel : "-- Choose Currency --"}</Text>
           </TouchableOpacity>
           { reasonModal }
         </View>
       );
     }
     else {
       return (
         <View>
           <FormLabel>Currency *</FormLabel>
           { reasonPicker }
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
                return (<Picker.Item  key={item.value} label={item.label} value={item.value} />);
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
          <View style={styles.section}>
            <FormLabel>Reason *</FormLabel>
            <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({reasonPickerHide: false});  }}>
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
      let luData = [];
      const user = this.state.user;
      if(user && user.options)
      {
        let option = _.filter(user.options, { Name: 'WBSElement' });
        //console.log("render wbs", option[0]);
        if(option.length > 0)
        {
          luData = [{Label: 'None', Value: ''}, ...option[0].Items]
          //luData = option[0].Items;
        }
      }
      let picker =
        <Picker style={{marginHorizontal:20}}
          selectedValue={this.state.wbsElement}
          mode="dialog"
          onValueChange={(itemValue, itemIndex) => {this.setState({wbsElement: itemValue, wbsElementLabel: luData[itemIndex].Label , wbsPickerHide: true}) } }>
          {
              luData.map((item) => {
                  return (<Picker.Item key={item.Value} label={item.Label} value={item.Value} />);
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
          <View style={styles.section}>
            <FormLabel>WBS Element</FormLabel>
            <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({wbsPickerHide: false});  }}>
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
          style={styles.inputDate}
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
            }
          }}
          onDateChange={(date) => {this.setState({receiptDate: date})}}
        />

        <FormLabel>Receipt Amount (inclusive of GST) *</FormLabel>
        <FormInput
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={this._next}
          placeholder="Enter Receipt Amount ..."
          value={this.state.receiptAmount}
          onChangeText={text => {
            this.setState({ receiptAmount: text });
          }}
        />

        <FormLabel>Receipt No</FormLabel>
        <FormInput
          placeholder="Enter Receipt Number ..."
          value={this.state.receiptNo}
          onChangeText={text => this.setState({ receiptNo: text})}
        />

        {this._renderWbsInput(isIos)}
        {this._renderReasonInput(isIos)}

        {this._renderCurrencyInput(isIos)}
        <FormLabel>Currency Rate</FormLabel>
        <FormInput
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={this._next}
          placeholder="Enter Currency Rate ..."
          value={this.state.currencyRate}
          onChangeText={text => {
            this.setState({ currencyRate: text });
          }}
        />


      </View>

    );

  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  header: {
    //paddingTop: 20 + Constants.statusBarHeight,
    padding: 20,
    backgroundColor: '#336699',
  },
  description: {
    fontSize: 14,
    color: 'white',
  },

  inputButton: {
    marginHorizontal:20,
    marginTop: 10,
    height: 34,
    padding: 7,
    //borderRadius: 4,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    opacity:0.7,
  },
  input: {
    margin: 20,
    marginTop: 0,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
  },
  inputDate: {
    margin: 20,
    marginTop: 0,
    width:200,
    height: 34,
  },
  inputDisabled: {
    margin: 20,
    marginTop: 0,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    backgroundColor: '#eeeeee',
  },
  inputLabel: {
    marginLeft:20,
    marginBottom:5,
  },
  section: {
  },
  submitButton: {
     backgroundColor: 'rgba(5,165,209,.8)',
     padding: 10,
     margin: 15,
     height: 40,
  },
  submitButtonText:{
     color: 'white'
  },
  topBar: {
    flex: 0.2,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Constants.statusBarHeight / 2,
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
  spinnerTextStyle: {
    color: '#eeeeee'
  },
});

const lucurrencies = [
    {
      label: 'Singapore Dollar (SGD)', value: 'SGD', ExtraProperties: [{ key: 'Rate', value: "1" }]
    },
    {
      label: 'US Dollar (USD)', value: 'USD', ExtraProperties: [{ key: 'Rate', value: "1.4" }]
    },
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
