import {GitlabAccessEnum} from "../gitlab-api"
import { Group } from "./Group";
import { User } from "./User";
import { Project } from "./Project";

export class UserAccess {
    myProject: Project;
    myUser: User;

    myAccessMode: GitlabAccessEnum;
    myExpireDate: Date;
    
    isInheritedGroupOrShare : boolean; 
    myInheritGroup: Group;
}