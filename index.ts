import {config as dotenvConfig} from "dotenv";

import {apiFetch, gitlabAPIEnum} from "./gitlab-api";
import {User} from "./gitlab-classes/User"
import { Pair } from "./Utils/Pair";
import { Group } from "./gitlab-classes/Group";

async function main() {
    console.log("(*) Currently not supporting group inheritance");

    const myUser = await apiFetch(User, gitlabAPIEnum.MY_USER, []);
    const myGroup = [] as Array<Group>;
    (await apiFetch(Array , gitlabAPIEnum.MY_NAMESPACES,[new Pair("id", myUser.toID())] ))
    .forEach(groupJSON => {
        myGroup.push(Object.assign(new Group(), groupJSON));
    });

    console.log(`Found myself: ${myUser.name}, username: ${myUser.username}, id:${myUser.toID()}`);

    myGroup.forEach(g => {
        console.log(`Found group: ${g.name} [${g.toID()}]`);
    });
}

dotenvConfig(); // load .env file
main().then(()=>console.log("done")).catch((e)=>console.error(e));