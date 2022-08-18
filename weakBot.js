/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([]);
	let [targetHost, instanceThreads] = flagData._;

	if (!targetHost || !ns.serverExists(targetHost)) {
		ns.tprint(`First param must be a valid host name`);
	}

	while (keepWorking(ns, targetHost)) {
		await ns.weaken(targetHost, { stock: false, threads: instanceThreads });
	}
}

function getMinuteMillis(minutes) {
	return minutes * 60 * 1000;
}

/** @param {NS} ns */
function keepWorking(ns, targetHost) {
	return ns.getServerSecurityLevel(targetHost) > ns.getServerMinSecurityLevel(targetHost);
	// && ns.getWeakenTime(targetHost) < getMinuteMillis(30);
}