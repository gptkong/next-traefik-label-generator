"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsYaml from "js-yaml";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  oneDark,
  oneLight,
  dracula,
  vscDarkPlus,
  materialDark,
  nord,
  tomorrow,
  solarizedlight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "@/components/copy-button";

// 注册 YAML 语言支持
SyntaxHighlighter.registerLanguage("yaml", yaml);

// 主题选项
const themes = {
  oneDark,
  oneLight,
  dracula,
  vscDarkPlus,
  materialDark,
  nord,
  tomorrow,
  solarizedlight,
} as const;

type ThemeKey = keyof typeof themes;

interface ConfigForm {
  serviceName: string;
  port: string;
  path: string;
  rule: string;
  networkName: string;
  networkExternal: boolean;
}

interface DockerComposeConfig {
  version?: string;
  services?: Record<
    string,
    {
      image?: string;
      ports?: string[];
      labels?: string[];
      networks?: string[];
      [key: string]: unknown;
    }
  >;
  networks?: Record<
    string,
    {
      external?: boolean;
      [key: string]: unknown;
    }
  >;
  [key: string]: unknown;
}

export default function Home() {
  const [yamlInput, setYamlInput] = useState("");
  const [rightContent, setRightContent] = useState("");
  const [config, setConfig] = useState<ConfigForm>({
    serviceName: "",
    port: "",
    path: "",
    rule: "",
    networkName: "",
    networkExternal: false,
  });
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("oneLight");
  const [dialogOpen, setDialogOpen] = useState(false);

  const parseYaml = (content: string) => {
    try {
      const parsedYaml = jsYaml.load(content) as DockerComposeConfig;
      if (parsedYaml?.services) {
        const serviceName = Object.keys(parsedYaml.services)[0];
        const service = parsedYaml.services[serviceName];
        const newConfig = {
          serviceName,
          port: service?.ports?.[0]?.split(":")?.[0] || "",
          path: "",
          rule: "",
          networkName: "",
          networkExternal: false,
        };
        setConfig(newConfig);
        setYamlInput(content);
        generateConfig(content, newConfig);
      }
    } catch (error) {
      console.error("YAML解析错误:", error);
    }
  };

  const generateConfig = (currentYaml = yamlInput, currentConfig = config) => {
    try {
      const parsedYaml = jsYaml.load(currentYaml) as DockerComposeConfig;
      if (!parsedYaml?.services) return;

      const updatedYaml = {
        ...parsedYaml,
        services: {
          [currentConfig.serviceName]: {
            ...parsedYaml.services[Object.keys(parsedYaml.services)[0]],
            labels: [
              "traefik.enable=true",
              `traefik.http.routers.${currentConfig.serviceName}.rule=Host(\`${currentConfig.rule}\`) && PathPrefix(\`${currentConfig.path}\`)`,
              `traefik.http.services.${currentConfig.serviceName}.loadbalancer.server.port=${currentConfig.port}`,
            ],
            ...(currentConfig.networkName
              ? {
                  networks: [currentConfig.networkName],
                }
              : {}),
          },
        },
        ...(currentConfig.networkName
          ? {
              networks: {
                [currentConfig.networkName]: {
                  external: currentConfig.networkExternal,
                },
              },
            }
          : {}),
      };

      const formattedYaml = jsYaml
        .dump(updatedYaml, {
          lineWidth: -1,
          noRefs: true,
          styles: {
            "!!null": "empty",
          },
        })
        .replace(/^(\w+):$/gm, "\n$1:");

      setRightContent(formattedYaml);
    } catch (error) {
      console.error("配置生成错误:", error);
    }
  };

  const handleConfigChange = (
    key: keyof ConfigForm,
    value: string | boolean
  ) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    generateConfig(yamlInput, newConfig);
  };

  return (
    <div className="grid grid-cols-3 gap-4 h-screen p-4">
      {/* 左侧表单区域 - 1/3 */}
      <div className="col-span-1 flex flex-col gap-4 p-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="w-full px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90">
              解析YAML
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>输入YAML配置</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                value={yamlInput}
                onChange={(e) => setYamlInput(e.target.value)}
                className="min-h-[300px] font-mono"
                placeholder="请输入docker-compose.yaml内容"
              />
            </div>
            <button
              onClick={() => {
                parseYaml(yamlInput);
                setDialogOpen(false);
              }}
              className="w-full px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              确认
            </button>
          </DialogContent>
        </Dialog>

        <div className="space-y-3">
          <div className="space-y-2">
            <Label>服务名称</Label>
            <Input
              value={config.serviceName}
              onChange={(e) =>
                handleConfigChange("serviceName", e.target.value)
              }
              placeholder="输入服务名称"
            />
          </div>

          <div className="space-y-2">
            <Label>端口</Label>
            <Input
              value={config.port}
              onChange={(e) => handleConfigChange("port", e.target.value)}
              placeholder="输入端口号"
            />
          </div>

          <div className="space-y-2">
            <Label>域名规则</Label>
            <Input
              value={config.rule}
              onChange={(e) => handleConfigChange("rule", e.target.value)}
              placeholder="输入域名 如: api.example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>路径前缀</Label>
            <Input
              value={config.path}
              onChange={(e) => handleConfigChange("path", e.target.value)}
              placeholder="输入路径前缀 如: /api"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Network 名称</Label>
              <Input
                value={config.networkName}
                onChange={(e) =>
                  handleConfigChange("networkName", e.target.value)
                }
                placeholder="输入 network 名称"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="networkExternal"
                checked={config.networkExternal}
                onChange={(e) =>
                  handleConfigChange("networkExternal", e.target.checked)
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="networkExternal">External Network</Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>代码主题</Label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as ThemeKey)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="vscDarkPlus">VS Code Dark+</option>
              <option value="oneDark">One Dark</option>
              <option value="oneLight">One Light</option>
              <option value="dracula">Dracula</option>
              <option value="materialDark">Material Dark</option>
              <option value="nord">Nord</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="solarizedlight">Solarized Light</option>
            </select>
          </div>
        </div>
      </div>

      {/* 右侧代码区域 - 2/3 */}
      <div className="col-span-2 relative">
        <CopyButton text={rightContent || "# 生成的YAML配置将显示在这里"} />
        <SyntaxHighlighter
          language="yaml"
          style={themes[selectedTheme]}
          customStyle={{
            margin: 0,
            height: "100%",
            fontSize: "14px",
            padding: "1rem",
          }}
          className="h-full rounded-md border border-input"
          showLineNumbers={true}
          wrapLines={true}
          wrapLongLines={true}
        >
          {rightContent || "# 生成的YAML配置将显示在这里"}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
