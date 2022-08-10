const MINING_STATES = {
	GROWING: "GROWING",//while server current money < 80% server max money
	WEAKENING: "WEAKENING",//while server current security > 50% server max security
	HACKING: "HACKING",//while server current money > 30% server max money && server current security < 80% max security
	DECISION: "DECISION" // calculate next step
};
/** @param {NS} ns */
export async function main(ns) {
	ns.enableLog("grow");
	ns.enableLog("weaken");
	ns.enableLog("hack");
	let hn;
	if (ns.args.length) {
		hn = ns.args[0];
	} else {
		ns.tprint(`Exiting ${ns.getScriptName()}. HostName must be passed as first arg`);
		return 0;
	}

	const minSecLvl = ns.getServerMinSecurityLevel(hn);
	const baseSecLvl = minSecLvl / (1 / 3);
	const srvMaxMoney = ns.getServerMaxMoney(hn);

	ns.print(`minSecLvl -> ${minSecLvl}`);
	ns.print(`baseSecLvl -> ${baseSecLvl}`);
	ns.print(`srvMaxMoney -> ${srvMaxMoney}`);

	let actionOptions = {
		stock: false
	}

	let state = MINING_STATES.DECISION;
	let growingCheck;
	let weakeningCheck;
	let hackingCheck;

	let currentMoney;
	let currentSecurity;
	let growthRate;


	while (true) {
		currentMoney = ns.getServerMoneyAvailable(hn);
		currentSecurity = ns.getServerSecurityLevel(hn);
		growthRate = ns.getServerGrowth(hn);

		growingCheck = currentMoney < srvMaxMoney * 0.9;
		weakeningCheck = currentSecurity > baseSecLvl * 0.5 || (growthRate < 15 && currentSecurity > minSecLvl + 1);
		hackingCheck = currentMoney > srvMaxMoney * 0.1 && currentSecurity < baseSecLvl * 0.8;

		ns.print(`hackingCheck -> ${hackingCheck}`);
		ns.print(`weakeningCheck -> ${weakeningCheck}`);
		ns.print(`growingCheck -> ${growingCheck}`);
		ns.print(`-----`);
		ns.print(`growthRate -> ${growthRate}`);
		ns.print(`SERVER MONEY -> ${calcPercent(currentMoney, srvMaxMoney)} %`);
		ns.print(`SERVER SECURITY -> ${calcPercent(currentSecurity, baseSecLvl)} %`);
		ns.print(`-----`);
		ns.print(`Current state -> ${state}`);

		switch (state) {
			case MINING_STATES.GROWING:
				if (growingCheck) {
					await ns.grow(hn, actionOptions);
				} else {
					state = MINING_STATES.DECISION;
				}
				break;
			case MINING_STATES.WEAKENING:
				if (weakeningCheck) {
					await ns.weaken(hn, actionOptions);
				} else {
					state = MINING_STATES.DECISION;
				}
				break;
			case MINING_STATES.HACKING:
				if (hackingCheck) {
					await ns.hack(hn, actionOptions);
				} else {
					state = MINING_STATES.DECISION;
				}
				break;
			case MINING_STATES.DECISION:
				state = hackingCheck ? MINING_STATES.HACKING : weakeningCheck ? MINING_STATES.WEAKENING : growingCheck ? MINING_STATES.GROWING : MINING_STATES.HACKING;
				break;

		}
		ns.print(`*************************`);
	}
}

function calcPercent(currentValue, totalValue) {
	return currentValue / totalValue * 100;
}