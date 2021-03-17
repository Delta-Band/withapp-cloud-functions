const admin = require("firebase-admin");

async function onUserUpdate(change, context) {
  const newValue = change.after.data();

  const previousValue = change.before.data();

  const uid = context.params.userId;

  if (newValue.customDisplayName !== undefined) {
    const isNameChange =
      newValue.customDisplayName !== previousValue.customDisplayName;

    const isProfilePictureChange =
      newValue.customProfileImage !== previousValue.customProfileImage;

    if (isNameChange || isProfilePictureChange) {
      const storiesRef = await admin
        .firestore()
        .collection("stories")
        .where("owner", "==", uid)
        .get();

      const authorName =
        newValue.customDisplayName === undefined
          ? newValue.display_name
          : newValue.customDisplayName;

      const authorPicture =
        newValue.customProfileImage === undefined
          ? newValue.profile_image
          : newValue.customProfileImage;

      storiesRef.docs.forEach(async (doc) => {
        await admin.firestore().doc(`stories/${doc.id}`).update({
          authorName: authorName,
          authorPicture: authorPicture,
        });

        const commentsRef = await admin
          .firestore()
          .collection(`stories/${doc.id}/comments`)
          .where("author", "==", uid)
          .get();

        commentsRef.forEach(async (commentDoc) => {
          await admin
            .firestore()
            .doc(`stories/${doc.id}/comments/${commentDoc.id}`)
            .update({
              authorName: authorName,
              authorPicture: authorPicture,
            });
        });
      });
    }
  }
}

module.exports = {
  onUserUpdate,
};
