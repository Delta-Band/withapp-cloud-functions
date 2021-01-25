const admin = require("firebase-admin");

async function onPostCreateImpl(snapshot, context) {
  const storyRef = await admin
    .firestore()
    .doc(`stories/${context.params.storyId}`)
    .get();

  const storyData = storyRef.data();

  const postNotifiers = storyData.postNotifiers;

  if (postNotifiers !== undefined) {
    const promises = [];

    const notification = {
      title: `${storyData.title} has a new post`,
    };

    postNotifiers.forEach((uid) => {
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
  onPostCreateImpl,
};
