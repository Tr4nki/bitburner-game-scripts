const MIN_BASE_SECURITY_LEVEL_RATIO = 1 / 3;
/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([]);
	let [targetHost, instanceThreads = 1] = flagData._;

	if (!targetHost || !ns.serverExists(targetHost)) {
		ns.tprint(`First param must be a valid host name`);
	}

	while (keepWorking(ns, targetHost)) {
		await ns.grow(targetHost, { stock: false, threads: instanceThreads });
	}
}
/** @param {NS} ns */
function keepWorking(ns, targetHost) {
	return ns.getServerMoneyAvailable(targetHost) < ns.getServerMaxMoney(targetHost)
		&& ((ns.getServerGrowth(targetHost) <= 5 && calcCurrentSecurityRatio(ns, targetHost) < 1.5) || ns.getServerGrowth(targetHost) > 5);
}

export function calcRatio(currentValue, totalValue) {
	return currentValue / totalValue;
}

/** @param {NS} ns */
export function calcCurrentSecurityRatio(ns, hostName) {
	return calcRatio(ns.getServerSecurityLevel(hostName), calcBaseSecurityLevel(ns, hostName));
}

/** @param {NS} ns */
export function calcBaseSecurityLevel(ns, hostName) {
	let minSecLvl = ns.getServerMinSecurityLevel(hostName);
	return minSecLvl == 1 ? minSecLvl : minSecLvl / MIN_BASE_SECURITY_LEVEL_RATIO;
}