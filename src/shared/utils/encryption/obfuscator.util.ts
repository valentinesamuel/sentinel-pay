import { Injectable } from '@nestjs/common';

@Injectable()
export class ObfuscatorUtil {
  obfuscateString(obfuscatorKey: string, pin: string): string {
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += obfuscatorKey.slice(i * 8, (i + 1) * 8) + pin[i];
    }
    result += obfuscatorKey.slice(32);
    return result;
  }

  deObfuscatedString(obfuscatedString: string): any {
    let pin = '';
    let base = '';
    let pos = 0;
    for (let i = 0; i < 4; i++) {
      base += obfuscatedString.slice(pos, pos + 8);
      pin += obfuscatedString[pos + 8];
      pos += 9;
    }
    base += obfuscatedString.slice(pos);
    return { pin, base };
  }
}
