import { printObjectProperties } from "utils.js";
/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([]);
	let params = flagData._;
	let [cityFilter] = params;

	let infilApi = ns.infiltration;
	let possibleLocations = infilApi.getPossibleLocations();
	let infLocation;

	for (let location of possibleLocations) {
		infLocation = infilApi.getInfiltration(location);
		if (cityFilter && infLocation.location.city == cityFilter) {
			ns.tprint(`++++++++++++++++++    ${location}    ++++++++++++++++++`);
			printObjectProperties(ns, infLocation);
			ns.tprint("\n");
		}
	}
}