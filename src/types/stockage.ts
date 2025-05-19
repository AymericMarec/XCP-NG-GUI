export type StorageInfo = {
  total: number;
  used: number;
  vms: {
    name: string;
    size: number;
  }[];
};
