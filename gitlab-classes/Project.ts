import { Group } from "./Group";
import { UserAccess } from "./UserAccess";
import { GitlabProjectVisibility } from "../gitlab-api";

export class Project {
    myGroup : Group;
    myMembers: Array<UserAccess> = [];

    id: number;
    name_with_namespace: string;
    empty_repo: boolean;
    web_url: string;
    visibility: GitlabProjectVisibility;
    
    created_at : Date;
    last_activity_at: Date;

    toID() : string {
        return this.id.toString();
    }
}