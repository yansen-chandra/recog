import React, { Component } from 'react';
import { ScrollView, Text, StatusBar, TextInput, View, StyleSheet, DatePickerIOS, Picker, Label, Keyboard,TouchableOpacity } from 'react-native';
import { Constants } from 'expo';

export default class FormScreen extends Component {
  static navigationOptions = {
    title: 'Add Receipt',
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
    noOfGuest: "5",
    guestNames: [],
    noOfStaff: "0",
    //typePickerHide: true,
    //reasonPickerHide: true,
    //receiptDateHide: true,
  };

  componentDidMount(){
   this.load()
   this.props.navigation.addListener('willFocus', this.load)
  }

  load = () => {
    const receipt = this.props.navigation.getParam("receipt", null);
    console.log(receipt);
    if(receipt)
    {
      this.setState({ receiptAmount: receipt.total, receiptDate: receipt.date });
    }
  }

  render() {
    return (
      <ScrollView style={styles.container}>
        {this.renderTopBar()}
        <StatusBar barStyle="light-content" />
        {/*<View style={styles.header}>
          <Text style={styles.description}>
            Receipt Input Form
          </Text>
        </View>*/}
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
          returnKeyType="go"
          onSubmitEditing={this._next}
          blurOnSubmit={false}
        />
        <TextInput
          style={styles.input}
          value={this.state.wbsElement}
          onChangeText={text => this.setState({ wbsElement: text})}
          ref={ref => {this._inputWbsElement = ref}}
          placeholder="Enter Project WBS Element"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={this._next}
          blurOnSubmit={false}
        />
        <TextInput
          style={styles.input}
          value={this.state.noOfGuest}
          onChangeText={text => {
            this.setState({ noOfGuest: text, amountPerHead: this.calcAmountPerHead(), guestNames: []});
          }}
          ref={ref => {this._inputWbsElement = ref}}
          placeholder="Enter No of Guest"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="number-pad"
          returnKeyType="next"
          onSubmitEditing={this._next}
          blurOnSubmit={false}
        />
        {this.createGuestInputs()}
        <TextInput
          style={styles.input}
          value={this.state.noOfStaff}
          onChangeText={text => {
            this.setState({ noOfStaff: text, amountPerHead: this.calcAmountPerHead() });
          }}
          ref={ref => {this._inputWbsElement = ref}}
          placeholder="Enter No of Staff"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="number-pad"
          returnKeyType="next"
          onSubmitEditing={this._next}
          blurOnSubmit={false}
        />
        <TextInput
          style={styles.input}
          value={this.state.receiptNo}
          onChangeText={text => this.setState({ receiptNo: text})}
          ref={ref => {this._inputReceiptNo = ref}}
          placeholder="Enter Receipt No"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="next"
          onSubmitEditing={this._next}
          blurOnSubmit={false}
        />
        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Receipt Date *
          </Text>
{/*          <TextInput
            style={styles.input}
            value={this.state.receiptDate}
            onChangeText={text => this.setState({ receiptDate: text})}
            ref={ref => {this._inputReceiptDate = ref}}
            placeholder="dd/MMM/yyyy"
            onFocus={() => this.setState({receiptDateHide: false}) }
          />*/}
          <DatePickerIOS mode="date"
               date={this.state.receiptDate}
               onDateChange={value => this.setState({ receiptDate: value})}
           />
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Type *
          </Text>
          <TextInput
            style={styles.input}
            value={this.state.type}
            onChangeText={type => this.setState({ type: type})}
            ref={ref => {this._inputType = ref}}
            placeholder="Select Type"
            onFocus={() => this.setState({typePickerHide: false}) }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.inputLabel}>
            Reason *
          </Text>
          <TextInput
            style={styles.input}
            value={this.state.reason}
            onChangeText={reason => this.setState({ reason: reason})}
            ref={ref => {this._inputReason = ref}}
            placeholder="Select Reason"
            onFocus={() => this.setState({reasonPickerHide: false}) }
          />
        </View>

        <Text style={styles.inputLabel}>
          Receipt Amount *
        </Text>
        <TextInput
          style={styles.input}
          value={this.state.receiptAmount}
          onChangeText={text => this.setState({ receiptAmount: text, amount: text, amountPerHead: this.calcAmountPerHead() })}
          ref={ref => {this._inputReceiptAmount = ref}}
          placeholder="Enter Receipt Amount"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="number-pad"
          returnKeyType="done"
          onSubmitEditing={this._submit}
          blurOnSubmit={true}
        />

        <Text style={styles.inputLabel}>
          Amount
        </Text>
        <TextInput
          editable={false}
          style={styles.inputDisabled}
          value={this.state.amount}
          placeholder="Receipt Amount"
        />

        <Text style={styles.inputLabel}>
          Amount Per Head
        </Text>
        <TextInput
          editable={false}
          style={styles.inputDisabled}
          value={this.state.amountPerHead}
          placeholder="Amount Per Head"
        />

        {/*
                  <Picker
                    selectedValue={this.state.reason}
                    style={{ height: 50, width: 100 }} mode="dialog"
                    onValueChange={(itemValue, itemIndex) => this.setState({reason: itemValue})}>
                    <Picker.Item label="Collaborators / Industry Partner" value="CollaboratorIndustryPartner" />
                    <Picker.Item label="Host Conference Speaker" value="HostConverenceSpeaker" />
                    <Picker.Item label="Meeting / Discussion" value="MeetingDiscussion" />
                  </Picker>
        */}


        {/*
        <Picker hide={this.state.typePickerHide}
          selectedValue={this.state.type}
          style={{ height: 50, width: 100 }} mode="dialog"
          onValueChange={(itemValue, itemIndex) => this.setState({type: itemValue})}>
          <Picker.Item label="BREAKFAST" value="BREAKFAST" />
          <Picker.Item label="DINNER" value="DINNER" />
          <Picker.Item label="LUNCH" value="LUNCH" />
          <Picker.Item label="REFRESHMENT" value="REFRESHMENT" />
          <Picker.Item label="TEA" value="TEA" />
        </Picker>
        */}





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

  calcAmountPerHead()
  {
    var result = (parseFloat(this.state.amount) / (parseFloat(this.state.noOfGuest) + parseFloat(this.state.noOfStaff))).toString();
    alert(`${parseFloat(this.state.noOfGuest) + parseFloat(this.state.noOfStaff)} - ${result}`);
    return result;
  }

  _next = () => {
    //this._emailInput && this._emailInput.focus();
    Keyboard.dismiss();
  };

  _go = () => {
    Keyboard.dismiss();
  };

  _submit = async () => {
    alert(`Parsed form : ${JSON.stringify(this.state)}!`);
    let result = await this.sendResult();
    alert(JSON.stringify(result));
  };

  async sendResult() {
    try {
      let response = await fetch(
        'https://facebook.github.io/react-native/movies.json'
      );
      let responseJson = await response.json();
      return responseJson.movies;
    } catch (error) {
      console.error(error);
    }
  }

  renderTopBar = () =>
    <View
      style={styles.topBar}>
      <TouchableOpacity style={styles.toggleButton} onPress={this.scanFromGallery}>
        <Text>Select Image</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toggleButton} onPress={this.scanFromCamera}>
        <Text>Take Picture</Text>
      </TouchableOpacity>
    </View>

  scanFromGallery = () => {alert("Open Gallery");};
  scanFromCamera = () => {this.props.navigation.navigate('Camera', { setScannedReceipt: this.setScannedReceipt });};

  setScannedReceipt = (receipt) => {
    this.setState({ receiptAmount: receipt.total, receiptDate: receipt.date });
  }

  createGuestInputs = () => {
    let inputs = [];
    for (let i = 0; i < this.state.noOfGuest; i++) {
      this.state.guestNames.push('');
      var name = `_inputGuestName${i}`;
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
          placeholder={`Enter Guest ${i} Name / Designation / Company`}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
          returnKeyType="done"
          onSubmitEditing={this._next}
          blurOnSubmit={false}
        />
      );
    }
    return inputs;
  }

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
  },
  section: {
  },
  submitButton: {
     backgroundColor: '#7a42f4',
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
