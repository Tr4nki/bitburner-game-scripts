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
		if (ns.fileExists(fileName, hostName)) {
			ns.tprint(`File "${fileName}" found on host ${hostName}`);
		} else {
			ns.tprint(`File "${fileName}" NOT found on host ${hostName}`);
		}
	} else {
		hosts = ns.scan();
		for (let hn of hosts) {
			if (ns.fileExists(fileName, hn)) {
				ns.tprint(`File "${fileName}" found on host ${hn}`);
			}
		}
	}
}