import React, { Component } from 'react';
import {
  ScrollView,
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
import Spinner from 'react-native-loading-spinner-overlay';

export default class FormScreen extends Component {
  static navigationOptions = {
    title: 'Edit Receipt Details',
  };
  state = {
    //data: {
    //},
    costCenter: '',
    wbsElement: '',
    receiptNo: '',
    receiptDate: new Date(),
    receiptAmount: "0",
    amount: "0",
    amountPerHead: "0",
    type: '',
    reason: '',
    hostOfficeName: '',
    delegatingOfficeName: '',
    noOfGuest: "2",
    guestNames: [],
    noOfStaff: "0",
    receiptUri: '',
    receiptBase64: null,
    typePickerHide: true,
    reasonPickerHide: true,
    receiptDateHide: true,

  };

  componentDidMount(){
   console.log('form did mount');
   //this.load();
   this.props.navigation.addListener('willFocus', this._load);
  }

  _load = () => {
    console.log('form load');
    isSignedIn()
    .then(res => {
      if(!res)
      {
        this.setState({processing: true, processMessage: 'Loading...'});
        alert("Please Sign In");
        this.props.navigation.navigate('SignIn');
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
      <ScrollView style={styles.container}>
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
          textStyle={styles.spinnerTextStyle}
        />
      </ScrollView>
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
    Alert.alert(
      'Confirm to submit this receipt?',
      '',
      [
        {text: 'Close', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Send Email', onPress: () => this._sendResult()},
      ],
      { cancelable: false }
    )
  };

  _emailDialog = async (data) =>{
    email(['yansen.chandra@sg.fujitsu.com'], null, null, 'Receipt Scan Result', data);
  }

  _sendResult = async () => {
    try {
      this.setState({processing: true});
      const url = 'https://fj-demo-app.azurewebsites.net/api/user/postclaim'
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
      const data = {
        Claim: {
          RequestBy: 'cy',
          ReceiptDate: this.state.receiptDate,
          ReceiptAmount: this.state.receiptAmount,
          Type: this.state.type,
          Reason: this.state.reason,
          NoOfGuest: this.state.noOfGuest,
          GuestNames: this.state.guestNames,
        },
        ClaimImage: receiptImage,
        ClaimImageBase64: this.state.receiptBase64,
      };
      console.log("email post data", data);
      const config = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      fetch(url, config)
       .then(response => {
         console.log("send mail response",response);
         this.setState({ processing: false });
         return response.json();
       }) //\get response xml
       .then(res => {
         //alert(res.Message);
         setTimeout(() => {
           Alert.alert('Submit', res.Message);
         }, 100);
         //clear form 
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

  _createGuestInputs = () => {
    let inputs = [];
    if(this.state.noOfGuest && this.state.noOfGuest > 0) {
      this.setState((state) => {guestNames: new Array(parseInt(state.noOfGuest))});
    }
    for (let i = 0; i < this.state.noOfGuest; i++) {
      var name = `_inputGuestName${i}`;
      inputs.push(
        <FormLabel key={`text${name}`}>
          Guest Name {(i+1).toString()}
        </FormLabel>
      );
      inputs.push(
        <FormInput
          key={name}
          style={styles.input}
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

  _renderForm = () => {
      let dateinputcontent = Platform.OS === 'ios'?
        <DatePickerIOS mode="date"
             date={this.state.receiptDate}
             onDateChange={value => this.setState({ receiptDate: value, receiptDateHide: true})}
         />
      :
          <TextInput
            style={styles.input}
            value={this.state.receiptDate}
            onChangeText={text => this.setState({ receiptDate: text, receiptDateHide: true})}
            ref={ref => {this._inputReceiptDate = ref}}
            placeholder="dd/MMM/yyyy"
            //onFocus={() => this.setState({receiptDateHide: false}) }
          />
      ;

      let dateinput = this.state.receiptDateHide ? <Text/> : dateinputcontent;

      let reasonModal =
        this.state.reasonPickerHide ? <Text/> :
        <ModalWrapper
            containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
            style={{ flex: 1 }}
            visible={!this.state.reasonPickerHide}>
            <Picker
              selectedValue={this.state.reason}
              mode="dialog"
              onValueChange={(itemValue, itemIndex) => {this.setState({reason: itemValue, reasonPickerHide: true}) } }>
              <Picker.Item label="Collaborators / Industry Partner" value="CollaboratorIndustryPartner" />
              <Picker.Item label="Host Conference Speaker" value="HostConverenceSpeaker" />
              <Picker.Item label="Meeting / Discussion" value="MeetingDiscussion" />
            </Picker>
        </ModalWrapper>
      ;

      let typeModal =
       this.state.typePickerHide ? <Text/> :
       <ModalWrapper
           containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
           style={{ flex: 1 }}
           visible={!this.state.typePickerHide}>
           <Picker
             selectedValue={this.state.type}
             mode="dialog"
             onValueChange={(itemValue, itemIndex) => {this.setState({type: itemValue, typePickerHide: true}) } }>
             <Picker.Item label="BREAKFAST" value="BREAKFAST" />
             <Picker.Item label="DINNER" value="DINNER" />
             <Picker.Item label="LUNCH" value="LUNCH" />
             <Picker.Item label="REFRESHMENT" value="REFRESHMENT" />
             <Picker.Item label="TEA" value="TEA" />
           </Picker>
       </ModalWrapper>
      ;

    return (
    <View>
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
            textAlign: 'left',
            alignItems: 'left',
            fontSize: 16,
          }
        }}
        onDateChange={(date) => {this.setState({receiptDate: date})}}
      />

      <FormLabel>Receipt Amount *</FormLabel>
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

{/*
        <Text style={styles.inputLabel}>
        Cont Center *
      </Text>
      <TextInput
        style={styles.input}
        value={this.state.costCenter}
        onChangeText={text => this.setState({ costCenter: text})}
        ref={ref => {this._InputCostCenter = ref}}
        placeholder="Enter Cost Center"
        autoFocus={false}
        autoCapitalize="words"
        autoCorrect={false}
        keyboardType="default"
        returnKeyType="done"
        onSubmitEditing={this._next}
        blurOnSubmit={false}
      />
      <Text style={styles.inputLabel}>
        WBS Element *
      </Text>
      <TextInput
        style={styles.input}
        value={this.state.wbsElement}
        onChangeText={text => this.setState({ wbsElement: text})}
        ref={ref => {this._inputWbsElement = ref}}
        placeholder="Enter Project WBS Element"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        returnKeyType="done"
        onSubmitEditing={this._next}
        blurOnSubmit={false}
      />

      <Text style={styles.inputLabel}>
        No of Staff
      </Text>
      <TextInput
        style={styles.input}
        value={this.state.noOfStaff}
        onChangeText={text => {
          this.setState({ noOfStaff: text });
          this._calcAmountPerHead({noOfStaff: text});
        }}
        ref={ref => {this._inputWbsElement = ref}}
        placeholder="Enter No of Staff"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="number-pad"
        returnKeyType="done"
        onSubmitEditing={this._next}
        blurOnSubmit={false}
      />

*/}

      <View style={styles.section}>
        <FormLabel>Type *</FormLabel>
        <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({typePickerHide: false});  }}>
          <Text>{this.state.type ? this.state.type : "-- Choose Type --"}</Text>
        </TouchableOpacity>
        {typeModal}
      </View>

      <View style={styles.section}>
        <FormLabel>Reason *</FormLabel>
        <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({reasonPickerHide: false});  }}>
          <Text>{this.state.reason ? this.state.reason : "-- Choose Reason --"}</Text>
        </TouchableOpacity>
        {reasonModal}
      </View>


      <FormLabel>No of Guest</FormLabel>
      <FormInput
        style={styles.input}
        value={this.state.noOfGuest}
        onChangeText={text => {
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

      {this._createGuestInputs()}

{/*      <Text style={styles.inputLabel}>
        Amount
      </Text>
      <TextInput
        editable={false}
        style={styles.inputDisabled}
        value={this.state.receiptAmount}
        placeholder="Receipt Amount"
      />

      <Text style={styles.inputLabel}>
        Amount Per Head
      </Text>
      <TextInput
        editable={false}
        style={styles.inputDisabled}
        value={(parseFloat(this.state.amount) / (parseFloat(this.state.noOfGuest) + parseFloat(this.state.noOfStaff))).toString()}
        placeholder="Amount Per Head"
      />
*/}
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
      label: 'Collaborators / Industry Partner'
    },
    {
      label: 'Host Conference Speaker'
    },
    {
      label: 'Meeting / Discussion'
    },
  ];
