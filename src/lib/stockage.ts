'use server'

import { execScript } from "@/lib/ssh";
import type { SSHConfig } from '@/types/config';
import type { StorageInfo } from '@/types/stockage'


export async function getStockageTotal(config: SSHConfig): Promise<StorageInfo> {
  const { stdout } = await execScript("get_storage.sh", [], config);
  const lines = stdout.trim().split("\n");

  let total = 0;
  let used = 0;
  const vms: { name: string; size: number }[] = [];

  for (const line of lines) {
    if (line.startsWith("STORAGE")) {
      const parts = line.split("|");
      total = parseFloat(parts[1]);
      used = parseFloat(parts[2]);
    } else if (line.startsWith("VM_STORAGE_USAGE:")) {
      continue;
    } else if (line.includes("|")) {
      const [name, sizeStr] = line.split("|");
      const size = parseFloat(sizeStr);
      if (!isNaN(size)) {
        vms.push({ name, size });
      }
    }
  }

  return { total, used, vms };
}
