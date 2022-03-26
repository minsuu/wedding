import { SingleGame } from "./state";

export interface Command {
    key: string,
    func: (b: SingleGame) => void,
}


const CommandList: Command[] = [];
CommandList.push({
    key: '결혼',
    func: (b: SingleGame) => { b.keepFlags.wedding = true; }
});

export const CommandLibrary = new Map<string, Command>();
for(let command of CommandList){
    CommandLibrary.set(command.key, command);
}