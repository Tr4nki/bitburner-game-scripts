const BASEURL = "https://raw.githubusercontent.com/Tr4nki/bitburner-game-scripts/";
const SCRIPTS = [
	"basic",
	"botnet",
	"constants",
	"contracts",
	"deleteRemoteFile",
	"deployScripts",
	"distributeFile",
	"fileManagement",
	"findRemoteFile",
	"growBot",
	"hackBot",
	"infiltration",
	"listRemoteFiles",
	"manageServers",
	"rush",
	"seeker",
	"testShare",
	"utils",
	"weakBot"
];
const EXTENSION = ".js";
const DEFAULT_BRANCH = "main";
/** @param {NS} ns */
export async function main(ns) {

	let flagData = ns.flags([]);
	let params = flagData._;
	let [branch] = params.length ? params : [DEFAULT_BRANCH];

	ns.tprint(branch);
	ns.enableLog("ALL");
	let results = [];

	let res;
	for (let script of SCRIPTS) {
		ns.tprint(`Downloading ${BASEURL + branch + "/" + script + EXTENSION}`);
		res = await ns.wget(BASEURL + branch + "/" + script + EXTENSION, script + EXTENSION);
		ns.tprint(`result -> ${res}`);
		results.push(res);
	}

	ns.tprint("Everything copied -> " + results.every(res => res));
}