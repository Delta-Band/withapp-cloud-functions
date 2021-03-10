const admin = require("firebase-admin");

async function createNotification(uid, storyTitle, text) {
  const authorRef = await admin.firestore().doc(`users/${uid}`).get();
  const authorData = authorRef.data();

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

  const users = await admin
    .firestore()
    .collection("users")
    .where("notifiers.comments", "array-contains", context.params.storyId)
    .get();

  // Updating the timestamp
  await admin.firestore().doc(`stories/${context.params.storyId}`).update({
    latestActivityTimestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Notifications part
  const discussionNotifiers = [];

  users.forEach((doc) => {
    if (doc.id !== commentData.author) {
      return discussionNotifiers.push(doc.id);
    } else {
      return null;
    }
  });

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

async function onCommentDelete(_snapshot, context) {
  var timestamps = [];

  const latestPostCol = await admin
    .firestore()
    .collection(`stories/${context.params.storyId}/posts`)
    .orderBy("timestamp", "desc")
    .limit(1)
    .get(1);

  const latestCommentCol = await admin
    .firestore()
    .collection(`stories/${context.params.storyId}/comments`)
    .orderBy("timestamp", "desc")
    .limit(1)
    .get(1);

  latestPostCol.docs.forEach((doc) => {
    if (doc.exists) {
      timestamps.push(doc.get("timestamp"));
    }
  });

  latestCommentCol.docs.forEach((doc) => {
    if (doc.exists) {
      timestamps.push(doc.get("timestamp"));
    }
  });

  var latestActivityTimestamp;

  if (timestamps.length === 2) {
    if (timestamps[0] > timestamps[1]) {
      latestActivityTimestamp = timestamps[0];
    } else {
      latestActivityTimestamp = timestamps[1];
    }
  } else {
    latestActivityTimestamp = timestamps[0];
  }

  await admin.firestore().doc(`stories/${context.params.storyId}`).update({
    latestActivityTimestamp: latestActivityTimestamp,
  });
}

module.exports = {
  onCommentCreateImpl,
  onCommentDelete,
};
