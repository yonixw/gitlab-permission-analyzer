import {config as dotenvConfig} from "dotenv";

import {apiFetch, gitlabAPIEnum} from "./gitlab-api";
import {User} from "./gitlab-classes/User"
import { Pair } from "./Pair";



async function main() {
    console.log("(*) Currently not supporting group inheritance");

    const myUser = await apiFetch<User>(gitlabAPIEnum.MY_USER, []);
    console.log(myUser.id);
}

dotenvConfig(); // load .env file
main().then(()=>console.log("done")).catch((e)=>console.error(e));