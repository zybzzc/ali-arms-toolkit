import path from "path";
import { globFiles } from "./utils";
import { uploadFile } from "./upload";
import type { ArmsConfig } from "./types";
import colors from "picocolors";

type ResolvedConfig = any // https://vitejs.dev/config/

export interface PluginOptions {
  enable?: boolean | ((config: ResolvedConfig) => boolean);
  armsConfig: ArmsConfig;
}

export default function arms(options: PluginOptions) {
  let config: ResolvedConfig;

  return {
    name: "arms",

    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },

    async closeBundle() {
      let enable = options.enable;
      if (typeof enable === "function") {
        enable = enable(config);
      }

      if (!enable) {
        return
      }

      const { root } = config;
      const { outDir, assetsDir } = config.build;

      const files = await globFiles(
        path.resolve(root, outDir, assetsDir, "*.map")
      );
      const tasks: (() => Promise<unknown>)[] = files.map((file) => {
        return () => {
          console.log(
            "[arms] Uploading file:",
            colors.gray(colors.white(colors.dim(outDir + "/"))) +
              colors.gray(path.relative(path.resolve(root, outDir), file))
          );
          return uploadFile(file, options.armsConfig);
        };
      });

      console.log("[arms] Uploaded sourcemaps to Aliyun OSS...");
      await Promise.all(tasks.map((task) => task()));
      console.log("[arms] All sourcemaps uploaded.");
    },
  };
}
