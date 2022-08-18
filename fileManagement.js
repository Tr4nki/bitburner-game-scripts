import { getAdjacentNodes, log } from "utils.js";
import { LOCALHOST } from "constants.js";
/** @param {NS} ns */
export default async function main(ns) {

}

/**
 * @param {NS} ns
 * @param {String} fileName File to be copied
 * @param {String} targetHost Host where file will be copied over
 * @param {String} sourceHost Host that stores the file to be copied, it's "home" by default
 */
async function copyFile(ns, fileName, targetHost, sourceHost = LOCALHOST) {
	if (ns.fileExists(fileName, targetHost)) {
		if (ns.scriptRunning(fileName, targetHost)) {
			ns.scriptKill(fileName, targetHost);
		}
		if (targetHost == LOCALHOST)
			return true;
		ns.rm(fileName, targetHost);
	}
	
	return await ns.scp(fileName, sourceHost, targetHost);
}

/**
 * @param {NS} ns
 * @param {Array} files Files to be copied
 * @param {String} targetHost Host where file will be copied over
 * @param {String} sourceHost Host that stores the file to be copied, it's "home" by default
 */
export async function copyFiles(ns, files, targetHost, sourceHost) {
	let ret = [];

	for (let file of files) {
		ret.push(await copyFile(ns, file, targetHost, sourceHost));
	}
	return ret;
}

/**
 * @param {NS} ns
 * @param {Array} files Files to be copied
 * @param {String} targetHost Host where file will be copied over
 * @param {String} sourceHost Host that stores the file to be copied, it's "home" by default
 */
export async function checkAccessCopyFiles(ns, files, targetHost, sourceHost) {
	let ret;
	if (ns.hasRootAccess(targetHost)) {
		ret = await copyFiles(ns, files, targetHost, sourceHost);
	} else {
		ret = new Array(files.length).fill(false);
		log(ns, `You dont have access rights to the specified host ${targetHost}`);
	}
	return ret;
}
/**
 * @param {NS} ns
 * @param {Array} files Files to be copied
 * @param {String} targetHost Selected host whose child nodes the files will be copied to
 * @param {String} parentNode Parent node of the target host
 * @param {String} sourceHost Host that stores the file to be copied, it's "home" by default
 */
export async function copyFilesToChildNodes(ns, files, targetHost, parentNode, sourceHost) {
	let childNodes = getAdjacentNodes(ns, targetHost, parentNode);
	return await copyFilesToHostList(ns, files, childNodes, sourceHost);
}
/**
 * @param {NS} ns
 * @param {Array} files Files to be copied
 * @param {Array} hostList The list of hosts where the files wille be copied to
 * @param {String} sourceHost Host that stores the file to be copied, it's "home" by default
 */
export async function copyFilesToHostList(ns, files, hostList, sourceHost) {
	var ret = {};
	for (let hostName of hostList) {
		ret[hostName] = await checkAccessCopyFiles(ns, files, hostName, sourceHost);
	}
	return ret;
}

/**
 * @param {NS} ns
 * @param {Array} files Files to be copied
 * @param {String} currentNode Host where file will be copied over
 * @param {String} parentNode Self explained
 * @param {String} sourceHost Host that stores the file to be copied, it's "home" by default
 */
export async function recursiveCopyFiles(ns, files, currentNode, parentNode, sourceHost) {
	await checkAccessCopyFiles(ns, files, currentNode, sourceHost);
	for (let adjNode of getAdjacentNodes(ns, currentNode, parentNode)) {
		await recursiveCopyFiles(ns, files, adjNode, currentNode, sourceHost);
	}
}

/**
 * @param {NS} ns
 * @param {Array} files Files to be copied
 * @param {String} targetHost Host where files will be removed from
 * @param {Boolean} checkExist check if fileExist is required
 */
function deleteFile(ns, file, targetHost, checkExist) {
	if (checkExist) {
		return safeDeleteFile(ns, file, targetHost);
	} else {
		return ns.rm(file, targetHost);
	}
}
/**
 * @param {NS} ns
 * @param {Array} files Files to be copied
 * @param {String} targetHost Host where files will be removed from
 * @param {Boolean} checkExist check if fileExist is required
 */
function safeDeleteFile(ns, file, targetHost) {
	return ns.fileExists(file, targetHost) ? ns.rm(file, targetHost) : true;
}


/**
 * @param {NS} ns
 * @param {Array} files Files to be copied
 * @param {String} targetHost Host where files will be removed from
 * @param {Boolean} checkExist check if fileExist is required
 */
export function deleteFiles(ns, files, targetHost, checkExist) {
	let ret = [];
	for (let file of files) {
		ret.push(deleteFile(ns, file, targetHost, checkExist));
	}
	return ret;
}