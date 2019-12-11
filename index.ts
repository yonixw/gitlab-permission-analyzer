import {config as dotenvConfig} from "dotenv";

import {apiFetch, gitlabAPIEnum, apiFetchArray, GitlabAccessEnumDesc, apiFetchArrayAll} from "./gitlab-api";
import { User, UserWithAccess } from "./gitlab-classes/User"
import { Pair } from "./Utils/Pair";
import { Group } from "./gitlab-classes/Group";
import { Project } from "./gitlab-classes/Project";
import { UserAccess } from "./gitlab-classes/UserAccess";

let allUsers : {[key:string]: User} = {};
let allProjects : {[key:string]: Project} = {};

async function getAllO() {

}

async function handleProjects(projects: Array<Project>, parent:Group) {
    projects.forEach(async proj => {
        proj.myGroup = parent;
        allProjects[proj.toID()] = proj;

        let projMembers : Array<UserWithAccess> = await apiFetchArrayAll(
            UserWithAccess,
            gitlabAPIEnum.PROJECT_MEMBERS,
            [ Pair.kv("id",proj.toID()) ]
        );

        let allMembers : Array<UserWithAccess> = await apiFetchArrayAll(
            UserWithAccess,
            gitlabAPIEnum.PROJECT_ALL_MEMBERS,
            [ Pair.kv("id",proj.toID()) ]
        );

        allMembers.forEach(user => {
            let access = new UserAccess();
            access.myProject = proj;
            access.myUser = user;
            access.myAccessMode = user.access_level;
            access.myExpireDate = user.expires_at;

            // Start assuming they were inherited
            access.isInheritedGroup = true;
            access.myInheritGroup = parent;

            if (!allUsers[user.toID()])
                allUsers[user.toID()] = user as User;
            allUsers[user.toID()].myProjectAccess.push(access);
        });

        projMembers.forEach(user => {
            let userAccessArray = allUsers[user.toID()].myProjectAccess;
            let lastIndex = userAccessArray.length -1;
            userAccessArray[lastIndex].isInheritedGroup = false;
            userAccessArray[lastIndex].myInheritGroup = null;
        })
    });
}

function printUserToProject() {
    Object.values(allUsers).forEach(user => {
        console.log("[USER] " + user.name);
        user.myProjectAccess.forEach(access => {
            let result = "\t[PROJ] " + access.myProject.name_with_namespace;
            result += " | " + GitlabAccessEnumDesc[access.myAccessMode];
            result += " | " + ((access.isInheritedGroup) ? "GROUP" : "PROJ");
            result += " | " + access.myExpireDate ;
            console.log(result);
        })
    })
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

        const myGroups: Array<Group> = await apiFetchArrayAll(
            Group,  
            gitlabAPIEnum.MY_NAMESPACES,
            [ Pair.kv("id", myUser.toID()) ] 
        )

        myGroups.forEach(g => {
            console.log(`Found group: ${g.name} [${g.toID()}]`);
        });

        // My project need user api and not group api
        const UserProjects = await apiFetchArrayAll(
            Project,
            gitlabAPIEnum.USER_PROJECTS,
            [ Pair.kv("id",myUser.toID()) ]
        );
        handleProjects(UserProjects,myGroups[0]);

        for (let i = 1; i < myGroups.length; i++) {
            const group = myGroups[i];
            let groupProjects  = await apiFetchArrayAll(
                Project,
                gitlabAPIEnum.GROUP_PROJECTS,
                [ Pair.kv("id",group.toID()) ]
            );
            handleProjects(groupProjects, group);
        }

        printUserToProject();
    } catch (error) {
        console.error(error);
    }
}

dotenvConfig(); // load .env file
main().then(()=>console.log("[DONE]")).catch(e=>console.error(e));