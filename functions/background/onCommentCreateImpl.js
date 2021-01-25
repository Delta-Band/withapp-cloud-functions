const admin = require('firebase-admin');

async function createNotification(uid, storyTitle,text) {
	const authorRef = await admin.firestore().doc(`users/${uid}`).get();
	const authorData = await authorRef.data();

	return {
		title: `${storyTitle} @ ${authorData.display_name}`,
		body: text,
	}

}

async function onCommentCreate(snapshot, context) {
	const storyRef = await admin.firestore().doc(`stories/${context.params.storyId}`).get();

	const storyData = await storyRef.data();
	const commentData = snapshot.data();


	const discussionNotifiers = storyData.postNotifiers;

	const notification = createNotification(commentData.author,storyData.title, commentData.text);

	if(discussionNotifiers !== undefined){
		console.log(storyData.data());

		const promises = [];

		for(const uid in discussionNotifiers) {
			promises.push( admin.messaging()
				.sendToTopic(uid,{
					data:{
						storyId: storyRef.id,
						click_action: 'FLUTTER_NOTIFICATION_CLICK',
					},
					notification,
				}));
		}

		await Promise.all(promises);
	}

}

