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
  Picker,
} from 'react-native';
import ModalWrapper from 'react-native-modal-wrapper';
import { Card, FormLabel, FormInput, CheckBox  } from "react-native-elements";
import FJServices from "../app/fjservices";

export default class ClaimTypeSelect extends React.Component {

  constructor(props) {
     super(props);
     this.state = {selected: props.selected, claimTypePickerHide: true, receipt: props.receipt};
   }

   componentWillReceiveProps(props) {
    this.setState({selected: props.selected, claimTypePickerHide: true, receipt: props.receipt});
   }

   _closeButton = (onpress) => {
    return <Button
      buttonStyle={{ marginTop: 10, marginBottom: -10, alignSelf: 'flex-end', zIndex:9  }}
      title="Done"
      onPress={onpress}
    />
    ;
  }
   _renderClaimTypeInput = (isIos) => {
     let luData =
     [
        {
          label: 'Entertainment Claim', value: 5
        },
        {
          label: 'Expense Claim', value: 3
        },
      ];
       let typePicker =
         <Picker style={{marginHorizontal:20}}
           selectedValue={this.state.selected}
           mode="dialog"
           onValueChange={(itemValue, itemIndex) => {
             this.setState({selected: itemValue, selectedLabel: luData[itemIndex].label, claimTypePickerHide: true});
             let formKey = "Form";
             switch(itemValue)
             {
               case 3:
                formKey = "ExpenseForm";
                this.props.navigation.navigate(formKey, {receipt: this.state.receipt});
                break;
              default:
                this.props.navigation.navigate(formKey, {receipt: this.state.receipt});
                break;
             }
           } }>
           {
               luData.map((item) => {
                   return (<Picker.Item  key={item.label} label={item.label} value={item.value} />);
               })
           }
         </Picker>
       ;
       let typeModal =
        this.state.claimTypePickerHide ? <Text/> :
        <ModalWrapper
            containerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
            style={{ flex: 1 }}
            visible={!this.state.claimTypePickerHide}>
            {this._closeButton(()=>{this.setState({claimTypePickerHide:true})})}
            {typePicker}
        </ModalWrapper>
       ;

       if(isIos)
       {
         var selectedLabel;
         luData.map((item) => {
           if(item.value == this.state.selected)
               selectedLabel = item.label;
         });
         return (
           <View>
             <FormLabel>Type *</FormLabel>
             <TouchableOpacity style={styles.inputButton} onPress={() => { this.setState({claimTypePickerHide: false});  }}>
               <Text>{this.state.selected ? selectedLabel : "-- Choose Type --"}</Text>
             </TouchableOpacity>
             { typeModal }
           </View>
         );
       }
       else {
         return (
           <View>
             <FormLabel>Claim Type *</FormLabel>
             { typePicker }
           </View>
         );

       }
   }

  render() {
    const isIos = Platform.OS === 'ios';
    return (
        this._renderClaimTypeInput(isIos)
    );
  }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 20,
      backgroundColor: 'white',
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
    inputLabel: {
      marginLeft:20,
      marginBottom:5,
    },
  });
