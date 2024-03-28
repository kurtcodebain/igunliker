import { IgApiClient, LikedFeedResponseRootObject } from 'instagram-private-api';
import crypto from 'crypto';

const USERNAME = "???";
const PASSWORD = "???";

const ig = new IgApiClient();

const fetchLikedItems = async (): Promise<LikedFeedResponseRootObject> => {
    console.log("Fetching liked items..")
    const res = await ig.feed.liked().request();
    console.log("OK");

    return res;
};

const run = async () => {
    ig.state.generateDevice(crypto.randomUUID());

    let res;
    let loggedIn = false;

    try {
        console.log("Logging in..")
        await ig.account.login(USERNAME, PASSWORD);
        loggedIn = true;
        console.log("OK")

        res = await fetchLikedItems();

        for (const item of res.items) {
            await ig.media.unlike({ mediaId: item.id, moduleInfo: { module_name: 'feed_contextual_newsfeed_multi_media_liked' }});
            console.log("Unliked " + item.id);
        }
    } catch (error: any) {
        console.error(error);
    } finally {
        if (loggedIn) {
            console.log("Logging out and destroying session..");
            await ig.account.logout();
        }

        ig.destroy();
    } 
}

void run();
