export class User {
    id : number;
    name: string;
    username: string;

    toID() : string{
        return this.id.toString();
    }
}