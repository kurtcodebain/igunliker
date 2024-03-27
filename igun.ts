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
        console.log("Trying to log in..")
        await ig.account.login(USERNAME, PASSWORD);
        loggedIn = true;
        console.log("OK")

        res = await fetchLikedItems();

        while (res.more_available) {
            for (const item of res.items) {
                await ig.media.unlike({ mediaId: item.id, moduleInfo: { module_name: 'feed_contextual_newsfeed_multi_media_liked' }});
                console.log("Unliked " + item.id);
            }
    
            res = await fetchLikedItems();
        }
    } catch (error: any) {
        if (error.message.includes("400 Bad Request; Please wait a few minutes before you try again.")) {
            console.log("Try again in a few minutes");
        }
        else if (error.message.includes("400 Bad Request; challenge_required")) {
            console.log("Manual reauthorization in app or web required")
        } else {
            console.error(error);
        }
    } finally {
        if (loggedIn) {
            console.log("Logging out and destroying session..");
            await ig.account.logout();
        }

        ig.destroy();
    } 
}

void run();
