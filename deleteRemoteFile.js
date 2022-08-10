/** @param {NS} ns */
export async function main(ns) {
	let fileName;
	let hostName;
	let hosts;

	if (ns.args.length) {
		[fileName, hostName] = ns.args;
	} else {
		ns.tprint("Parameter 1 must be a valid filename.");
		return 0;
	}

	if (hostName) {
		if (!ns.serverExists(hostName)) {
			ns.tprint(`Host "${hostName}" does not exist or could not connect directly`);
			return 0;
		}
		if (ns.hasRootAccess(hostName)) {
			deleteFilePrintResult(ns, fileName, hostName);
		}
	} else {
		hosts = ns.scan();
		for (let hn of hosts) {
			if (ns.hasRootAccess(hn)) {
				deleteFilePrintResult(ns, fileName, hn);
			}
		}
	}
}

function safeDeleteFile(ns, fileName, hostName) {
	if (ns.fileExists(fileName, hostName)) {
		return ns.rm(fileName, hostName);
	} else {
		throw new Error(`File ${fileName} does not exist on ${hostName}`);
	}
}

function deleteFilePrintResult(ns, fileName, hostName) {
	let deleted;
	try {
		deleted = safeDeleteFile(ns, fileName, hostName);
		if (deleted) {
			ns.tprint(`Succesfully deleted ${fileName} file on ${hostName}`);
		} else {
			ns.tprint(`Could not delete ${fileName} file on ${hostName}`);
		}
	} catch (e) {
		ns.tprint(e.message);
		return false;
	}
	return deleted;
}