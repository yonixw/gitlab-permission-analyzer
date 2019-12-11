import { UserAccess } from "./UserAccess";
import { GitlabAccessEnum } from "../gitlab-api";

export class User {
    id : number;
    name: string;
    username: string;
    myProjectAccess: Array<UserAccess> = [];

    toID() : string{
        return this.id.toString();
    }
}

export class UserWithAccess extends User {
    "access_level": GitlabAccessEnum;
    "expires_at": Date;
}