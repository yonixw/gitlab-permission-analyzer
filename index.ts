import { config as loadEnvFile } from "dotenv";

import {
    apiFetch, gitlabAPIEnum, apiFetchArray, GitlabAccessEnumDesc,
    apiFetchArrayAll, markProcessDone, GitlabAccessEnum
} from "./gitlab-api";
import { User, UserWithAccess } from "./gitlab-classes/User"
import { Pair } from "./Utils/Pair";
import { Group } from "./gitlab-classes/Group";
import { Project } from "./gitlab-classes/Project";
import { UserAccess } from "./gitlab-classes/UserAccess";
import { asyncForEach } from "./Utils/AsyncForeach";
import { bakeTemplate, makeUser2ProjReport } from "./html-templates/HtmlBuilder";

let allUsers: { [key: string]: User } = {};
let allProjects: { [key: string]: Project } = {};

async function handleProjects(projects: Array<Project>, parent: Group) {
    var count = 0;
    await asyncForEach(projects, async proj => {
        console.log("\t[P] Project " + (++count).toString() + "/" + projects.length);
        proj.myGroup = parent;
        allProjects[proj.toID()] = proj;

        let projMembers: Array<UserWithAccess> = await apiFetchArrayAll(
            UserWithAccess,
            gitlabAPIEnum.PROJECT_MEMBERS,
            [Pair.kv("id", proj.toID())]
        );

        let allUsers: Array<UserWithAccess> = await apiFetchArrayAll(
            UserWithAccess,
            gitlabAPIEnum.PROJECT_USERS,
            [Pair.kv("id", proj.toID())]
        );

        allUsers.forEach(user => {
            let access = new UserAccess();
            access.myProject = proj;
            access.myUser = user;
            access.myAccessMode = GitlabAccessEnum.USER;
            access.myExpireDate = null;
            access.isInheritedGroupOrShare = true;
            access.myInheritGroup = parent;

            if (!allUsers[user.toID()])
                allUsers[user.toID()] = user as User;
            allUsers[user.toID()].myProjectAccess.push(access);
        });

        projMembers.forEach(user => {
            let access = allUsers[user.toID()].myProjectAccess;

            access.myAccessMode = user.access_level;
            access.myExpireDate = user.expires_at;

            // Start assuming they were inherited
            access.isInheritedGroup = false;
            access.myInheritGroup = null;

            if (!allUsers[user.toID()])
                allUsers[user.toID()] = user as User;
            allUsers[user.toID()].myProjectAccess.push(access);
        });
    });
}


async function main() {
    try {
        console.log("⚠ Currently not supporting group2group inheritance ⚠");

        const myUser = await apiFetch(User, gitlabAPIEnum.MY_USER, []);
        allUsers[myUser.toID()] = myUser;

        console.log(
            "Found myself: " + myUser.name + ", " +
            "Username: " + myUser.username + "," +
            "Id: " + myUser.toID()
        );

        let myGroups: Array<Group> = await apiFetchArrayAll(
            Group,
            gitlabAPIEnum.MY_NAMESPACES,
            [Pair.kv("id", myUser.toID())]
        );
        let myOwnGroup = myGroups.filter(g=>g.web_url.indexOf("/groups/")==-1)
        myGroups = myGroups.filter(g=>g.web_url.indexOf("/groups/")>-1)

        myGroups.forEach(g => {
            console.log(`Found group: '${g.name}' [${g.toID()}]`);
        });

        // My project need user api and not group api
        console.log("[G] Group " + "0/" + (myGroups.length));
        const UserProjects = await apiFetchArrayAll(
            Project,
            gitlabAPIEnum.USER_PROJECTS,
            [Pair.kv("id", myUser.toID())]
        );
        await handleProjects(UserProjects, myOwnGroup[0]);

        for (let i = 0; i < myGroups.length; i++) {
            const group = myGroups[i];
            console.log("[G] Group " + (i + 1) + "/" + (myGroups.length+1));
            let groupProjects = await apiFetchArrayAll(
                Project,
                gitlabAPIEnum.GROUP_PROJECTS,
                [Pair.kv("id", group.toID())]
            );
            await handleProjects(groupProjects, group);
        }

        await makeUser2ProjReport(allUsers);
    } catch (error) {
        console.error(error);
    }
}

loadEnvFile();
main()
    .then(() => {
        markProcessDone();
        console.log("[DONE]")
    })
    .catch(e => console.error(e));

