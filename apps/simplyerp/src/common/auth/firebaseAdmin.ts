import * as firebase from 'firebase-admin';
var firebaseService = require('./firebase.json')
console.log('firebaseService.project_id', firebaseService.project_id)
const firebase_params = {
    type: firebaseService.type,
    projectId: firebaseService.project_id,
    privateKeyId: firebaseService.private_key_id,
    privateKey: firebaseService.private_key,
    clientEmail: firebaseService.client_email,
    clientId: firebaseService.client_id,
    authUri: firebaseService.auth_uri,
    tokenUri: firebaseService.token_uri,
    authProviderX509CertUrl: firebaseService.auth_provider_x509_cert_url,
    clientC509CertUrl: firebaseService.client_x509_cert_url
}

export const defaultApp = firebase.initializeApp({
    credential: firebase.credential.cert(firebase_params),
    databaseURL: "https://fir-auth-bd895.firebaseio.com"
});

