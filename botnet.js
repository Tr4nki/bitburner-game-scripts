import { MINING_SERVERS, MINING_SCRIPTS, XPLOITS_FUNC, PORT_OPEN_ATTRIBUTES, DARK_WEB } from "constants.js";
import { isMinable, buildParamsForScript, canExecuteScripts, getAvailableXploits, crawlHosts } from "utils.js";
import { deployScriptsRemote, deployScriptsLocal } from "deployScripts.js"


const HOSTS_BLACK_LIST = [
	DARK_WEB
];
/** @param {NS} ns */
export async function main(ns) {

	await ns.sleep(5000);
	let hostName;
	let prevHost;
	let flagData = ns.flags([
		["deployMining", false],
		["dm", false],
		["runScripts", false],
		["rs", false]
	]);


	if (flagData._.length) {
		[hostName, prevHost] = flagData._;
	}



	hostName = hostName ? hostName : ns.getHostname();
	let nukedHosts = spreadBotnet(ns, hostName, prevHost);

	if (flagData.deployMining || flagData.dm) {
		let minableHostList = nukedHosts.filter(isMinable.bind(null, ns));
		let selfExecutionHostList = minableHostList.filter(canExecuteScripts.bind(null, ns));
		let remoteExecutionHostList = minableHostList.filter(host => !selfExecutionHostList.includes(host));
		let scriptsParamData = {
			"targetHosts": remoteExecutionHostList
		};
		let runAfter = flagData.runScripts || flagData.rs;
		let localExcutionParams = buildParamsForScript(ns, MINING_SCRIPTS, scriptsParamData);
		await deployScriptsLocal(ns, MINING_SCRIPTS, MINING_SERVERS, hostName, localExcutionParams, runAfter);
		await deployScriptsRemote(ns, MINING_SCRIPTS, selfExecutionHostList, hostName, runAfter);
		// ns.tprint(minableHostList);
	}

	/** IDEAS 
	 * # Array de ejecutables para abrir puertos
	 * 
	 * # Capturar scripts en ejecución con parametría
	 * # Parar scripts capturados en ejecución para la ejecución de este script
	 * # Scanear hosts adyacentes
	 * # Comprobar si se tiene el control
	 * # 	0	Comprobar host hackeables (hack lvl < player hacking lvl, no parent)
	 * # 		1	Comprobar puertos necesarios para hackear
	 * # 		1	Lanzar tantos ejecutables como sea necesario para abrir puertos
	 * # 		1	Tomar el control (nukear) (root access)
	 * # Distribuir scripts necesarios para repetir el proceso en el host de destino # DESCARTADO, EL SCRIPT CORRE EN 127.0.0.1
	 * # Distribuir scripts de mineo de $ en el host de destino
	 * # Ejecutar la version distribuida de este script en el host de destino
	 * # Relanzar scripts parados en el host actual al inicio de la ejecucion de este script
	 */
}


/**
 * @param {NS} ns
 * @param {String} hostName
 * @param {String} prevNode
*/
export function spreadBotnet(ns, baseHostName, prevHost) {
	let requiredHackingLevel;
	let nukedHosts = [];
	let playerHackingLevel = ns.getHackingLevel();;
	let availableXplotis = getAvailableXploits(ns);

	let crawledHosts = crawlHosts(ns, baseHostName, prevHost);

	for (let host of crawledHosts) {
		requiredHackingLevel = ns.getServerRequiredHackingLevel(host);
		if (playerHackingLevel >= requiredHackingLevel) {
			if (readyForNuke(ns, host, availableXplotis)) {
				ns.nuke(host);
				nukedHosts.push(host);
			}
		}
	}
	return nukedHosts;
}

/** 
 * @param {NS} ns
 * @param {String} node
*/
function readyForNuke(ns, node, availableXplotis) {
	let server;
	let requiredOpenPorts;
	let closedXploitable = [];
	let xploitable;

	server = ns.getServer(node);
	if (server.purchasedByPlayer || HOSTS_BLACK_LIST.includes(node))
		return false;

	requiredOpenPorts = server.numOpenPortsRequired;
	if (server.openPortCount >= requiredOpenPorts || requiredOpenPorts == 0) {
		return true;
	}

	for (let port in PORT_OPEN_ATTRIBUTES) {
		if (!server[PORT_OPEN_ATTRIBUTES[port]] && availableXplotis.includes(port)) {
			closedXploitable.push(port);
		}
	}
	xploitable = closedXploitable.length >= requiredOpenPorts;

	if (xploitable) {
		for (let i = 0; i < requiredOpenPorts; i++) { //Just open requierd amount of open ports for nuke
			ns[XPLOITS_FUNC[closedXploitable[i]]](node);
		}
	} else {
		ns.tprint(`Node ${node} is not xploitable due to lack of xploits, so it's skipped, buy more xploits and try again`);
	}
	return xploitable;
}