import { getAdjacentNodes } from "utils.js";
/** @param {NS} ns */
export async function main(ns) {

	discoverHosts(ns, ns.getHostname(), undefined, displayFiles);

}
/** @param {NS} ns */
function discoverHosts(ns, baseHost, prevHost, fn, level = 1) {

	let adjacentNodes = getAdjacentNodes(ns, baseHost, prevHost);

	for (let host of adjacentNodes) {
		ns.tprint(`${"-".repeat(level * 2)}> ${host}`);
		fn(ns, host, baseHost, level);
		discoverHosts(ns, host, baseHost, fn, level + 1);
	}
}

/** @param {NS} ns */
function displayFiles(ns, host, prevHost, level) {
	let files = ns.ls(host);
	for (let file of files) {
		ns.tprint(`${" ".repeat((level + 1) * 2)} ${file} `)
	}
}