/** @param {NS} ns */
export async function main(ns) {
	let hostName;
	let grep;
	let files;
	let hosts;

	if (ns.args.length) {
		[hostName, grep] = ns.args;
	} else {
		ns.tprint("All files for all adyacent nodes will be listed");
	}

	if (hostName) {
		if (!ns.serverExists(hostName)) {
			ns.tprint(`Host "${hostName}" does not exist or could not connect directly`);
			return 0;
		}

		files = ns.ls(hostName, grep);
		ns.tprint(`HOST ${hostName}`);
		files.forEach(function(val){
			ns.tprint(`--- ${val}`);
		});
	} else {
		hosts = ns.scan();
		for (let hn of hosts) {
			files = ns.ls(hn, grep);
			ns.tprint(`HOST ${hn}`);
			files.forEach(function(val){
				ns.tprint(`--- ${val}`);
			});
		}
	}
}