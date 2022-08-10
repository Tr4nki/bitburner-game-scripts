import { CONTRACT_TYPES, CONTRACT_ACTIONS } from "constants.js"

/** @param {NS} ns */
export async function main(ns) {

	let action;
	let contractRoute;
	if (ns.args.length == 3) {
		[action, ...contractRoute] = ns.args;
	} else {
		ns.tprint("Parameter 1 must be a valid action (solve, read).");
		ns.tprint("Parameter 2 must be a valid host.");
		ns.tprint("Parameter 3 must be a valid contract file.");
		return 0;
	}


	ns.tprint(`action -> ${action}`);
	ns.tprint(`contractRoute -> ${contractRoute}`);

	switch (action) {
		case CONTRACT_ACTIONS.SOLVE:
			solveContract(ns, ...contractRoute);
			break;
		case CONTRACT_ACTIONS.READ:
			readContract(ns, ...contractRoute);
			break;
		default:
			break;
	}
}

/** @param {NS} ns */
function readContract(ns, hostName, fileName) {
	let codContrApi = ns.codingcontract;
	let contractType = codContrApi.getContractType(fileName, hostName);
	let data = codContrApi.getData(fileName, hostName);
	let description = codContrApi.getDescription(fileName, hostName);



	ns.tprint(`contractType -> ${contractType}`);
	ns.tprint(`description -> ${description}`);
	ns.tprint(`Contract data -> ${data}`);
	ns.tprint(`Data type -> ${typeof data}`);
	ns.tprint(`array? ${data instanceof Array}`);
	ns.tprint(`number? ${data instanceof Number}`);
	ns.tprint(`date? ${data instanceof Date}`);
	ns.tprint(`string? ${data instanceof String}`);


}

/** @param {NS} ns */
function solveContract(ns, hostName, fileName) {
	let rewardString;
	let answer;

	let codContrApi = ns.codingcontract;
	let contractType = codContrApi.getContractType(fileName, hostName);
	let data = codContrApi.getData(fileName, hostName);


	try {
		switch (contractType) {
			case CONTRACT_TYPES.LARGEST_PRIME_FACTOR:
				break;
			case CONTRACT_TYPES.SUB_ARR_MAX_SUM:
				answer = subArrMaxSum(data); // toString -  usual requirement of contract
				break;
			case CONTRACT_TYPES.TOTAL_WAYS_TO_SUM:
				break;
			case CONTRACT_TYPES.TOTAL_WAYS_TO_SUM2:
				break;
			case CONTRACT_TYPES.SPIRALIZE_MATRIX:
				break;
			case CONTRACT_TYPES.ARRAY_JUMPING:
				break;
			case CONTRACT_TYPES.ARRAY_JUMPING2:
				break;
			case CONTRACT_TYPES.MERGE_INTERVALS:
				break;
			case CONTRACT_TYPES.GENERATE_IP:
				break;
			case CONTRACT_TYPES.ALGOR_STOCK_TRADER1:
				answer = stockTrader1(data);
				break;
			case CONTRACT_TYPES.ALGOR_STOCK_TRADER2:
				//input data -> array
				answer = stockTrader2(data);
				break;
			case CONTRACT_TYPES.ALGOR_STOCK_TRADER3:
				break;
			case CONTRACT_TYPES.ALGOR_STOCK_TRADER4:
				break;
			case CONTRACT_TYPES.MIN_SUM_PATH_TRIANGLE:
				break;
			case CONTRACT_TYPES.UNIQUE_PATH_GRID1:
				answer = uniquePathGrid1(data);
				break;
			case CONTRACT_TYPES.UNIQUE_PATH_GRID2:
				break;
			case CONTRACT_TYPES.SHORTEST_PATH_GRID:
				break;
			case CONTRACT_TYPES.SANITIZE_PARENTHESES:
				break;
			case CONTRACT_TYPES.FIND_VALID_MATH_EXPR:
				break;
			case CONTRACT_TYPES.HAMMING_INT_TO_BIN:
				break;
			case CONTRACT_TYPES.HAMMING_BIN_TO_INT:
				answer = hammingBinToInt(data).toString(); // toString -  usual requirement of contract
				break;
			case CONTRACT_TYPES.COLORING_GRAPH:
				break;
			case CONTRACT_TYPES.COMPRESSION_RLE_COMPRESSION:
				break;
			case CONTRACT_TYPES.COMPRESSION_LZ_DECOMPRESSION:
				break;
			case CONTRACT_TYPES.COMPRESSION_LZ_COMPRESSION:
				break;
			default:
				break;
		}
	} catch (e) {
		ns.tprint(`Error solving contract ${fileName} on host ${hostName} : ${e.message}`);
	}
	if (answer) {
		rewardString = codContrApi.attempt(answer, fileName, hostName, { returnReward: true });
		if (rewardString) {
			ns.tprint(`Succesfully solved contract, gain ${rewardString}`);
		} else {
			ns.tprint(`Attempt failed ${codContrApi.getNumTriesRemaining(fileName, hostName)} tries left`);
		}

	}

}

//NOT TESTED WITH REAL ERROR ON BITES SECUENCE
function hammingBinToInt(bitsStr) {
	let rawBitsArr = [];
	let dataBitsArr;
	let dataBitsStr
	let ret;

	for (let b of bitsStr) {
		rawBitsArr.push(Number.parseInt(b));
	}
	dataBitsArr = rawBitsArr.filter(function (el, idx) {
		return idx != 0 && !Number.isInteger(Math.log2(idx));
	});

	dataBitsStr = dataBitsArr.join("");
	ret = Number.parseInt(dataBitsStr, 2);
	return ret ? ret : null;
}

function subArrMaxSum(inputArr) {
	var max = 0;
	inputArr.forEach(function (el, idx) {
		for (let i = idx; i < inputArr.length; i++) {
			max = Math.max(max, inputArr.slice(idx, i).reduce((total, nextEl) => total + nextEl));
		}
	});
	return max;
}

function stockTrader1(inputArr) {
	let min = inputArr[0];
	let minPos;
	let max = 0;

	for (let i = 0; i < inputArr.length; i++) {
		minPos = inputArr[i] < min ? i : minPos;
		min = inputArr[i] < min ? inputArr[i] : min;
	}
	for (let n of inputArr.slice(minPos)) {
		max = n > max ? n : max;
	}
	return max - min;
}

function stockTrader2(inputArr) {
	let proffit = 0;
	let onTransaction = false;

	for (let i = 0; i < inputArr.length; i++) {
		if (onTransaction) {
			proffit += inputArr[i];
			onTransaction = false;
		}
		if (i + 1 == inputArr.length) {
			continue;
		}
		if (inputArr[i] < inputArr[i + 1]) {
			proffit -= inputArr[i];
			onTransaction = true;
		}
	}
	return proffit;
}

//extracted from https://github.com/danielyxie/bitburner/blob/5d2b81053d762111adb094849bf2d09f596b2157/src/data/codingcontracttypes.ts
function uniquePathGrid1([rows, cols]) {
	var res = [];
	for (let i = 0; i < rows; i++) {
		res[i] = 1;
	}
	for (let row = 1; row < cols; row++) {
		for (let i = 1; i < rows; i++) {
			res[i] += res[i - 1];
		}
	}
	return res[rows - 1];
}