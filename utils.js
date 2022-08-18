import { LOCALHOST, MIN_BASE_SECURITY_LEVEL_RATIO, EXECUTABLES, DARK_WEB, BASE_WEAK_AMOUNT, CORE_WEAK_BONUS } from "constants.js"

/** @param {NS} ns */
export default async function main(ns) {

}

/** 
 * @param {NS} ns
 * @param {String} hostName
*/
export function isMinable(ns, hostName) {
	let server = ns.getServer(hostName);
	return hostName != DARK_WEB && server.hasAdminRights && !server.purchasedByPlayer && server.moneyMax > 0;
}

/** 
 * @param {NS} ns
 * @param {String} hostName
*/
export function isNotMinable(ns, hostName) {
	let server = ns.getServer(hostName);
	return hostName != DARK_WEB && server.hasAdminRights && !server.purchasedByPlayer && server.moneyMax <= 0;
}

/** 
 * @param {NS} ns
 * @param {String} hostName
*/
export function canExecuteScripts(ns, hostName) {
	let server = ns.getServer(hostName);
	return server.maxRam > 0;
}

/** 
 * @param {NS} ns
 * @param {String} hostName
 * @param {String} prevNode
*/
export function getAdjacentNodes(ns, baseNode, prevNode) {
	let hostList = ns.scan(baseNode);
	return baseNode == LOCALHOST ? hostList : prevNode ? hostList.filter(el => el != prevNode) : hostList.slice(1); //Assuming first element is the parent node
}
/** 
 * @param {NS} ns
 * @param {String} scriptName Name of the script file
 * @param {String} targetHost Target host where perform calculations
*/
export function calcMaxThreadsForScript(ns, scriptName, targetHost) {
	let scriptRAM = calcScriptRam(ns, scriptName);
	let hostFreeRam = calcFreeRam(ns, targetHost);
	let maxThreads = Math.floor(hostFreeRam / scriptRAM);
	return maxThreads;
}

/** @param {NS} ns */
export function calcMaxThreadsForInstances(threadsPerInstance, instances) {
	return Math.floor(threadsPerInstance / instances);
}

/** @param {NS} ns */
export function calcScriptRam(ns, scriptName) {
	return ns.getScriptRam(scriptName, LOCALHOST);
}

/** @param {NS} ns */
export function calcFreeRam(ns, targetHost) {
	let maxRam = ns.getServerMaxRam(targetHost);
	if (targetHost == LOCALHOST)
		maxRam -= 20;
	return maxRam - ns.getServerUsedRam(targetHost);
}

/** @param {NS} ns */
export function enoughtRamForScript(ns, targetHost, script) {
	let freeSpace = calcFreeRam(ns, targetHost);
	let scriptRam = calcScriptRam(ns, script);
	return freeSpace >= scriptRam;
}


/** @param {NS} ns */
export function log(ns, templateStr) {
	ns.tprint(templateStr);
	ns.print(templateStr);
}

/** @param {NS} ns */
export function buildParamsForScript(ns, scriptList, rawParamData) {
	let ret = {};
	let packedParams = [];

	for (let script of scriptList) {
		switch (script) {
			case "basic.js":
				let { targetHosts } = rawParamData;
				for (let host of targetHosts) {
					packedParams.push([host]);
				}
				// ns.tprint(`targetHosts -> ${targetHosts}`);
				ret[script] = packedParams || [];
				break;
			case "weakBot.js":
			case "growBot.js":
			case "hackBot.js":
				packedParams.push([rawParamData])
				ret[script] = packedParams; //explicar por que se empaquetan así los parametros
				break;
			default:
				break;



		}
	}
	return ret;
}
/** @param {NS} ns */
export function getSecondMillis(ns, seconds) {
	try {
		return seconds * 1000;
	} catch (e) {
		ns.print(`Specified minutes argument -> ${seconds} is causing problems. Error: ${e.message}`);
	}
}
/** @param {NS} ns */
export function getMinuteMillis(ns, minutes) {
	try {
		return minutes * getSecondMillis(ns, 60);
	} catch (e) {
		ns.print(`Specified minutes argument -> ${minutes} is causing problems. Error: ${e.message}`);
	}
}
/** @param {NS} ns */
export function getHourMillis(ns, hours) {
	try {
		return hours * getMinuteMillis(60);
	} catch (e) {
		ns.print(`Specified minutes argument -> ${hours} is causing problems. Error: ${e.message}`);
	}
}

export function calcRatio(currentValue, totalValue) {
	return currentValue / totalValue;
}

