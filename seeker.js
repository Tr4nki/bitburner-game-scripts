import { calcCurrentSecurityRatio, calcCurrentMoneyRatio, calcBaseSecurityLevel, isMinable, getMinuteMillis, getFreeNodes } from "utils.js";
import { spawnRushBot } from "rush.js";
import { spreadBotnet } from "botnet.js";
import { SUPPORT_SERVERS, RUSH_BOTS, MIN_SECURITY_LEVEL, LOCALHOST, DARK_WEB } from "constants.js"
import { killProcesses, filterProcesses } from "processUtils.js"


const NODES_BLACK_LIST = [
	"foodnstuff",
	DARK_WEB
];
/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([
		["el", false]
	]);
	let targetNodes;
	let candidates;
	let freeNodes;
	let validServers;

	let checks = getChecks(ns);
	let priorityChecs = getPriorityChecks(ns);
	let stateOfEmergency = false;

	do {
		validServers = SUPPORT_SERVERS.filter(srv => ns.serverExists(srv));
		if (flagData.el) {
			validServers = validServers.filter(srv => srv != LOCALHOST);
		}
		targetNodes = await getTargetNodes(ns);

		for (let [checkFn, action] of priorityChecs) {
			candidates = targetNodes.filter(checkFn);
			if (candidates.length) {
				if (!stateOfEmergency) {
					ns.print(`>>> PRIORITY QUEUE Those candidates for ${action} -> ${candidates}`);
					for (let host of validServers) {
						if (host == LOCALHOST) {
							killBotsLocalhost(ns);
						} else {
							ns.killall(host);
						}
					}
					await spawnRushBot(ns, action, candidates.shift(), validServers);
					stateOfEmergency = true;
				}
				// break;
			} else {
				stateOfEmergency = false;
			}
		}

		// if (freeNodes.length) {
		for (let [checkFn, action] of checks) {
			candidates = targetNodes.filter(checkFn);
			if (candidates.length) {
				ns.print(`>>> Those candidates for ${action} -> ${candidates}`);
				freeNodes = getFreeNodes(ns, validServers, action);
				await spawnRushBot(ns, action, candidates.shift(), freeNodes);
				break;
			}
		}
		// }
		ns.print(`*********************`);
		await ns.sleep(getMinuteMillis(ns, 0.5));
	} while (true);
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
	let whiteListHosts = nukedHosts.filter(node => !NODES_BLACK_LIST.includes(node));
	return whiteListHosts.filter(isMinable.bind(null, ns));
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

/** @param {NS} ns */
function killBotsLocalhost(ns) {
	let procss = ns.ps(LOCALHOST);
	let filteredProcss = [...filterProcesses(procss, RUSH_BOTS.WEAK), ...filterProcesses(procss, RUSH_BOTS.GROW), ...filterProcesses(procss, RUSH_BOTS.HACK)]
	let killResults = killProcesses(ns, LOCALHOST, filteredProcss);
	return killResults.every(res => res);
}