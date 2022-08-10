import { LOCALHOST, MIN_BASE_SECURITY_LEVEL_RATIO, EXECUTABLES } from "constants.js"
/** @param {NS} ns */
export default async function main(ns) {

}

/** 
 * @param {NS} ns
 * @param {String} hostName
*/
export function isMinable(ns, hostName) {
	let server = ns.getServer(hostName);
	return server.hasAdminRights && !server.purchasedByPlayer && server.moneyMax > 0;
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

	let scriptRAM = ns.getScriptRam(scriptName, targetHost);
	let hostFreeRam = ns.getServerMaxRam(targetHost) - ns.getServerUsedRam(targetHost);
	let maxThreads = Math.floor(hostFreeRam / scriptRAM);
	return maxThreads;
}

export function calcMaxThreadsForInstances(threadsPerInstance, instances) {
	return Math.floor(threadsPerInstance / instances);
}

/** @param {NS} ns */
export function log(ns, templateStr) {
	ns.tprint(templateStr);
	ns.print(templateStr);
}

/** @param {NS} ns */
export function buildParamsForScript(ns, scriptList, rawParamData) {
	let ret = {};

	for (let script of scriptList) {
		switch (script) {
			case "basic.js":
				let { targetHosts } = rawParamData;
				let packedParams = [];
				for (let host of targetHosts) {
					packedParams.push([host]);
				}
				// ns.tprint(`targetHosts -> ${targetHosts}`);
				ret[script] = packedParams || [];
				break;

			default:
				break;



		}
	}
	return ret;
}
/** @param {NS} ns */
export function getMinuteMillis(ns, minutes) {
	try {
		return minutes * 60 * 1000;
	} catch (e) {
		ns.print(`Specified minutes argument -> ${minutes} is causing problems. Error: ${e.message}`);
	}
}

export function calcRatio(currentValue, totalValue) {
	return currentValue / totalValue;
}

export function calcPercent(currentValue, totalValue) {
	return calcRatio(currentValue, totalValue) * 100;
}
/** @param {NS} ns */
export function getFreeNodes(ns, nodeGroup) {
	return nodeGroup.filter(node => ns.getServerUsedRam(node) == 0);
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
export function terminateProccesses(ns, serverName, safetyGuard = false) {
	let procs = ns.ps(serverName);
	return procs && procs.length ? ns.killall(serverName, safetyGuard) : true;
}
/** @param {NS} ns */
export async function spawnRemoteScript(ns, script, runningServer, maxThreads, ...args) {
	if (ns.hasRootAccess(runningServer)) {

		if (runningServer != LOCALHOST) {
			ns.killall(runningServer);
			await copyFiles(ns, [script], runningServer);
		}
		maxThreads = maxThreads || calcMaxThreadsForScript(ns, script, runningServer);
		ns.exec(script, runningServer, maxThreads, ...args);
	}
}
export function printObjectProperties(ns, objToPrint, d = 1) {

	for (let [key, value] of Object.entries(objToPrint)) {
		if (typeof value == "object" && !Array.isArray(value)) {
			ns.tprint(`${">>>".repeat(d)} ${key}:`);
			printObjectProperties(ns, value, d + 1);
		} else {
			if (typeof value == "number") {
				ns.tprint(`${">>>".repeat(d)} ${key} --> ${ns.nFormat(value,"0,0.[00]")}`);
			} else {
				ns.tprint(`${">>>".repeat(d)} ${key} --> ${value}`);
			}
		}
	}
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