export function calcPercent(currentValue, totalValue) {
	return calcRatio(currentValue, totalValue) * 100;
}
/** @param {NS} ns */
export function getFreeNodes(ns, nodeGroup, script) {
	return nodeGroup.filter(node => enoughtRamForScript(ns, node, script));
}

/** @param {NS} ns */
export function calcCurrentSecurityRatio(ns, hostName) {
	return calcRatio(ns.getServerSecurityLevel(hostName), calcBaseSecurityLevel(ns, hostName));
}

/** @param {NS} ns */
export function calcCurrentMoneyRatio(ns, hostName) {
	return calcRatio(ns.getServerMoneyAvailable(hostName), ns.getServerMaxMoney(hostName));
}

/** @param {NS} ns */
export function calcCurrentSecurityPercent(ns, hostName) {
	return calcPercent(ns.getServerSecurityLevel(hostName), calcBaseSecurityLevel(ns, hostName));
}

/** @param {NS} ns */
export function calcCurrentMoneyPercent(ns, hostName) {
	return calcPercent(ns.getServerMoneyAvailable(hostName), ns.getServerMaxMoney(hostName));
}

/** @param {NS} ns */
export function calcBaseSecurityLevel(ns, hostName) {
	let minSecLvl = ns.getServerMinSecurityLevel(hostName);
	return minSecLvl == 1 ? minSecLvl : minSecLvl / MIN_BASE_SECURITY_LEVEL_RATIO;
}

/** @param {NS} ns */
export function getAvailableXploits(ns) {
	let availableXploits = [];

	for (let executable in EXECUTABLES) {
		if (ns.fileExists(EXECUTABLES[executable], LOCALHOST)) {
			availableXploits.push(executable);
		}
	}
	return availableXploits;
}

/** @param {NS} ns */
export function printObjectProperties(ns, objToPrint, d = 1) {

	for (let [key, value] of Object.entries(objToPrint)) {
		if (typeof value == "object" && !Array.isArray(value)) {
			ns.tprint(`${">>>".repeat(d)} ${key}:`);
			printObjectProperties(ns, value, d + 1);
		} else {
			if (typeof value == "number") {
				ns.tprint(`${">>>".repeat(d)} ${key} --> ${ns.nFormat(value, "0,0.[00]")}`);
			} else {
				ns.tprint(`${">>>".repeat(d)} ${key} --> ${value}`);
			}
		}
	}
}

/** @param {NS} ns */
export function crawlHosts(ns, baseHostName, prevNode = ns.getHostname()) {
	let crawledHosts = [];
	let adjacentNodes = getAdjacentNodes(ns, baseHostName, prevNode);
	for (let host of adjacentNodes) {
		crawledHosts.push(host);
		crawledHosts = crawledHosts.concat(crawlHosts(ns, host, baseHostName));
	}
	return crawledHosts;
}

/** @param {NS} ns */
export function calcThreadsForMinSec(ns, hostName, cores) {
	return calcThreadsForWeak(ns, hostName, ns.getServerMinSecurityLevel(hostName), cores);
}

/** @param {NS} ns */
export function calcThreadsForMaxMoney(ns, hostName, cores) {
	return calcThreadsForGrow(ns, hostName, ns.getServerMaxMoney(hostName), cores);
}

/** @param {NS} ns */
export function calcThreadsForWeak(ns, hostName, desiredLvl, cores) {
	let diff = ns.getServerSecurityLevel(hostName) - desiredLvl;
	if (diff <= 0) {
		return 0;
	}
	let ret = diff / ns.weakenAnalyze(1, cores);
	return Math.ceil(ret);
}

function calcWeakEffect(cores) {
	return BASE_WEAK_AMOUNT + (CORE_WEAK_BONUS * cores);
}

/** @param {NS} ns */
export function calcThreadsForGrow(ns, hostName, desiredMoney, cores) {
	let currentMoney = ns.getServerMoneyAvailable(hostName);
	let diff = desiredMoney - currentMoney;
	if (diff <= 0) {
		return 0;
	}
	let incrRatio = diff / currentMoney;
	if (incrRatio < 1) {
		incrRatio += 1;
	}

	return Math.ceil(ns.growthAnalyze(hostName, incrRatio, cores));
}
/** @param {NS} ns */
export function ServerSnapshot(ns, serverName) {

	if (!ns.serverExists(serverName))
		return null;

	let server = ns.getServer(serverName);
	let fileNames = ns.ls(serverName);
	let tempFilesMap = fileNames && fileNames.length ? {} : null;
	for (let fileName of fileNames) {
		tempFilesMap[fileName] = ns.read(fileName);
	}

	this.serverName = serverName;
	this.serverRam = server.maxRam;
	this.filesData = tempFilesMap;
	this.runningProcesses = ns.ps(serverName);
}