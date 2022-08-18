import { calcMaxThreadsForScript } from "utils.js";

/** @param {NS} ns */
export async function main(ns) { }


/** @param {NS} ns */
export async function spawnRemoteScript(ns, script, runningServer, maxThreads, ...args) {
	if (ns.hasRootAccess(runningServer)) {
		maxThreads = maxThreads || calcMaxThreadsForScript(ns, script, runningServer);
		ns.exec(script, runningServer, maxThreads, ...args);
	}
}

/** @param {NS} ns */
export function terminateProccesses(ns, serverName, safetyGuard = false) {
	let procs = ns.ps(serverName);
	return procs && procs.length ? ns.killall(serverName, safetyGuard) : true;
}

/** 
 * 	@param {NS} ns
 * 	@param {String} serverName
 * 	@param {ProcessInfo[]} procsInfo
 */
export function killProcesses(ns, serverName, procsInfo) {
	let ret = [];
	for (let proc of procsInfo) {
		ret.push(ns.kill(proc.filename, serverName, ...proc.args));
	}
	return ret;
}

/** @param {ProcessInfo[]} procsInfo
 * 	@param {String} fileName
 */
export function filterProcesses(procsInfo, fileName) {
	return procsInfo.filter(proc => proc.filename == fileName);
}