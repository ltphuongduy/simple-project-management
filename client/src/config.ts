// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'itc7cg370h'
const region = 'us-west-2'
export const apiEndpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-7qeiwxuy.us.auth0.com',            // Auth0 domain
  clientId: 'I11IWdQIcezsgRrzefSPU6dT7kls9YeK',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
