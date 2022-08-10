/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([]);
	let [targetHost, instanceThreads = 1] = flagData._;

	if (!targetHost || !ns.serverExists(targetHost)) {
		ns.tprint(`First param must be a valid host name`);
	}

	while (keepWorking(ns, targetHost)) {
		await ns.hack(targetHost, { stock: false, threads: instanceThreads });
	}
}


/** @param {NS} ns */
function keepWorking(ns, targetHost) {
	return ns.getServerMoneyAvailable(targetHost) > 0;
}