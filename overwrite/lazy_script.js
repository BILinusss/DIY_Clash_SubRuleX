/***
 * Clash Verge Rev / Mihomo Party 覆写脚本（懒人配置）
 * 由 lazy_yaml.yaml 转换并遵循规范重构
 */

// ==============================================================================
// 1. 分流规则开关配置 (true = 启用，false = 禁用)
// 设置原则：按需开启，不需要的关闭，提高匹配效率
// ==============================================================================
const ruleOptions = {
  adblock: true,          // 🛑 广告拦截
  ai: true,           // 🤖 AI 服务
  gemini: true,       // ✨ Gemini
  youtube: true,      // 📹 油管视频
  google: true,       // 🔍 谷歌服务
  microsoft: true,    // Ⓜ️ 微软服务
  apple: true,        // 🍏 苹果服务
  telegram: true,     // 📲 电报消息
  twitter: true,      // 🐦 推特/X
  meta: true,         // 📘 Meta 系
  netflix: true,      // 🎬 奈飞
  steam: true,        // 🎮 Steam
  code: true,         // 🐱 代码托管
  cloud: true,        // ☁️ 云服务
  devtools: true,     // 🛠️ 开发工具
  private: true,      // 🏠 私有网络
  cn: true,           // 🔒 国内服务
  foreign: true,      // 🌍 非中国
};

// ==============================================================================
// 2. 高级参数配置 (预留扩展入口，按需修改)
// ==============================================================================
const advancedOptions = {
  overrideSniffer: false, // 是否覆写域名嗅探配置 (建议常开，查日志方便)
};

// ==============================================================================
// 3. 地区策略组及其正则表达式 (完全保留 lazy_yaml 原规则)
// ==============================================================================
const regionDefinitions = [
  { name: "🇭🇰 香港节点", filter: "(?i)香港|\\bHong Kong\\b|\\bHK\\b" },
  { name: "🇨🇳 台湾节点", filter: "(?i)台湾|\\bTaiwan\\b|\\bTW\\b" },
  { name: "🇯🇵 日本节点", filter: "(?i)日本|\\bJapan\\b|\\bJP\\b" },
  { name: "🇺🇸 美国节点", filter: "(?i)美国|\\bUnited States\\b|\\bUS\\b" },
  { name: "🇸🇬 新加坡节点", filter: "(?i)新加坡|\\bSingapore\\b|\\bSG\\b" },
  { name: "🇰🇷 韩国节点", filter: "(?i)韩国|\\bKorea\\b|\\bKR\\b" },
  { name: "🇬🇧 英国节点", filter: "(?i)英国|\\bUnited Kingdom\\b|\\bUK\\b|\\bGB\\b" },
  { name: "🇩🇪 德国节点", filter: "(?i)德国|\\bGermany\\b|\\bDE\\b" },
  { name: "🇫🇷 法国节点", filter: "(?i)法国|\\bFrance\\b|\\bFR\\b" },
  { name: "🇨🇦 加拿大节点", filter: "(?i)加拿大|\\bCanada\\b|\\bCA\\b" },
  { name: "🇦🇺 澳大利亚节点", filter: "(?i)澳大利亚|\\bAustralia\\b|\\bAU\\b" },
  {
    name: "🌐 其他节点",
    filter: "(?i)^(?!.*(香港|Hong Kong|\\bHK\\b|台湾|Taiwan|\\bTW\\b|日本|Japan|\\bJP\\b|美国|United States|\\bUS\\b|新加坡|Singapore|\\bSG\\b|韩国|Korea|\\bKR\\b|英国|United Kingdom|\\bUK\\b|\\bGB\\b|德国|Germany|\\bDE\\b|法国|France|\\bFR\\b|加拿大|Canada|\\bCA\\b|澳大利亚|Australia|\\bAU\\b)).*"
  }
];

// 动态提取所有地区组名称
const regionGroupNames = regionDefinitions.map((r) => r.name);

// 服务策略组的默认节点选择列表
const standardProxies = [
  "🚀 节点选择",
  "♻️ 自动选择",
  ...regionGroupNames,
  "DIRECT"
];

// Rule-Provider 快速构建工厂函数
const createRuleProvider = (type, behavior, path) => ({
  type: "http",
  behavior: behavior,
  format: "mrs",
  interval: 86400,
  url: `https://github.com/MetaCubeX/meta-rules-dat/raw/refs/heads/meta/geo/${type}/${path}.mrs`,
  path: `./ruleset/${path}.mrs`
});

