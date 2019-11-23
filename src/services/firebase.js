import Firebase from 'firebase'
import 'firebase/firestore'

let config = {
	apiKey: "AIzaSyDvb2PvMyggJWMaYbtdUmInApfvCc0RlcE",
    authDomain: "znt-05062016.firebaseapp.com",
    databaseURL: "https://znt-05062016.firebaseio.com",
    projectId: "znt-05062016",
    storageBucket: "znt-05062016.appspot.com",
    messagingSenderId: "331593362087"
}

let firebaseApp = Firebase.initializeApp(config)
const firestore = firebaseApp.firestore()

firestore.settings({
	timestampsInSnapshots: true
})

export default firestore