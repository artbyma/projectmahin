num_tries = 12
num_nfts = 240


yearly_chance = 0.05
monthly_chance = 1 - (1-yearly_chance) ** (1 / num_tries)


import random

nfts = [False for x in range(num_nfts)]

monthly = True
if monthly:
    for t in range(num_tries):
        for idx in range(len(nfts)):
            if random.random() < monthly_chance:
                nfts[idx] = True
else:
    for idx in range(len(nfts)):
        if random.random() < yearly_chance:
            nfts[idx] = True


# for idx in range(len(nfts)):
#     print(f'{idx+1}: {nfts[idx]}')
print("")
count = len([x for x in nfts if x])
print("Got cancer: ", count, count/len(nfts))


# 240 nfts: 12x: ~14


once = 1
yearly = 5
