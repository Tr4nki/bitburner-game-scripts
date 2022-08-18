import { checkAccessCopyFiles, copyFilesToChildNodes } from "fileManagement.js"
/** @param {NS} ns */
export async function main(ns) {
	let fileName;
	let targetHost;
	let sourceHost;

	if (ns.args.length) {
		[fileName, targetHost, sourceHost = ns.getHostname()] = ns.args;
		if (!ns.fileExists(fileName, sourceHost)) {
			ns.tprint("Parameter 1 must be a valid filename and exist on source machine");
			return 0;
		}
	} else {
		ns.tprint("Parameter 1 must be a valid filename");
		return 0;
	}

	targetHost = targetHost == "_" ? null : targetHost;


	let copyResults;
	let fileArr = [fileName];
	let copied;

	try {
		if (targetHost) {
			copied = await checkAccessCopyFiles(ns, fileArr, targetHost, sourceHost);
			if (copied) {
				ns.tprint(`Succesfully copied ${fileArr} into ${targetHost}`);
			} else {
				ns.tprint(`Could not copy ${fileArr} into ${targetHost} `);
			}
		} else {
			copyResults = await copyFilesToChildNodes(ns, fileArr, ns.getHostname(), null, sourceHost)
			for (let host in copyResults) {
				for (let i = 0; i < fileArr.length; i++) {
					if (copyResults[host][i]) {
						ns.tprint(`Succesfully copied ${fileArr[i]} into ${host} `);
					} else {
						ns.tprint(`Could not copy ${fileArr[i]} into ${host} `);
					}
				}
			}
		}

	} catch (e) {
		ns.tprint(`Could not copy ${fileArr}.Error: ${e.message} `);
		ns.tprint(`StackTrace.Error: ${e.stack} `);
	}
}