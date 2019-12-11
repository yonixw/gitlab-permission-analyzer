import { pathToFileURL } from "url";
import { Project } from "./Project";

export class Group {
    /*
    {                                              
  "id": 4891969,                               
  "name": "qp-ui",                             
  "path": "qp-ui",                             
  "kind": "group",                             
  "full_path": "qp-ui",                        
  "parent_id": null,                           
  "avatar_url": null,                          
  "web_url": "https://gitlab.com/groups/qp-ui",
  "members_count_with_descendants": 2,         
  "billable_members_count": 2,                 
  "plan": "free"                               
},                                             
    */

    id: number;
    name: string;
    path: string;
    web_url: string;

    myProjects: Array<Project> = [];

    toID() : string{
        return this.id.toString();
    }
}