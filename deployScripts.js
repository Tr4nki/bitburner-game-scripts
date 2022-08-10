import { calcMaxThreadsForScript, calcMaxThreadsForInstances } from "utils.js";
import { copyFilesToHostList } from "fileManagement.js";


/** @param {NS} ns */
export default async function main(ns) {

	throw new Error("This script has no command line option, use it importing module in other script");
	/** TODO
	 * param scriptName
	 * X 1. get server list
	 * X 2. check root access
	 * X 3. check file exist
	 * X 4. remove it - unnecesary default ovewrites
	 * X 5. copy new file to remote host and check if succesful
	 * X 6. check script running -- unnecesary, scripts stops after script deletion
	 * X 7. kill running script -- unnecesary, scripts stops afeter script deletion
	 * X 8. check available RAM
	 * X 9. calculate needed RAM for one instance
	 * X 10. calculate max threads
	 * X 11. run script with adjusted threads
	 * 
	 */
}

/** @param {NS} ns */
export async function deployScriptsLocal(ns, files, targetHostList, sourceHost, paramsByScript, runAfter, execThreads) {
	let resultsByHost;
	targetHostList = targetHostList.filter(localHost => ns.serverExists(localHost));
	if (files.length && targetHostList.length) {
		resultsByHost = await copyFilesToHostList(ns, files, targetHostList, sourceHost);
		if (runAfter) {
			runAfterLocal(ns, files, resultsByHost, paramsByScript, execThreads);
		}
	}
}

/** @param {NS} ns */
function runAfterLocal(ns, scripts, resultsByHost, paramsByScript, execThreads) {
	for (let [localHost, copyResult] of Object.entries(resultsByHost)) {
		for (let i = 0; i < scripts.length; i++) {
			if (copyResult[i]) {

				execThreads = execThreads || calcMaxThreadsForScript(ns, scripts[i], localHost);
				execThreads = calcMaxThreadsForInstances(execThreads, paramsByScript[scripts[i]].length);
				for (let params of paramsByScript[scripts[i]]) {
					runScript(ns, scripts[i], localHost, execThreads, params);
				}
			}
		}
		execThreads = 0;
	}
}

/** @param {NS} ns */
export async function deployScriptsRemote(ns, files, targetHostList, sourceHost, runAfter) {
	let resultsByHost;
	if (files.length && targetHostList.length) {
		resultsByHost = await copyFilesToHostList(ns, files, targetHostList, sourceHost);
		if (runAfter) {
			runAfterRemote(ns, files, resultsByHost);
		}
	}
}
/** @param {NS} ns */
export function runScript(ns, file, runningHost, execThreads, args) {
	execThreads = execThreads || calcMaxThreadsForScript(ns, file, runningHost);
	if (execThreads > 0) {
		ns.exec(file, runningHost, execThreads, ...args);
	}
}

function runAfterRemote(ns, files, resultsByHost) {
	for (let [remoteHost, result] of Object.entries(resultsByHost)) {
		for (let i = 0; i < files.length; i++) {
			if (result[i]) {
				runScript(ns, files[i], remoteHost, null, [remoteHost]);
			}
		}
	}
}