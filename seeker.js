import { calcCurrentSecurityRatio, calcCurrentMoneyRatio, calcBaseSecurityLevel, isMinable, getMinuteMillis, getFreeNodes } from "utils.js";
import { spawnRushBot } from "rush.js";
import { spreadBotnet } from "botnet.js";
import { SUPPORT_SERVERS, RUSH_BOTS, MIN_SECURITY_LEVEL } from "constants.js"


/** @param {NS} ns */
export async function main(ns) {

	let targetNodes;
	let candidates;
	let freeNodes;

	let checks = getChecks(ns);
	let priorityChecs = getPriorityChecks(ns);

	let validServers = SUPPORT_SERVERS.filter(srv => ns.serverExists(srv));
	do {

		targetNodes = await getTargetNodes(ns);

		for (let [checkFn, action] of priorityChecs) {

			candidates = targetNodes.filter(checkFn);
			if (candidates.length) {
				ns.print(`>>> PRIORITY QUEUE Those candidates for ${action} -> ${candidates}`);
				await spawnRushBot(ns, action, candidates.shift(), validServers);
				break;
			}
		}

		freeNodes = getFreeNodes(ns, validServers);

		if (freeNodes.length) {

			for (let [checkFn, action] of checks) {
				candidates = targetNodes.filter(checkFn);
				if (candidates.length) {
					ns.print(`>>> Those candidates for ${action} -> ${candidates}`);
					await spawnRushBot(ns, action, candidates.shift(), freeNodes);
					break;
				}
			}
		}
		ns.print(`*********************`);
		await ns.sleep(getMinuteMillis(ns, 1));
	} while (true)
}



/** @param {NS} ns */
function thatsSoHardMen(ns, nodeName) {
	let securityRatio = calcCurrentSecurityRatio(ns, nodeName);

	ns.print(`securityRatio -> ${securityRatio}`);

	if (calcBaseSecurityLevel(ns, nodeName) == MIN_SECURITY_LEVEL) {
		return securityRatio >= 1.5;
	} else {
		return securityRatio >= 1;
	}
}

/** @param {NS} ns */
function overFarmedServer(ns, nodeName) {
	return calcCurrentMoneyRatio(ns, nodeName) <= 0.2;
}

/** @param {NS} ns */
function quiteHard(ns, nodeName) {
	return calcCurrentSecurityRatio(ns, nodeName) >= 0.6;
}

/** @param {NS} ns */
function needsGrowSupport(ns, nodeName) {
	return calcCurrentMoneyRatio(ns, nodeName) <= 0.5;
}

/** @param {NS} ns */
function difficultOutOfControl(ns, nodeName) {
	return calcCurrentSecurityRatio(ns, nodeName) >= 3.5;
}

/** @param {NS} ns */
async function getTargetNodes(ns) {
	let nukedHosts = await spreadBotnet(ns, ns.getHostname());
	return nukedHosts.filter(isMinable.bind(null, ns));
}

/** @param {NS} ns */
function getChecks(ns) {
	return [
		[thatsSoHardMen.bind(null, ns), RUSH_BOTS.WEAK],
		[overFarmedServer.bind(null, ns), RUSH_BOTS.GROW],
		[quiteHard.bind(null, ns), RUSH_BOTS.WEAK],
		[needsGrowSupport.bind(null, ns), RUSH_BOTS.GROW]
	];
}

/** @param {NS} ns */
function getPriorityChecks(ns) {
	return [
		[difficultOutOfControl.bind(null, ns), RUSH_BOTS.WEAK]
	];
}