import React, { Component } from 'react';
import {
  ScrollView,
  Text,
  StatusBar, TextInput, View, StyleSheet,
  DatePickerIOS, Platform,
  Picker, Label,
  Keyboard, TouchableOpacity, Alert,
} from 'react-native';
import { Constants } from 'expo';
import { email } from 'react-native-communications';
import { isSignedIn } from "../app/auth";

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
        <StatusBar barStyle="light-content" />
        {this._renderForm()}
        <TouchableOpacity
             style = {styles.submitButton}
             onPress = {this._submit}
        >
             <Text style = {styles.submitButtonText}> Submit </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  setStateData(propname, value)
  {
    var data = {...this.state.data};
    data[propname] = value;
    this.setState({data});
  }

  setDate(newDate) {
    this.setState({selectedDate: newDate})
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

  _go = () => {
    Keyboard.dismiss();
  };

  _submit = async () => {
    let data = JSON.stringify(this.state, null, 4);
    Alert.alert(
      'Confirm to submit this receipt?',
      data,
      [
        {text: 'Close', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Send Email', onPress: () => this._sendResult()},
      ],
      { cancelable: false }
    )
    //let result = await this.sendResult();
    //alert(JSON.stringify(result));
  };

  _emailDialog = async (data) =>{
    email(['yansen.chandra@sg.fujitsu.com'], null, null, 'Receipt Scan Result', data);
  }

  _sendResult = async () => {
    try {
      const url = 'https://fj-demo-app.azurewebsites.net/api/user/postclaim'

      var blob = null;
      if(this.state.receiptUri)
      {
        const response = await fetch(this.state.receiptUri);
        blob = await response.blob();
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
        ReceiptImage: blob
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
         return response.json();
       }) //\get response xml
       .then(res => alert(res.Message))
       .catch(err => {
         console.log(err);
         alert(err);
         this.setState({ uploading: false });
        });

{/*      let response = await fetch(
        'https://facebook.github.io/react-native/movies.json'
      );
      let responseJson = await response.json();
      return responseJson.movies;
*/}
    } catch (error) {
      console.error(error);
    }
  }

  _createGuestInputs = () => {
    let inputs = [];
    if(this.state.noOfGuest && this.state.noOfGuest > 0)
      this.setState((state) => {guestNames: new Array(parseInt(state.noOfGuest))});
    for (let i = 0; i < this.state.noOfGuest; i++) {
      //this.state.guestNames.push('');
      var name = `_inputGuestName${i}`;
      inputs.push(
        <Text key={`text${name}`} style={styles.inputLabel}>
          Guest Name {(i+1).toString()}
        </Text>
      );
      inputs.push(
        <TextInput
          key={name}
          style={styles.input}
          value={this.state.guestNames[i]}
          onChangeText={text => {
            //this.setState({guestNames[i]: text})
            const items = this.state.guestNames;
            items[i] = text;
            // re-render
            this.forceUpdate();
          }}
          ref={ref => {this[name] = ref}}
          placeholder={`Enter Guest ${i+1} Name / Designation / Company`}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
          blurOnSubmit={false}
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

      let reasonPicker =
       this.state.reasonPickerHide ? <Text/> :
        <Picker
          selectedValue={this.state.reason}
          mode="dialog"
          onValueChange={(itemValue, itemIndex) => {this.setState({reason: itemValue, reasonPickerHide: true}) } }>
          <Picker.Item label="Collaborators / Industry Partner" value="CollaboratorIndustryPartner" />
          <Picker.Item label="Host Conference Speaker" value="HostConverenceSpeaker" />
          <Picker.Item label="Meeting / Discussion" value="MeetingDiscussion" />
        </Picker>
      ;

      let typePicker =
       this.state.typePickerHide ? <Text/> :
       <Picker
         selectedValue={this.state.type}
         //style={{ height: 50, width: 100 }}
         mode="dialog"
         onValueChange={(itemValue, itemIndex) => {this.setState({type: itemValue, typePickerHide: true}) } }>
         <Picker.Item label="BREAKFAST" value="BREAKFAST" />
         <Picker.Item label="DINNER" value="DINNER" />
         <Picker.Item label="LUNCH" value="LUNCH" />
         <Picker.Item label="REFRESHMENT" value="REFRESHMENT" />
         <Picker.Item label="TEA" value="TEA" />
       </Picker>
      ;

    return (
    <View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>
          Receipt Date *
        </Text>
  {/*      <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({receiptDateHide: false});  }}>
          <Text>{this.state.receiptDate ? this.state.receiptDate.toString() : "-- Pick Date --"}</Text>
        </TouchableOpacity>
  */}
        {dateinputcontent}
      </View>

      <Text style={styles.inputLabel}>
        Receipt Amount *
      </Text>
      <TextInput
        style={styles.input}
        value={this.state.receiptAmount}
        onChangeText={text => {
          this.setState({ receiptAmount: text });
          this._calcAmountPerHead({receiptAmount: text});
        }}
        ref={ref => {this._inputReceiptAmount = ref}}
        placeholder="Enter Receipt Amount"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={this._submit}
        blurOnSubmit={true}
      />

      <Text style={styles.inputLabel}>
        Receipt No
      </Text>
      <TextInput
        style={styles.input}
        value={this.state.receiptNo}
        onChangeText={text => this.setState({ receiptNo: text})}
        ref={ref => {this._inputReceiptNo = ref}}
        placeholder="Enter Receipt No"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="default"
        returnKeyType="done"
        onSubmitEditing={this._next}
        blurOnSubmit={false}
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
        <Text style={styles.inputLabel}>
          Type *
        </Text>
        <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({typePickerHide: false});  }}>
          <Text>{this.state.type ? this.state.type : "-- Choose Type --"}</Text>
        </TouchableOpacity>
        {typePicker}
      </View>

      <View style={styles.section}>
        <Text style={styles.inputLabel}>
          Reason *
        </Text>
        <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({reasonPickerHide: false});  }}>
          <Text>{this.state.reason ? this.state.reason : "-- Choose Reason --"}</Text>
        </TouchableOpacity>
        {reasonPicker}
      </View>

      <Text style={styles.inputLabel}>
        No of Guest
      </Text>
      <TextInput
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
        keyboardType="number-pad"
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
    margin: 20,
    marginTop: 0,
    height: 34,
    padding: 7,
    borderRadius: 4,
    borderColor: '#ccc',
    borderWidth: 1,
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
