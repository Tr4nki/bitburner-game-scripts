import { SUPPORT_SERVERS, RUSH_BOTS, LOCALHOST } from "constants.js";
import { buildParamsForScript } from "utils.js";
import { deployScriptsLocal } from "deployScripts.js";

/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([]);
	let [action, targetHost, localServers] = flagData._;


	if (!action || !targetHost || !Object.keys(RUSH_BOTS).includes(action.toUpperCase())) {
		ns.tprint(`First param must be a valid action [weak,grow,hack] followed by a valid host name`);
		return 0;
	}

	let script = RUSH_BOTS[action.toUpperCase()];
	let runningServers = localServers && localServers.split(",") || SUPPORT_SERVERS.filter(localServer => ns.serverExists(localServer));

	await spawnRushBot(ns, script, targetHost, runningServers);
}

/** @param {NS} ns */
export async function spawnRushBot(ns, script, targetHost, hostList) {
	if (hostList.length) {
		let paramsByScript = buildParamsForScript(ns, [script], targetHost);
		await deployScriptsLocal(ns, [script], hostList, undefined, paramsByScript, true);
	}
	// export async function deployScriptsLocal(ns, files, targetHostList, sourceHost, paramsByScript, runAfter, execThreads) {
}