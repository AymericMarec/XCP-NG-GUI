'use server';
import type { VM } from '@/types/vm';
import { execSSH } from "@/lib/ssh";
import type { SSHConfig } from '@/types/config';
import type { vmInfo,RAMInfo,Stockage  } from '@/types/vm';

export async function GetInfoVMs(config: SSHConfig): Promise<VM[]> {
    const { stdout } = await execSSH('xe vm-list', config);
    console.log("test")
    const vms: VM[] = [];
    const blocks = stdout.split('\n\n');

    for (const block of blocks) {
        const lines = block.split('\n').filter(Boolean);

        let uid = '';
        let name = '';
        let status = '';

        for (const line of lines) {
            const [key, value] = line.split(':').map(s => s.trim());
            if (key.startsWith('uuid')) uid = value;
            else if (key.startsWith('name-label')) name = value;
            else if (key.startsWith('power-state')) status = value;
        }

        if (uid && name && status) {
            vms.push({ uid, name, status });
        }
    }
    return vms;
}

export async  function getStats(uuid:string ,config:SSHConfig) {
    const vmInfo: vmInfo = {
        ip: null,
        cpu: null,
        memoryMB: null,
        stockage:null
    };
    
    //get cpu info
    const cpuRes = await execSSH(`xe vm-param-get uuid=${uuid} param-name=VCPUs-utilisation`, config);
    vmInfo.cpu = parseCpuUtilization(cpuRes.stdout);

    //get ram info
    const ramInfo = await execSSH('free -m', config);
    vmInfo.memoryMB = await getRamUsage(ramInfo.stdout);

    //get stockage info
    vmInfo.stockage =  await getStorageInfo(config)

  return vmInfo;
}

function parseCpuUtilization(output: string): number[] {
    return output
      .trim()
      .split(';')
      .map(part => part.trim())
      .filter(part => part.includes(':'))
      .map(part => {
        const [_, value] = part.split(':');
        return Math.round(parseFloat(value.trim()) * 100)
      });
  }
  
export async function getRamUsage(output: string): Promise<RAMInfo> {

  const lines = output.trim().split('\n')
  const memLine = lines.find(line => line.toLowerCase().startsWith('mem:'))

  if (!memLine) {
    throw new Error("Impossible de trouver la ligne mémoire dans 'free -m'")
  }

  const parts = memLine.trim().split(/\s+/)

  const total = parseInt(parts[1], 10)
  const used = parseInt(parts[2], 10)

  return { total, used }
}

export async function getStorageInfo(config: SSHConfig): Promise<Stockage> {
  const cmd = `df -B1 --output=size,used / | tail -1`
  const res = await execSSH(cmd, config)

  if (res.stderr) throw new Error(`Erreur SSH: ${res.stderr}`)

  const parts = res.stdout.trim().split(/\s+/)
  if (parts.length < 2) throw new Error('Impossible de parser la sortie df')

  const totalBytes = parseInt(parts[0], 10)
  const usedBytes = parseInt(parts[1], 10)

  if (isNaN(totalBytes) || isNaN(usedBytes)) throw new Error('Valeurs non numériques reçues')

  const total = Math.round((totalBytes / (1024 ** 3)) * 100) / 100
  const used = Math.round((usedBytes / (1024 ** 3)) * 100) / 100

  return { total, used }
}
