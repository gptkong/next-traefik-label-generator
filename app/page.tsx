"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import jsYaml from "js-yaml";
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  oneDark,
  oneLight,
  dracula,
  vscDarkPlus,
  materialDark,
  nord,
  tomorrow,
  solarizedlight,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

// 注册 YAML 语言支持
SyntaxHighlighter.registerLanguage('yaml', yaml);

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
}

interface DockerComposeConfig {
  version?: string;
  services?: Record<string, {
    image?: string;
    ports?: string[];
    labels?: string[];
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

export default function Home() {
  const [leftContent, setLeftContent] = useState("");
  const [rightContent, setRightContent] = useState("");
  const [config, setConfig] = useState<ConfigForm>({
    serviceName: "",
    port: "",
    path: "",
    rule: "",
  });
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>("vscDarkPlus");

  const parseYaml = () => {
    try {
      const parsedYaml = jsYaml.load(leftContent) as DockerComposeConfig;
      if (parsedYaml?.services) {
        const serviceName = Object.keys(parsedYaml.services)[0];
        const service = parsedYaml.services[serviceName];
        setConfig({
          serviceName,
          port: service?.ports?.[0]?.split(":")?.[0] || "",
          path: "",
          rule: "",
        });
      }
    } catch (error) {
      console.error("YAML解析错误:", error);
    }
  };

  const generateConfig = () => {
    try {
      const parsedYaml = jsYaml.load(leftContent) as DockerComposeConfig;
      if (!parsedYaml?.services) return;

      // 更新配置
      const updatedYaml = {
        ...parsedYaml,
        services: {
          [config.serviceName]: {
            ...parsedYaml.services[Object.keys(parsedYaml.services)[0]],
            labels: [
              "traefik.enable=true",
              `traefik.http.routers.${config.serviceName}.rule=Host(\`${config.rule}\`) && PathPrefix(\`${config.path}\`)`,
              `traefik.http.services.${config.serviceName}.loadbalancer.server.port=${config.port}`
            ]
          }
        }
      };

      // 使用自定义样式输出YAML
      const formattedYaml = jsYaml.dump(updatedYaml, {
        lineWidth: -1,
        noRefs: true,
        styles: {
          '!!null': 'empty'
        }
      }).replace(/^(\w+):$/gm, '\n$1:');

      setRightContent(formattedYaml);
    } catch (error) {
      console.error("配置生成错误:", error);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 min-h-screen p-8">
      <div className="col-span-1">
        <Textarea
          value={leftContent}
          onChange={(e) => setLeftContent(e.target.value)}
          className="w-full h-full min-h-[500px] p-4 resize-none font-mono"
          placeholder="请输入docker-compose.yaml内容"
        />
      </div>

      <div className="col-span-1 flex flex-col gap-6 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>服务名称</Label>
            <Input
              value={config.serviceName}
              onChange={(e) => setConfig({...config, serviceName: e.target.value})}
              placeholder="输入服务名称"
            />
          </div>
          
          <div className="space-y-2">
            <Label>端口</Label>
            <Input
              value={config.port}
              onChange={(e) => setConfig({...config, port: e.target.value})}
              placeholder="输入端口号"
            />
          </div>

          <div className="space-y-2">
            <Label>路径前缀</Label>
            <Input
              value={config.path}
              onChange={(e) => setConfig({...config, path: e.target.value})}
              placeholder="输入路径前缀 如: /api"
            />
          </div>

          <div className="space-y-2">
            <Label>域名规则</Label>
            <Input
              value={config.rule}
              onChange={(e) => setConfig({...config, rule: e.target.value})}
              placeholder="输入域名 如: api.example.com"
            />
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

        <div className="flex flex-col gap-4 items-center mt-4">
          <button 
            onClick={parseYaml}
            className="w-full px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            解析YAML
          </button>
          <button 
            onClick={generateConfig}
            className="w-full px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            生成配置
          </button>
        </div>
      </div>

      <div className="col-span-1 relative">
        <div className="absolute inset-0 overflow-auto">
          <SyntaxHighlighter
            language="yaml"
            style={themes[selectedTheme]}
            customStyle={{
              margin: 0,
              minHeight: '500px',
              fontSize: '14px',
              padding: '1rem',
            }}
            className="h-full rounded-md border border-input"
            showLineNumbers={true}
            wrapLines={true}
            wrapLongLines={true}
          >
            {rightContent || '# 生成的YAML配置将显示在这里'}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
}
