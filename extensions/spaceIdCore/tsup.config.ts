import { Options } from 'tsup'

const defaultOptions: Options = {
  entry: ['src/main.ts'],
  tsconfig: 'tsconfig.json',
  format: ['cjs', 'esm'],
  dts: true,
  cjsInterop: true,
  treeshake: true,
  noExternal: ['@web3-name-sdk/core', '@web3-name-sdk/register'],
}

export default defaultOptions
