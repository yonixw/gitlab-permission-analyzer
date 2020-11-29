import { pathToFileURL } from "url";
import { Project } from "./Project";

export class Group {
    id: number;
    name: string;
    path: string;
    web_url: string;
    parent_id : number | null;

    myProjects: Array<Project> = [];

    toID() : string{
        return this.id.toString();
    }
}