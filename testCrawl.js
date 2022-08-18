import { crawlHosts } from "utils.js";
/** @param {NS} ns */
export async function main(ns) {


	// let hosts = crawlHosts(ns, ns.getHostname());
	// ns.tprint(hosts);

	setInterval(function(){
		ns.tprint("heellooo");
	},5000);
}