import { calcThreadsForMaxMoney, calcThreadsForMinSec, calcCurrentSecurityRatio, calcBaseSecurityLevel } from "utils.js"

/** @param {NS} ns */
export async function main(ns) {

	ns.tprint(`========================================================================================`);
	let [hostName, cores = 1] = ns.args;

	/* @@@@@@@@@@@@@@@@@   SECURITY RELATED   @@@@@@@@@@@@@@@@@ */
	let secRatio = calcCurrentSecurityRatio(ns, hostName);
	let secLvl = ns.getServerSecurityLevel(hostName);
	let minSec = ns.getServerMinSecurityLevel(hostName);
	let baseSec = calcBaseSecurityLevel(ns, hostName);

	let reqThreads = calcThreadsForMinSec(ns, hostName, cores);


	ns.tprint(`${hostName} security ratio ->  ${secRatio}`);
	ns.tprint(`${hostName} current security lvl ->  ${secLvl}`);
	ns.tprint(`${hostName} min security lvl ->  ${minSec}`);
	ns.tprint(`${hostName} base security lvl ->  ${baseSec}`);
	ns.tprint(`each thread lowers server security by -> ${ns.weakenAnalyze(1, cores)}`);

	ns.tprint(`threads required to lower server ${hostName} from ${secLvl} to ${minSec} are -> ${reqThreads}`);

	/* @@@@@@@@@@@@@@@@@   SECURITY RELATED   @@@@@@@@@@@@@@@@@ */


	ns.tprint(`+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++`);

	/* @@@@@@@@@@@@@@@@@   MONEY RELATED   @@@@@@@@@@@@@@@@@ */

	let currMoney = ns.getServerMoneyAvailable(hostName);
	let maxMoney = ns.getServerMaxMoney(hostName);

	let desiredGrow = maxMoney - currMoney;
	let incrRatio = desiredGrow / currMoney;
	if (incrRatio < 1) {
		incrRatio += 1;
	}


	ns.tprint(`${hostName} current money ->  ${formatNumber(ns, currMoney)}`);
	ns.tprint(`${hostName} max money ->  ${formatNumber(ns, maxMoney)}`);
	ns.tprint(`${hostName} money difference ->  ${formatNumber(ns, desiredGrow)}`);
	ns.tprint(`${hostName} incrRatio ->  ${formatNumber(ns, incrRatio)}`);


	ns.tprint(`threads needed to grow server by ${formatNumber(ns, desiredGrow)} -> ${ns.growthAnalyze(hostName, incrRatio, cores)}`);


	ns.tprint(`Custom calculation for same operation ->  ${calcThreadsForMaxMoney(ns, hostName, cores)}`);


	/* @@@@@@@@@@@@@@@@@   MONEY RELATED   @@@@@@@@@@@@@@@@@ */

	// ns.tprint(` t1 c1 -> ${ns.weakenAnalyze(1,1)}`);
	// ns.tprint(` t1 c2 -> ${ns.weakenAnalyze(1,2)}`);
	// ns.tprint(` t1 c3 -> ${ns.weakenAnalyze(1,3)}`);
	// ns.tprint(` t1 c4 -> ${ns.weakenAnalyze(1,4)}`);
	// ns.tprint(` t2 c1 -> ${ns.weakenAnalyze(2,1)}`);
	// ns.tprint(` t2 c2 -> ${ns.weakenAnalyze(2,2)}`);
	// ns.tprint(` t2 c3 -> ${ns.weakenAnalyze(2,3)}`);
	// ns.tprint(` t2 c4 -> ${ns.weakenAnalyze(2,4)}`);
	// ns.tprint(` t3 c1 -> ${ns.weakenAnalyze(3,1)}`);
	// ns.tprint(` t3 c2 -> ${ns.weakenAnalyze(3,2)}`);
	// ns.tprint(` t3 c3 -> ${ns.weakenAnalyze(3,3)}`);
	// ns.tprint(` t3 c4 -> ${ns.weakenAnalyze(3,4)}`);


	// ns.tprint(`relation between 2 and 2 threads with same cores`);
	// ns.tprint(ns.weakenAnalyze(2, 2) / ns.weakenAnalyze(1, 2));
}

function formatNumber(ns, number) {
	return ns.nFormat(number, "0,0.00");
}