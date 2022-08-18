import { getMinuteMillis } from "utils.js";
/** @param {NS} ns */
export async function main(ns) {


	while (true) {
		ns.exec("botnet.js", "home", 1, "--dm", "--rs");


		await ns.sleep(getMinuteMillis(ns, 30));
	}
}