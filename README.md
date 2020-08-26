# Develop

Zsh fix:

```
$ alias firebase="`npm config get prefix`/bin/firebase"

```

Copy key.json file to root and run

```
export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
```

Init emulators
<span style="color:#49a678">
(Select functions and firestore when prompt)
</span>

```
$ firebase init emulators
```

Start emulator with:

```
$ firebase emulators:start --inspect-functions
```

SDK: [See docs](https://firebase.google.com/docs/reference/functions)
<br>
<br>
<br>

# Deploy

Deploy all

```
$ firebase deploy --only functions
```

Deploy Specific functions

```
$ firebase deploy --only functions:addMessage,functions:makeUppercase
```

Delete all functions that match the specified name in all regions.

```
$ firebase functions:delete myFunction
```

Delete a specified function running in a specific region.

```
$ firebase functions:delete myFunction --region us-east-1
```

Delete more than one function

```
$ firebase functions:delete myFunction myOtherFunction
```

Delete a specified functions group.

```
$ firebase functions:delete groupA
```

Bypass the confirmation prompt.

```
$ firebase functions:delete myFunction --force
```

<br>
<br>
<br>
