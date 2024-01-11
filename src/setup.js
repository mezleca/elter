import fs from "node:fs";

export const cmds_file = fs.readdirSync("./src/commands/").filter(file => file.endsWith(".js"));
let cmds = [];

for (let i = 0; i < cmds_file.length; i++) {
    cmds.push(import(`./commands/${cmds_file[i]}`));
};

export const commands = cmds;