
export const FJApi = {
    host: 'https://fj-demo-app.azurewebsites.net/api',
    getUser: `https://fj-demo-app.azurewebsites.net/api/Claim/GetUser`,
    postClaim: `https://fj-demo-app.azurewebsites.net/api/Claim/PostClaim`,
};

const url = 'https://cloud.ocrsdk.com/processReceipt?exportFormat=xml&country=Singapore&imageSource=photo';

export const ABBYYApi = {
  host: 'https://cloud.ocrsdk.com',
  processReceipt: `https://cloud.ocrsdk.com/processReceipt?exportFormat=xml&country=Singapore&imageSource=photo`,
  getTaskStatus: (id) => `https://cloud.ocrsdk.com/getTaskStatus?taskId=${id}`,
}

export default Constants = { FJApi, ABBYYApi };
