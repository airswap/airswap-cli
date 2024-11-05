import type { Hook } from "@oclif/core";
import available from "available-versions";
import chalk from "chalk";
import { compareVersions } from "compare-versions";
import * as emoji from "node-emoji";
import { table } from "table";

const hook: Hook<"init"> = async (options) => {
	console.log(
		chalk.gray.bold(
			`AirSwap CLI ${options.config.version} — https://www.airswap.io/`,
		),
	);
	const query = {
		name: "airswap",
	};
	const result = await available(query);
	if (
		compareVersions(options.config.version, result["dist-tags"].latest) === -1
	) {
		console.log();
		const data = [
			[
				`${emoji.get("package")} ${chalk.bold.green("New version available")} (${
					result["dist-tags"].latest
				}) Update with ${chalk.bold("yarn global upgrade airswap")}`,
			],
		];
		console.log(table(data, {}));
	}
};

export default hook;
