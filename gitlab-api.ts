import fetch from "node-fetch";
import process from "process"
import { Pair } from "./Utils/Pair";
import { Factory } from "./Utils/Factory";

const gitlabAPIBase: string = "https://gitlab.com/api/v4";

export enum gitlabAPIEnum { 
    MY_USER, MY_NAMESPACES,
    USER_PROJECTS,
    GROUP_PROJECTS, GROUP_MEMBERS,
    PROJECT_MEMBERS, PROJECT_ALL_MEMBERS,
};

const allGitlabAPI: { [key in gitlabAPIEnum]: string; } = {
    [gitlabAPIEnum.MY_USER] : "/user",
    [gitlabAPIEnum.MY_NAMESPACES] : "/namespaces",
    [gitlabAPIEnum.USER_PROJECTS] : "/users/:id/projects",
    [gitlabAPIEnum.GROUP_PROJECTS] : "/groups/:id/projects",
    [gitlabAPIEnum.GROUP_MEMBERS] : "/groups/:id/members",
    [gitlabAPIEnum.PROJECT_MEMBERS] : "/projects/:id/members",
    [gitlabAPIEnum.PROJECT_ALL_MEMBERS] : "/projects/:id/members/all",
};

enum GitlabAccessEnum {
    GUEST=10,REPORTER=20,DEVELOPER=30,MAINTAINER=40,
    OWNER=50, 
}

const GitlabAccessEnumDesc: { [key in GitlabAccessEnum]: string; } = {
    [GitlabAccessEnum.GUEST] : "GUEST",
    [GitlabAccessEnum.REPORTER] : "REPORTER",
    [GitlabAccessEnum.DEVELOPER] : "DEVELOPER",
    [GitlabAccessEnum.MAINTAINER] : "MAINTAINER",
    [GitlabAccessEnum.OWNER] : "OWNER",
}

const apiUrl = (gitlabApi: string ): string => {
    return gitlabAPIBase + gitlabApi;
};


export const apiFetch = async <T>(C: new() => T, gitlabApi: gitlabAPIEnum, paramArray: Array<Pair<string,string>>): Promise<T> => {
    const apiRelative = allGitlabAPI[gitlabApi];
    let fullURL: string = apiUrl(apiRelative);
    
    for (let i = 0; i < paramArray.length; i++) {
        const param = paramArray[i];
        fullURL = fullURL.replace(":" + param.getKey(), param.getValue());
    }

    const GIT_TOKEN = process.env.GIT_TOKEN;
    if (!GIT_TOKEN)
        throw "GIT_TOKEN env is empty, needed for API. (You can put in .env file)";

    const res =  await fetch(fullURL, { method: "GET", headers: {"PRIVATE-TOKEN" : GIT_TOKEN} });
    const json = await res.json();
    return Object.assign(Factory.create(C), json);
}

export const apiFetchArray = async <T>(C: new() => T, gitlabApi: gitlabAPIEnum, paramArray: Array<Pair<string,string>>): Promise<Array<T>> => {
    const tempArray = await apiFetch(Array,gitlabApi, paramArray);
    const resultArray: Array<T> = [];
    tempArray.forEach(elemJSON => {
        resultArray.push(Object.assign(new C(), elemJSON));
    });
    return resultArray;
}