// ==============================================================================
// 4. 程序主入口 (main 函数)
// ==============================================================================
function main(config) {
  const proxyGroups = [];
  const ruleProviders = {};
  const rules = [];

  // --------------------------------------------------------------------------
  // A. 构建基础策略组 (节点选择与自动选择)
  // --------------------------------------------------------------------------
  proxyGroups.push(
    {
      name: "🚀 节点选择",
      type: "select",
      proxies: ["♻️ 自动选择", ...regionGroupNames, "DIRECT"]
    },
    {
      name: "♻️ 自动选择",
      type: "url-test",
      "include-all": true,
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50
    }
  );

  // --------------------------------------------------------------------------
  // B. 根据开关动态注入各业务分流策略组、规则集与规则
  // --------------------------------------------------------------------------

  // 1. 🛑 广告拦截
  if (ruleOptions.adblock) {
    proxyGroups.push({
      name: "🛑 广告拦截",
      type: "select",
      proxies: ["REJECT", "DIRECT"]
    });
    ruleProviders["category-ads-all"] = createRuleProvider("geosite", "domain", "category-ads-all");
    rules.push("RULE-SET,category-ads-all,🛑 广告拦截");
  }

  // 2. 🤖 AI 服务
  if (ruleOptions.ai) {
    proxyGroups.push({
      name: "🤖 AI 服务",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["openai"] = createRuleProvider("geosite", "domain", "openai");
    ruleProviders["anthropic"] = createRuleProvider("geosite", "domain", "anthropic");
    ruleProviders["category-ai-chat-!cn"] = createRuleProvider("geosite", "domain", "category-ai-chat-!cn");

    rules.push(
      "RULE-SET,openai,🤖 AI 服务",
      "RULE-SET,anthropic,🤖 AI 服务",
      "RULE-SET,category-ai-chat-!cn,🤖 AI 服务"
    );
  }

  // 3. ✨ Gemini
  if (ruleOptions.gemini) {
    proxyGroups.push({
      name: "✨ Gemini",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["google-gemini"] = createRuleProvider("geosite", "domain", "google-gemini");
    rules.push("RULE-SET,google-gemini,✨ Gemini");
  }

  // 4. 📹 油管视频
  if (ruleOptions.youtube) {
    proxyGroups.push({
      name: "📹 油管视频",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["youtube"] = createRuleProvider("geosite", "domain", "youtube");
    rules.push("RULE-SET,youtube,📹 油管视频");
  }

  // 5. 🔍 谷歌服务
  if (ruleOptions.google) {
    proxyGroups.push({
      name: "🔍 谷歌服务",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["google"] = createRuleProvider("geosite", "domain", "google");
    ruleProviders["google-ip"] = createRuleProvider("geoip", "ipcidr", "google");
    rules.push(
      "RULE-SET,google,🔍 谷歌服务",
      "RULE-SET,google-ip,🔍 谷歌服务"
    );
  }

  // 6. Ⓜ️ 微软服务
  if (ruleOptions.microsoft) {
    proxyGroups.push({
      name: "Ⓜ️ 微软服务",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["microsoft"] = createRuleProvider("geosite", "domain", "microsoft");
    ruleProviders["onedrive"] = createRuleProvider("geosite", "domain", "onedrive");
    rules.push(
      "RULE-SET,microsoft,Ⓜ️ 微软服务",
      "RULE-SET,onedrive,Ⓜ️ 微软服务"
    );
  }

  // 7. 🍏 苹果服务
  if (ruleOptions.apple) {
    proxyGroups.push({
      name: "🍏 苹果服务",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["apple"] = createRuleProvider("geosite", "domain", "apple");
    ruleProviders["icloud"] = createRuleProvider("geosite", "domain", "icloud");
    rules.push(
      "RULE-SET,apple,🍏 苹果服务",
      "RULE-SET,icloud,🍏 苹果服务"
    );
  }

  // 8. 📲 电报消息
  if (ruleOptions.telegram) {
    proxyGroups.push({
      name: "📲 电报消息",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["telegram"] = createRuleProvider("geosite", "domain", "telegram");
    ruleProviders["telegram-ip"] = createRuleProvider("geoip", "ipcidr", "telegram");
    rules.push(
      "RULE-SET,telegram,📲 电报消息",
      "RULE-SET,telegram-ip,📲 电报消息"
    );
  }

  // 9. 🐦 推特/X
  if (ruleOptions.twitter) {
    proxyGroups.push({
      name: "🐦 推特/X",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["twitter"] = createRuleProvider("geosite", "domain", "twitter");
    ruleProviders["twitter-ip"] = createRuleProvider("geoip", "ipcidr", "twitter");
    rules.push(
      "RULE-SET,twitter,🐦 推特/X",
      "RULE-SET,twitter-ip,🐦 推特/X"
    );
  }

  // 10. 📘 Meta 系
  if (ruleOptions.meta) {
    proxyGroups.push({
      name: "📘 Meta 系",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["facebook"] = createRuleProvider("geosite", "domain", "facebook");
    ruleProviders["instagram"] = createRuleProvider("geosite", "domain", "instagram");
    ruleProviders["whatsapp"] = createRuleProvider("geosite", "domain", "whatsapp");
    rules.push(
      "RULE-SET,facebook,📘 Meta 系",
      "RULE-SET,instagram,📘 Meta 系",
      "RULE-SET,whatsapp,📘 Meta 系"
    );
  }

  // 11. 🎬 奈飞
  if (ruleOptions.netflix) {
    proxyGroups.push({
      name: "🎬 奈飞",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["netflix"] = createRuleProvider("geosite", "domain", "netflix");
    rules.push("RULE-SET,netflix,🎬 奈飞");
  }

  // 12. 🎮 Steam
  if (ruleOptions.steam) {
    proxyGroups.push({
      name: "🎮 Steam",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["steam"] = createRuleProvider("geosite", "domain", "steam");
    rules.push("RULE-SET,steam,🎮 Steam");
  }

  // 13. 🐱 代码托管
  if (ruleOptions.code) {
    proxyGroups.push({
      name: "🐱 代码托管",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["github"] = createRuleProvider("geosite", "domain", "github");
    ruleProviders["gitlab"] = createRuleProvider("geosite", "domain", "gitlab");
    rules.push(
      "RULE-SET,github,🐱 代码托管",
      "RULE-SET,gitlab,🐱 代码托管"
    );
  }

  // 14. ☁️ 云服务
  if (ruleOptions.cloud) {
    proxyGroups.push({
      name: "☁️ 云服务",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["cloudflare"] = createRuleProvider("geosite", "domain", "cloudflare");
    ruleProviders["aws"] = createRuleProvider("geosite", "domain", "aws");
    rules.push(
      "RULE-SET,cloudflare,☁️ 云服务",
      "RULE-SET,aws,☁️ 云服务"
    );
  }

  // 15. 🛠️ 开发工具
  if (ruleOptions.devtools) {
    proxyGroups.push({
      name: "🛠️ 开发工具",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["jetbrains"] = createRuleProvider("geosite", "domain", "jetbrains");
    ruleProviders["docker"] = createRuleProvider("geosite", "domain", "docker");
    rules.push(
      "RULE-SET,jetbrains,🛠️ 开发工具",
      "RULE-SET,docker,🛠️ 开发工具"
    );
  }

  // 16. 🏠 私有网络
  if (ruleOptions.private) {
    proxyGroups.push({
      name: "🏠 私有网络",
      type: "select",
      proxies: ["DIRECT", "🚀 节点选择"]
    });
    ruleProviders["private"] = createRuleProvider("geosite", "domain", "private");
    ruleProviders["private-ip"] = createRuleProvider("geoip", "ipcidr", "private");
    rules.push(
      "RULE-SET,private,🏠 私有网络",
      "RULE-SET,private-ip,🏠 私有网络"
    );
  }

  // 17. 🔒 国内服务
  if (ruleOptions.cn) {
    proxyGroups.push({
      name: "🔒 国内服务",
      type: "select",
      proxies: ["DIRECT", "🚀 节点选择"]
    });
    ruleProviders["geolocation-cn"] = createRuleProvider("geosite", "domain", "geolocation-cn");
    ruleProviders["cn-ip"] = createRuleProvider("geoip", "ipcidr", "cn");
    rules.push(
      "RULE-SET,geolocation-cn,🔒 国内服务",
      "RULE-SET,cn-ip,🔒 国内服务"
    );
  }

  // 18. 🌍 非中国
  if (ruleOptions.foreign) {
    proxyGroups.push({
      name: "🌍 非中国",
      type: "select",
      proxies: standardProxies
    });
    ruleProviders["geolocation-!cn"] = createRuleProvider("geosite", "domain", "geolocation-!cn");
    rules.push("RULE-SET,geolocation-!cn,🌍 非中国");
  }

  // 19. 🐟 漏网之鱼 (兜底策略)
  proxyGroups.push({
    name: "🐟 漏网之鱼",
    type: "select",
    proxies: standardProxies
  });
  rules.push("MATCH,🐟 漏网之鱼");

  // --------------------------------------------------------------------------
  // C. 动态生成地区自动测试组
  // --------------------------------------------------------------------------
  regionDefinitions.forEach((region) => {
    proxyGroups.push({
      name: region.name,
      type: "url-test",
      "include-all": true,
      filter: region.filter,
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50
    });
  });

  // --------------------------------------------------------------------------
  // D. 将生成的策略组、规则集和规则注入到配置中
  // --------------------------------------------------------------------------
  config["proxy-groups"] = proxyGroups;
  config["rule-providers"] = ruleProviders;
  config["rules"] = rules;

  // 基础开关设定
  config["allow-lan"] = true;
  config["mode"] = "rule";

  // 高级嗅探设定（可选开启）
  if (advancedOptions.overrideSniffer) {
    config["sniffer"] = {
      enable: true,
      "force-dns-mapping": true,
      "parse-pure-ip": true,
      "override-destination": false,
      sniff: {
        TLS: { ports: [443, 8443] },
        HTTP: { ports: [80, "8080-8880"] },
        QUIC: { ports: [443, 8443] }
      },
      "skip-domain": ["Mijia Cloud", "+.oray.com"]
    };
  }

  // 返回修改后的完整配置
  return config;
}
