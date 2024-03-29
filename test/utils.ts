export async function setupMahinNFTContract() {
  // @ts-ignore
  const MahinNFT = await ethers.getContractFactory("MahinNFT");
  const nft = await MahinNFT.deploy({
    'coordinator': '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
    'token': '0x01be23585060835e02b77ef475b0cc51aa1e0709',
    'keyHash': '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311',
    'price': '100000000000000000',
  });
  await nft.deployed();
  return nft;
}
