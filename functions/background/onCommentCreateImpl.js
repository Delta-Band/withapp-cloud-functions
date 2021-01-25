const admin = require("firebase-admin");

async function createNotification(uid, storyTitle, text) {
  const authorRef = await admin.firestore().doc(`users/${uid}`).get();
  const authorData = await authorRef.data();

  return {
    title: `${storyTitle} @ ${authorData.display_name}`,
    body: text,
  };
}

async function onCommentCreateImpl(snapshot, context) {
  const storyRef = await admin
    .firestore()
    .doc(`stories/${context.params.storyId}`)
    .get();

  const storyData = storyRef.data();
  const commentData = snapshot.data();

  const discussionNotifiers = storyData.postNotifiers;

  const notification = await createNotification(
    commentData.author,
    storyData.title,
    commentData.text
  );

  if (discussionNotifiers !== undefined) {
    const promises = [];

    discussionNotifiers.forEach((uid) => {
      promises.push(
        admin.messaging().sendToTopic(uid, {
          data: {
            storyId: storyRef.id,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
          },
          notification,
        })
      );
    });

    await Promise.all(promises);
  }
}

module.exports = {
  onCommentCreateImpl,
};
