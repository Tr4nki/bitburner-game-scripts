import { crawlHosts, isNotMinable } from "utils.js";
import { SHARE_BOT, LOCALHOST } from "constants.js";
import { deployScriptsRemote } from "deployScripts.js";

const SHARE_ACTIONS = {
	QUERY_SHARE_POWER: "query",
	SPREAD_SHARE: "share"
}
/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([]);
	let params = flagData._;
	let [action] = params;



	switch (action) {
		case SHARE_ACTIONS.QUERY_SHARE_POWER:
			displaySharePower(ns);
			break;
		case SHARE_ACTIONS.SPREAD_SHARE:
			await spreadShare(ns);
			break;
		default:
			break;
	}
}

/** @param {NS} ns */
function displaySharePower(ns) {
	ns.tprint(`Share power -> ${ns.getSharePower()}`);
}

/** @param {NS} ns */
async function spreadShare(ns) {
	let targetHosts = getNonMinableRemoteHosts(ns);
	ns.tprint(`targetHosts -> ${targetHosts}`);
	await deployScriptsRemote(ns, [SHARE_BOT], targetHosts, LOCALHOST, true);
}

/** @param {NS} ns */
function getNonMinableRemoteHosts(ns) {
	return crawlHosts(ns, ns.getHostname()).filter(host => isNotMinable(ns, host));
}