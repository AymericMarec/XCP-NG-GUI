'use server';

import { Client } from 'ssh2';
import fs from 'fs';
import type { SSHConfig } from '@/types/config';
import path from 'path';


export async function execSSH(command: string, config: SSHConfig): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    console.log(config)
    conn
      .on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end()
            return reject(err)
          }

          let stdout = ''
          let stderr = ''

          stream
            .on('close', () => {
              conn.end();
              resolve({ stdout, stderr });
            })
            .on('data', (data: Buffer) => {
              stdout += data.toString();
            })
            .stderr.on('data', (data: Buffer) => {
              stderr += data.toString();
            });
        });
      })
      .on('error', (err) => {
        reject(err);
      })
      .connect({
        host: config.host,
        port: 22,
        username: config.username,
        password: config.password,
      });
  });
}


export async function execScript(scriptName: string,args: string[],config: SSHConfig): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    const scriptPath = path.resolve(process.cwd(), 'script', scriptName)
    const scriptContent = fs.readFileSync(scriptPath, 'utf8')
    const argString = args.map(arg => `'${arg.replace(/'/g, `'\\''`)}'`).join(' ')

    conn
      .on('ready', () => {
        conn.exec(`/bin/bash -s ${argString}`, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          let stdout = '';
          let stderr = '';

          stream
            .on('close', () => {
              conn.end();
              resolve({ stdout, stderr });
            })
            .on('data', (data: Buffer) => {
              stdout += data.toString();
            })
            .stderr.on('data', (data: Buffer) => {
              stderr += data.toString();
            });

          stream.write(scriptContent);
          stream.end();
        });
      })
      .on('error', (err) => reject(err))
      .connect({
        host: config.host,
        port: 22,
        username: config.username,
        password: config.password,
      });
  });
}