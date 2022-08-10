import { ServerSnapshot, terminateProccesses } from "utils.js";
import { MANAGEMENT_SERVER_ACTIONS, BACKUP_SERVER } from "constants.js";
import { copyFiles, deleteFiles } from "fileManagement.js";
/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([
		["backup", false],
		["re", false]
	]);

	let [action, ...actionData] = flagData._;

	let ram;
	let serverName;
	switch (action) {
		case MANAGEMENT_SERVER_ACTIONS.PURCHASE:
			let newServer;
			[serverName, ram] = actionData;
			if (validRamAmmount(ram)) {
				newServer = ns.purchaseServer(serverName, ram);
				if (newServer == serverName) {
					ns.tprint(`Server succesfully created ${newServer} with ${ram} ammount of RAM`);
				} else {
					ns.tprint(`The Server was not created. Try again`);
				}
			} else {
				ns.tprint(`RAM ammount must be pow of 2`);
				return 0;
			}

			break;

		case MANAGEMENT_SERVER_ACTIONS.ESTIMATE:
			let cost;
			[ram] = actionData;
			if (validRamAmmount(ram)) {
				cost = ns.getPurchasedServerCost(ram);
				ns.tprint(`${ram} RAM Server would cost ${cost} `);
			} else {
				ns.tprint(`RAM ammount must be pow of 2`);
				return 0;
			}
			break;
		case MANAGEMENT_SERVER_ACTIONS.UPGRADE:
			[serverName, ram] = actionData;
			let serverMetadata = new ServerSnapshot(ns, serverName);
			ns.print(`serverMetadata -> ${serverMetadata}`);
			if (validRamAmmount(ram)) {
				try {
					ns.print(`>>> updateServer(ns, ${serverName}, ${ram}, ${flagData.backup}, ${flagData.re});`);
					await updateServer(ns, serverName, ram, flagData.backup, flagData.re);
				} catch (e) {
					ns.print(`Fail upgrading server Error -> ${e.message}`);
					ns.print(`stack -> ${e.stack}`);
					restorePreviousServer(ns, serverMetadata);
				}
			} else {
				ns.tprint(`RAM ammount must be pow of 2`);
			}
			break;
		case MANAGEMENT_SERVER_ACTIONS.DELETE:
			[serverName] = actionData;
			if (ns.serverExists(serverName)) {
				killServer(ns, serverName);
				ns.tprint(`Successfully deleted server ${serverName}`);
			} else {
				ns.tprint(`Specified server ${serverName} does not exist.`);
			}
			break;
	}

}

function validRamAmmount(ramAmmount) {
	return Number.isInteger(Math.log2(ramAmmount));
}

/** @param {NS} ns */
async function updateServer(ns, localServer, ram, preserveFiles, resumeExecution) {
	let runningProcess = resumeExecution ? ns.ps(localServer) : null;
	if (preserveFiles) {
		ns.print(`>>> await backupFiles(ns, ${localServer});`);
		if (!await backupFiles(ns, localServer)) {
			throw new Error(`Files could not be stored on back up server`);
		}
		ns.print(`>>> upgradeServer(ns, ${localServer}, ${ram});`);
		if (!upgradeServer(ns, localServer, ram)) {
			throw new Error(`Server could not be upgraded`);
		}
		ns.print(`>>> restoreFiles(ns, ${localServer});`);
		if (!await restoreFiles(ns, localServer)) {
			throw new Error(`Files could not be restored on origin server`);
		}
		ns.print(`>>> restoreRunningEnv(ns, ${localServer}, ${runningProcess})`);
		if (!restoreRunningEnv(ns, localServer, runningProcess)) {
			throw new Error(`Restoring running processes operation failed`);
		}
		ns.print(`>>> cleanWorkspace(ns)`);
		if (!cleanWorkspace(ns)) {
			ns.print(`Something went wrong cleaning workspace.`);
		}

	} else {
		if (!upgradeServer(ns, localServer, ram)) {
			throw new Error(`Server could not be upgraded`);
		}
	}
}

/** @param {NS} ns */
function buyServer(ns, serverName, ram) {
	return ns.purchaseServer(serverName, ram);
}

/** @param {NS} ns */
async function backupFiles(ns, targetServer) {
	let originFiles = ns.ls(targetServer);
	return buyServer(ns, BACKUP_SERVER, 2)
		&& (await copyFiles(ns, originFiles, BACKUP_SERVER, targetServer)).every(res => res);
}

/** @param {NS} ns */
function killServer(ns, serverName) {
	if (!ns.serverExists(serverName)) {
		return true;
	}

	return terminateProccesses(ns, serverName)
		&& deleteFiles(ns, ns.ls(serverName), serverName, false).every(el => el)
		&& ns.deleteServer(serverName);

}

/** @param {NS} ns */
function upgradeServer(ns, serverName, ram) {
	return killServer(ns, serverName) && buyServer(ns, serverName, ram);
}

/** @param {NS} ns */
async function restoreFiles(ns, targetServer) {
	let originFiles = ns.ls(BACKUP_SERVER);
	return (await copyFiles(ns, originFiles, targetServer, BACKUP_SERVER)).every(res => res);
}

/** @param {NS} ns */
/** @param {String} targetServer */
/** @param {ProcessInfo[]} runningProcess */
function restoreRunningEnv(ns, targetServer, runningProcess) {
	let ret = [];
	if (runningProcess && runningProcess.length) {
		for (let proc of runningProcess) {
			ret.push(ns.exec(proc.filename, targetServer, proc.threads, ...proc.args));
		}
		return ret.every(el => Number.isInteger(el));
	} else {
		return true;
	}
}

/** @param {NS} ns */
function restorePreviousServer(ns, serverInfo) {
	return restoreServer(ns, serverInfo) && cleanWorkspace(ns);
}
/** @param {NS} ns */
/** @param {ServerSnapshot} serverInfo */
function restoreServer(ns, serverInfo) {
	return killServer(ns, serverInfo.serverName)
		&& buyServer(ns, serverInfo.serverName, serverInfo.serverRam)
		&& undeleteFiles(ns, serverInfo.filesData)
		&& restoreRunningEnv(ns, serverInfo.serverName, serverInfo.runningProcesses);
}

/** @param {NS} ns */
/** @param {ServerSnapshot} serverInfo */
async function undeleteFiles(ns, serverInfo) {
	let ret = [];
	if (serverInfo && serverInfo.tempFilesMap) {
		for (let [fileName, data] of Object.entries(serverInfo.tempFilesMap)) {
			ret.push(await ns.write(fileName, data, "w"));
		}
	}
	return ret.every(res => res);
}

/** @param {NS} ns */
function cleanWorkspace(ns) {
	return killServer(ns, BACKUP_SERVER);
}