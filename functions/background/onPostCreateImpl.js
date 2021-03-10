const admin = require("firebase-admin");

async function onPostCreateImpl(_snapshot, context) {
  const storyRef = await admin
    .firestore()
    .doc(`stories/${context.params.storyId}`)
    .get();

  const storyData = storyRef.data();

  const users = await admin
    .firestore()
    .collection("users")
    .where("notifiers.posts", "array-contains", context.params.storyId)
    .get();

  // Updating the timestamp
  await admin.firestore().doc(`stories/${context.params.storyId}`).update({
    latestActivityTimestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notifications part
  const postNotifiers = [];

  users.forEach((doc) => postNotifiers.push(doc.id));

  if (postNotifiers !== undefined) {
    const promises = [];

    const notification = {
      title: storyData.title,
      body: "has a new post",
      image: storyData.cover !== undefined ? storyData.cover : "",
      icon: storyData.cover !== undefined ? storyData.cover : "",
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
