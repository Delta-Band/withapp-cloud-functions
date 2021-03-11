const admin = require("firebase-admin");

function createNotification(name, cover) {
  return {
    title: `${name} has started an new story.`,
    body: "Jump into see what they are up to!",
    image: cover === undefined ? "" : cover,
    icon: cover === undefined ? "" : cover,
  };
}

async function onStoryCreateImpl(snapshot, context) {
  const storyData = snapshot.data();

  // Updating the timestamp
  await admin.firestore().doc(`stories/${context.params.storyId}`).update({
    latestActivityTimestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notification
  const ownerRef = await admin
    .firestore()
    .doc(`users/${storyData.owner}`)
    .get();

  const ownerData = ownerRef.data();

  const notification = createNotification(
    ownerData.customDisplayName === undefined
      ? ownerData.display_name
      : ownerData.customDisplayName,
    storyData.cover
  );

  if (ownerData.notifiers.newStories !== undefined) {
    const promises = [];
    ownerData.notifiers.newStories.forEach((uid) => {
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
  onStoryCreateImpl,
};
