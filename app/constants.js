import { StyleSheet } from 'react-native';
import {Constants} from 'expo';

export const FJApi = {
    host: 'https://fj-demo-app.azurewebsites.net/api',
    apiUser:'fjdemoadmin',
    apiPassword:'Fuj1tsu123',
    getCompany: `https://fj-demo-app.azurewebsites.net/api/Claim/GetCompany`,
    getUser: `https://fj-demo-app.azurewebsites.net/api/Claim/GetUser`,
    postClaim: `https://fj-demo-app.azurewebsites.net/api/Claim/PostClaim`,
};

const url = 'https://cloud.ocrsdk.com/processReceipt?exportFormat=xml&country=Singapore&imageSource=photo';

export const ABBYYApi = {
  host: 'https://cloud.ocrsdk.com',
  processReceipt: `https://cloud.ocrsdk.com/processReceipt?exportFormat=xml&country=Singapore&imageSource=photo`,
  getTaskStatus: (id) => `https://cloud.ocrsdk.com/getTaskStatus?taskId=${id}`,
}

export const GlobalStyles = StyleSheet.create({
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

export const ClaimTypes = {
    Entertainment: '05',
    Expense: '03',
}

export default { FJApi, ABBYYApi, GlobalStyles };
