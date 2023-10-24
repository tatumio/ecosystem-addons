import { AbiCoder, ethers } from 'ethers'

export const matchStorageSlotsToAddresses = (
  addresses: string[],
  storageAddresses: string[],
): Record<string, string> => {
  const matchedAddresses: Record<string, string> = {}

  for (const address of addresses) {
    for (let position = 0; position <= 100; position++) {
      const soliditySlot = getStorageSlotSolidity(address, position)
      const vyperSlot = getStorageSlotVyper(address, position)

      if (storageAddresses.includes(soliditySlot)) {
        matchedAddresses[address] = soliditySlot
        break
      } else if (storageAddresses.includes(vyperSlot)) {
        matchedAddresses[address] = vyperSlot
        break
      }
    }
  }

  return matchedAddresses
}

const getStorageSlotSolidity = (address: string, position: number): string => {
  const addressStripped = address.slice(2)
  return ethers.keccak256(AbiCoder.defaultAbiCoder().encode(['address', 'uint'], [addressStripped, position]))
}
const getStorageSlotVyper = (address: string, position: number): string => {
  const addressStripped = address.slice(2)
  return ethers.keccak256(AbiCoder.defaultAbiCoder().encode(['uint', 'address'], [position, addressStripped]))
}
