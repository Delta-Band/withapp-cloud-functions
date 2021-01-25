const admin = require('firebase-admin');


async function onPostCreateImpl(snapshot, context) {
	const storyRef = admin.firestore().doc(`stories/${context.params.storyId}`);

	const storyData = await storyRef.get();

	const postNotifiers = storyData.data().postNotifiers;

	console.log(storyData.data());

	const promises = [];

	for(const uid in postNotifiers){
		promises.push( admin.messaging()
			.sendToTopic(uid,{
				data:{
					storyId: storyRef.id,
					click_action: 'FLUTTER_NOTIFICATION_CLICK',
				}
			},{
				title:`${storyData.data().title} has a new post`
			})
		);
	}

	await Promise.all(promises);
}

