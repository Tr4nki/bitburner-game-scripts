import { SUPPORT_SERVERS, RUSH_BOTS, LOCALHOST } from "constants.js";
import { calcMaxThreadsForScript, spawnRemoteScript } from "utils.js";

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
	let maxThreads;
	for (let runningServer of hostList) {
		maxThreads = calcMaxThreadsForScript(ns, script, runningServer);
		await spawnRemoteScript(ns, script, runningServer, maxThreads, targetHost, maxThreads);
	}
}