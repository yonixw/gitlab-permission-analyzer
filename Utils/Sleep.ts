export const TMiliSecond : number = 1;
export const TSecond : number = 1000;
export const TMinute : number = TSecond * 60;
export const THour : number = TMinute * 60;
export const TDay : number = THour * 24;

export function sleep(ms : number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}