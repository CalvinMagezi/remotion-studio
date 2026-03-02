import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind";

Config.overrideWebpackConfig((config) => {
  return enableTailwind(config);
});

Config.setVideoImageFormat("jpeg");
Config.setOutputLocation("out");
Config.setPublicDir("./public");
