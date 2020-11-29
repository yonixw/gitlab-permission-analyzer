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
    archived : boolean;

    /*
     "shared_with_groups": [                          
        {                                              
            "group_id": 5,                               
            "group_name": "SubGroup2-1",                 
            "group_full_path": "parentgroup2/subgroup2", 
            "group_access_level": 30,                    
            "expires_at": null                           
        }                                              
    ],                                               
    */

    /*
    "namespace": {
        "id": 3,
    */
    namespace : {[key in ["id"]:]}

    toID() : string {
        return this.id.toString();
    }
}