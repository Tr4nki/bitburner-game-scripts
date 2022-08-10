export default 0;
export const LOCALHOST = "home";
export const BACKUP_SERVER = "backupServer";
export const THREADS_LOCAL_MINING = 16;
export const MIN_SECURITY_LEVEL = 1;
export const MIN_BASE_SECURITY_LEVEL_RATIO = 1 / 3;

export const RUSH_BOTS = {
	HACK: "hackBot.js",
	WEAK: "weakBot.js",
	GROW: "growBot.js"
};
export const MANAGEMENT_SERVER_ACTIONS = {
	PURCHASE: "purchase",
	DELETE: "delete",
	ESTIMATE: "estimate",
	UPGRADE: "upgrade"
};
export const XPLOITS_LIST = [
	"SSH",
	"FTP",
	"HTTP",
	"SMTP",
	"SQL"
];
export const EXECUTABLES = {
	SSH: "BruteSSH.exe",
	FTP: "FTPCrack.exe",
	HTTP: "HTTPWorm.exe",
	SMTP: "relaySMTP.exe",
	SQL: "SQLInject.exe"
	// NUKE: "NUKE",
};
export const PORT_OPEN_ATTRIBUTES = {
	SSH: "sshPortOpen",
	FTP: "ftpPortOpen",
	HTTP: "httpPortOpen",
	SMTP: "smtpPortOpen",
	SQL: "sqlPortOpen"
};
export const XPLOITS_FUNC = {
	SSH: "brutessh",
	FTP: "ftpcrack",
	HTTP: "httpworm",
	SMTP: "relaysmtp",
	SQL: "sqlinject"
};
export const MINING_SERVERS = [
	"bacterio",
	"mortadelo",
	"ofelia"
];
export const SUPPORT_SERVERS = [
	"sona",
	"soraka",
	"nami",
	"home"
];
export const MINING_STATES = {
	GROWING: "GROWING",//while server current money < 80% server max money
	WEAKENING: "WEAKENING",//while server current security > 50% server max security
	HACKING: "HACKING",//while server current money > 30% server max money && server current security < 80% max security
	DECISION: "DECISION" // calculate next step
};
export const CONTRACT_ACTIONS = {
	SOLVE: "solve",
	READ: "read"
};
export const MINING_SCRIPTS = [
	"basic.js"
];
export const FILES_SCRIPTS = [
	"distributeFile.js",
	"findRemoteFile.js",
	"listRemoteFiles.js",
	"deleteRemoteFile.js",
	"fileManagement.js"
];
export const SPREADING_SCRIPTS = [
	"deployScripts.js",
	"botnet.js"
];
export const CONTRACT_SCRIPTS = [
	"contracts.js"
];
export const UTIL_SCRIPTS = [
	"constants.js",
	"utils.js",

];
export const ALL_SCRIPTS = [...MINING_SCRIPTS, ...FILES_SCRIPTS, ...SPREADING_SCRIPTS, ...CONTRACT_SCRIPTS, ...UTIL_SCRIPTS];

export const CONTRACT_TYPES = {
	LARGEST_PRIME_FACTOR: "Find Largest Prime Factor",
	SUB_ARR_MAX_SUM: "Subarray with Maximum Sum",
	TOTAL_WAYS_TO_SUM: "Total Ways to Sum",
	TOTAL_WAYS_TO_SUM2: "Total Ways to Sum II",
	SPIRALIZE_MATRIX: "Spiralize Matrix",
	ARRAY_JUMPING: "Array Jumping Game",
	ARRAY_JUMPING2: "Array Jumping Game II",
	MERGE_INTERVALS: "Merge Overlapping Intervals",
	GENERATE_IP: "Generate IP Addresses",
	ALGOR_STOCK_TRADER1: "Algorithmic Stock Trader I",
	ALGOR_STOCK_TRADER2: "Algorithmic Stock Trader II",
	ALGOR_STOCK_TRADER3: "Algorithmic Stock Trader III",
	ALGOR_STOCK_TRADER4: "Algorithmic Stock Trader IV",
	MIN_SUM_PATH_TRIANGLE: "Minimum Path Sum in a Triangle",
	UNIQUE_PATH_GRID1: "Unique Paths in a Grid I",
	UNIQUE_PATH_GRID2: "Unique Paths in a Grid II",
	SHORTEST_PATH_GRID: "Shortest Path in a Grid",
	SANITIZE_PARENTHESES: "Sanitize Parentheses in Expression",
	FIND_VALID_MATH_EXPR: "Find All Valid Math Expressions",
	HAMMING_INT_TO_BIN: "HammingCodes: Integer to Encoded Binary",
	HAMMING_BIN_TO_INT: "HammingCodes: Encoded Binary to Integer",
	COLORING_GRAPH: "Proper 2-Coloring of a Graph",
	COMPRESSION_RLE_COMPRESSION: "Compression I: RLE Compression",
	COMPRESSION_LZ_DECOMPRESSION: "Compression II: LZ Decompression",
	COMPRESSION_LZ_COMPRESSION: "Compression III: LZ Compression"
};