import React, { useState } from 'react';
import { Button } from './ui/button';
import { Copy, Check, Terminal, Container, Cloud } from 'lucide-react';

type InstallMethod = 'docker' | 'manual' | 'proxmox';

export function Installation() {
  const [activeMethod, setActiveMethod] = useState<InstallMethod>('docker');
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const copyToClipboard = async (text: string, commandId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCommand(commandId);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const installMethods = {
    docker: {
      icon: Container,
      title: "Docker",
      description: "Recommended for most users",
      steps: [
        {
          title: "Clone the repository",
          command: "git clone https://github.com/RayLabsHQ/gitea-mirror.git\ncd gitea-mirror",
          id: "docker-clone"
        },
        {
          title: "Start with Docker Compose",
          command: "docker compose -f docker-compose.alt.yml up -d",
          id: "docker-start"
        },
        {
          title: "Access the application",
          command: "# Open http://localhost:4321 in your browser",
          id: "docker-access"
        }
      ]
    },
    manual: {
      icon: Terminal,
      title: "Manual",
      description: "For development or custom setups",
      steps: [
        {
          title: "Install Bun runtime",
          command: "curl -fsSL https://bun.sh/install | bash",
          id: "manual-bun"
        },
        {
          title: "Clone and setup",
          command: "git clone https://github.com/RayLabsHQ/gitea-mirror.git\ncd gitea-mirror\nbun run setup",
          id: "manual-setup"
        },
        {
          title: "Start the application",
          command: "bun run dev",
          id: "manual-start"
        }
      ]
    },
    proxmox: {
      icon: Cloud,
      title: "Proxmox LXC",
      description: "One-click install for Proxmox VE",
      steps: [
        {
          title: "Run the installation script",
          command: 'bash -c "$(curl -fsSL https://raw.githubusercontent.com/community-scripts/ProxmoxVE/main/ct/gitea-mirror.sh)"',
          id: "proxmox-install"
        },
        {
          title: "Follow the prompts",
          command: "# The script will guide you through the setup",
          id: "proxmox-follow"
        }
      ]
    }
  };

  return (
    <section id="installation" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Get Started in Minutes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            Choose your preferred installation method
          </p>
        </div>

        {/* Installation method tabs */}
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
          {(Object.entries(installMethods) as [InstallMethod, typeof installMethods[InstallMethod]][]).map(([method, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={method}
                onClick={() => setActiveMethod(method)}
                className={`flex items-center gap-3 px-4 sm:px-6 py-3 rounded-lg border transition-all min-h-[60px] ${
                  activeMethod === method
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-lg shadow-primary/25'
                    : 'bg-card hover:bg-muted border-border hover:border-primary/30'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-sm sm:text-base">{config.title}</p>
                  <p className={`text-xs ${activeMethod === method ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {config.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Installation steps */}
        <div className="space-y-4 sm:space-y-6">
          {installMethods[activeMethod].steps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shadow-primary/20">
                  <span className="text-sm font-semibold text-primary-foreground">{index + 1}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-semibold mb-2 text-sm sm:text-base">{step.title}</h3>
                  <div className="relative group">
                    <pre className="bg-muted/50 rounded-lg p-3 sm:p-4 pr-12 overflow-x-auto text-xs sm:text-sm">
                      <code className="break-all sm:break-normal">{step.command}</code>
                    </pre>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-8 sm:w-9 sm:h-9 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      onClick={() => copyToClipboard(step.command, step.id)}
                    >
                      {copiedCommand === step.id ? (
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              {index < installMethods[activeMethod].steps.length - 1 && (
                <div className="absolute left-4 top-10 bottom-0 w-[1px] bg-border -z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-lg bg-muted/30 border">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <strong className="text-foreground">First user becomes admin.</strong> After installation, 
            create your account and configure GitHub and Gitea connections through the web interface.
          </p>
        </div>
      </div>
    </section>
  );
}