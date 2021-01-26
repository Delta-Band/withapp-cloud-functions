const admin = require("firebase-admin");

async function onPostCreateImpl(_snapshot, context) {
  const storyRef = await admin
    .firestore()
    .doc(`stories/${context.params.storyId}`)
    .get();

  const storyData = storyRef.data();

  const postNotifiers = storyData.postNotifiers.filter(
    (uid) => uid !== storyData.author
  );

  if (postNotifiers !== undefined) {
    const promises = [];

    const notification = {
      title: storyData.title,
      body: "has a new post",
    };

    postNotifiers.forEach((uid) => {
      promises.push(
        admin.messaging().sendToTopic(uid, {
          data: {
            storyId: context.params.storyId,
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
