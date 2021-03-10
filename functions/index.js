// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.

const functions = require("firebase-functions");

const onPosts = require("./background/onPostCreateImpl");
const onComments = require("./background/onCommentCreateImpl");
const onStory = require("./background/onStoryCreate");

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require("firebase-admin");

admin.initializeApp();

exports.deleteUser = functions.auth.user().onDelete(async (userRecord) => {
  const userRef = admin.firestore().collection("users").doc(userRecord.uid);
  const userDoc = await userRef.get();
  const userData = userDoc.data();

  // Cleaup authoring stories
  if (userData.stories && userData.stories.authoring) {
    userData.stories.authoring.forEach(async (story) => {
      await deleteStory(story.id);
    });
  }

  // Clean up user settings folder
  admin
    .storage()
    .bucket()
    .deleteFiles(
      {
        prefix: `users/${userRecord.uid}/`,
      },
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(
            `All the Firebase Storage files in users/${userRecord.uid}/ have been deleted`
          );
        }
      }
    );

  // Delete user's Doc
  try {
    await userRef.delete();
    console.log(`deleted user ${userRecord.uid}`);
  } catch (err) {
    console.error(err);
  }
});

async function deleteStory(storyId) {
  await admin.firestore().collection("stories").doc(storyId).delete();
  admin
    .storage()
    .bucket()
    .deleteFiles(
      {
        prefix: `stories/${storyId}/`,
      },
      (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log(
            `All the Firebase Storage files in stories/${storyId}/ have been deleted`
          );
        }
      }
    );
}

exports.onCommentCreate = functions.firestore
  .document("stories/{storyId}/comments/{commentId}")
  .onCreate(onComments.onCommentCreateImpl);

exports.onCommentDelete = functions.firestore
  .document("stories/{storyId}/comments/{commentId}")
  .onDelete(onComments.onCommentDelete);

exports.onPostCreate = functions.firestore
  .document("stories/{storyId}/posts/{postId}")
  .onCreate(onPosts.onPostCreateImpl);

exports.onPostDelete = functions.firestore
  .document("stories/{storyId}/posts/{postId}")
  .onDelete(onPosts.onPostDeleteImpl);

exports.onPostUpdate = functions.firestore
  .document("stories/{storyId}/posts/{postId}")
  .onUpdate(onPosts.onPostUpdate);

exports.onStoryCreate = functions.firestore
  .document("stories/{storyId}")
  .onCreate(onStory.onStoryCreateImpl);
