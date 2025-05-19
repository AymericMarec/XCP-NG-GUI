export type VM = {
    uid: string;
    name: string;
    status: string;
};
export type vmInfo = {
    ip: string | null,
    cpu: number[] | null,
    memoryMB: RAMInfo | null,
    stockage: Stockage| null,
}
export type RAMInfo = {
  total: number,
  used: number
}

export type Stockage = {
  total: number,
  used: number
}