const BOT_COM_PORT = 3;
const RETRY_INTERVAL = 5000;
const MIN_BASE_SECURITY_LEVEL_RATIO = 1 / 3;
/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([]);
	let [targetHost, instanceThreads] = flagData._;

	if (!targetHost || !ns.serverExists(targetHost)) {
		ns.tprint(`First param must be a valid host name`);
		return 0;
	}

	while (keepWorking(ns, targetHost)) {
		await ns.grow(targetHost, { stock: false, threads: instanceThreads });
	}
	let sentMessage = false;

	do {
		await ns.sleep(5000);
		sentMessage = finishMessage(ns, targetHost);
	} while (!sentMessage);
}
/** @param {NS} ns */
function keepWorking(ns, targetHost) {
	return ns.getServerMoneyAvailable(targetHost) < ns.getServerMaxMoney(targetHost)
		&& ((ns.getServerGrowth(targetHost) <= 5 && calcCurrentSecurityRatio(ns, targetHost) < 1.5) || ns.getServerGrowth(targetHost) > 5);
}

function calcRatio(currentValue, totalValue) {
	return currentValue / totalValue;
}

/** @param {NS} ns */
function calcCurrentSecurityRatio(ns, hostName) {
	return calcRatio(ns.getServerSecurityLevel(hostName), calcBaseSecurityLevel(ns, hostName));
}

/** @param {NS} ns */
function calcBaseSecurityLevel(ns, hostName) {
	let minSecLvl = ns.getServerMinSecurityLevel(hostName);
	return minSecLvl == 1 ? minSecLvl : minSecLvl / MIN_BASE_SECURITY_LEVEL_RATIO;
}

/** @param {NS} ns */
function finishMessage(ns, nodeName) {
	let portHandler = ns.getPortHandle(BOT_COM_PORT);
	return true;
	// return portHandler.tryWrite(nodeName);
}