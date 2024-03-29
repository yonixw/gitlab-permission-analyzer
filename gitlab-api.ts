import fetch , { Response } from "node-fetch";
import process from "process"
import { Pair } from "./Utils/Pair";
import { Factory } from "./Utils/Factory";
import { sleep, TSecond } from "./Utils/Sleep";

export enum gitlabAPIEnum { 
    MY_USER, MY_TOP_LEVEL_NAMESPACES,
    USER_PROJECTS,
    GROUP_PROJECTS, GROUP_MEMBERS, GROUP_DESCENDANT,
    PROJECT_MEMBERS, PROJECT_ALL_MEMBERS,
    PROJECT_USERS,
};

const allGitlabAPI: { [key in gitlabAPIEnum]: string; } = {
    [gitlabAPIEnum.MY_USER] : "/user",
    [gitlabAPIEnum.MY_TOP_LEVEL_NAMESPACES] : "/namespaces",
    [gitlabAPIEnum.USER_PROJECTS] : "/users/:id/projects",
    [gitlabAPIEnum.GROUP_PROJECTS] : "/groups/:id/projects",
    [gitlabAPIEnum.GROUP_MEMBERS] : "/groups/:id/members",
    [gitlabAPIEnum.GROUP_DESCENDANT]: "/groups/:id/descendant_groups?min_access_level=10",
    [gitlabAPIEnum.PROJECT_MEMBERS] : "/projects/:id/members",
    [gitlabAPIEnum.PROJECT_ALL_MEMBERS] : "/projects/:id/members/all",
    [gitlabAPIEnum.PROJECT_USERS]: "/projects/:id/users"
};

export enum GitlabAccessEnum {
    USER=-1,
    GUEST=10,REPORTER=20,DEVELOPER=30,MAINTAINER=40,
    OWNER=50, 
}

export function maxAccess(a:GitlabAccessEnum, b:GitlabAccessEnum) {
    return (a>b)?a:b;
}

export const GitlabAccessEnumDesc: { [key in GitlabAccessEnum]: string; } = {
    [GitlabAccessEnum.GUEST] : "GUEST",
    [GitlabAccessEnum.REPORTER] : "REPORTER",
    [GitlabAccessEnum.DEVELOPER] : "DEVELOPER",
    [GitlabAccessEnum.MAINTAINER] : "MAINTAINER",
    [GitlabAccessEnum.OWNER] : "OWNER",
    [GitlabAccessEnum.USER]: "Any Level (USER)"
}

export type GitlabProjectVisibility = "private" | "public" | "internal";

const apiUrl = (gitlabApi: string ): string => {
    return (process.env.GIT_URL || "https://gitlab.com/api/v4") + gitlabApi;
};

var isProcessDone :boolean = false;
export const markProcessDone = () => {isProcessDone = true;};

const fetchURLResponseWithToken = async (fullURL: string) => {
    //https://docs.gitlab.com/ee/user/gitlab_com/index.html#haproxy-api-throttle
    await sleep(TSecond / (10 - 1));

    const GIT_TOKEN = process.env.GIT_TOKEN;
    if (!GIT_TOKEN)
        throw "GIT_TOKEN env is empty, needed for API. (put in .env file?)";

    console.log("[URL] " + fullURL);
    if (isProcessDone)
        throw "Process done before all work done. Check async + forEach async."
    const res =  await fetch(
        fullURL,
        { method: "GET", headers: {"PRIVATE-TOKEN" : GIT_TOKEN} }
    );

    return res;
}

const fetchResponseApi = async (
    gitlabApi: gitlabAPIEnum, paramArray: Array<Pair<string,string>>
) => {
    const apiRelative = allGitlabAPI[gitlabApi];
    let fullURL: string = apiUrl(apiRelative);
    
    for (let i = 0; i < paramArray.length; i++) {
        const param = paramArray[i];
        fullURL = fullURL.replace(":" + param.getKey(), param.getValue());
    }

    const res =  await fetchURLResponseWithToken(fullURL);
    return res;
}


export const apiFetch = async <T>(
    C: new() => T, 
    gitlabApi: gitlabAPIEnum,
    paramArray: Array<Pair<string,string>>
    )
    : Promise<T> => {

    const res = await fetchResponseApi(gitlabApi, paramArray)
    const json = await res.json();
    return Object.assign(Factory.create(C), json);
}


const respToArrayOf = async <T>(C: new() => T, resp: Response) => {
    let result: Array<T> = [];
    let json : [] = await resp.json();
    
    json.forEach(item => {
        result.push(Object.assign(new C(), item))
    });
    return result;
}

export const apiFetchArray = async <T>(
    C: new() => T,
    gitlabApi: gitlabAPIEnum,
    paramArray: Array<Pair<string,string>>
    )
    : Promise<Array<T>> => {

    const resp = await fetchResponseApi(gitlabApi, paramArray);
    const result = await respToArrayOf(C,resp);
    return result;
}



export const apiFetchArrayAll = async <T>(
    C: new() => T,
    gitlabApi: gitlabAPIEnum,
    paramArray: Array<Pair<string,string>>)
    : Promise<Array<T>> => {

        // Gitlab pagination:
         //https://docs.gitlab.com/ee/api/README.html#keyset-based-pagination
        let result : Array<T> = []

        let response = await fetchResponseApi(gitlabApi, paramArray);
        let nextUrl = response.headers["Link"];
        result = result.concat(await respToArrayOf(C,response));

        while (nextUrl) {
            response = await fetchResponseApi(gitlabApi, paramArray);
            nextUrl = response.headers["Link"];
            result = result.concat(await respToArrayOf(C,response));
        }

        return result;
}

