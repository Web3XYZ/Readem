import { useWeb3React } from '@web3-react/core'
import BigNumber from 'bignumber.js'
import { Contract } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'

import CEther from '@/app/contract/cEther'
import comptroller from '@/app/contract/comptroller'
import CToken from '@/app/contract/cToken'
import oracle from '@/app/contract/oracle'
import * as config from '@/app/utils/config'
import { eX, pow10 } from '@/app/utils/tool'

export interface IToken {
    address: string
    underlying: string
    symbol: string
    decimals: number
    underlyingPrice: number
    underlyingAmount: number
    liquidity: number
    supplyApy: BigNumber
    borrowApy: BigNumber
    marketTotalSupply: BigNumber
    marketTotalBorrow: BigNumber
    marketTotalSupplyInTokenUnit: BigNumber
    marketTotalBorrowInTokenUnit: BigNumber
    isEnterMarket: boolean
    collateralFactor: BigNumber
    supplyBalanceInTokenUnit: BigNumber
    supplyBalance: BigNumber
    borrowBalanceInTokenUnit: BigNumber
    borrowBalance: BigNumber
}

export interface ITokenTotal {
    totalSupplyBalance: BigNumber
    totalBorrowBalance: BigNumber
    yearSupplyInterest: BigNumber
    yearBorrowInterest: BigNumber
    netApy: BigNumber
    allMarketsTotalSupplyBalance: BigNumber
    allMarketsTotalBorrowBalance: BigNumber
    totalBorrowLimitUsedPercent: BigNumber
    totalBorrowLimit: BigNumber
    totalLiquidity: BigNumber
}

const blockTime = 13.5

const getUnderlyingPrice = async (address: string, decimals: number): Promise<number> => {
    const oracleContract = await oracle(config.oracle)
    const underlyingPrice = await oracleContract.getUnderlyingPrice(address)
    return +pow10(underlyingPrice.toString(), decimals)
}

const getMarketTotalSupplyInTokenUnit = async (contract: Contract, decimals: number): Promise<BigNumber> => {
    const cTokenTotalSupply = await contract.totalSupply()
    const exchangeRateStored = await contract.exchangeRateStored()

    return eX(cTokenTotalSupply.mul(exchangeRateStored).toString(), -1 * decimals - 18)
}

const getMarketTotalBorrowInTokenUnit = async (contract: Contract, decimals: number): Promise<BigNumber> => {
    const totalBorrows = await contract.totalBorrows()
    return eX(totalBorrows.toString(), -1 * decimals)
}

const getSupplyApy = async (contract: Contract): Promise<BigNumber> => {
    const mantissa = 1e18 // mantissa is the same even the underlying asset has different decimals
    const blocksPerDay = (24 * 60 * 60) / blockTime
    const daysPerYear = 365

    let supplyRatePerBlock
    try {
        supplyRatePerBlock = await contract.supplyRatePerBlock()
    } catch (e) {
        supplyRatePerBlock = new BigNumber(0)
    }

    return new BigNumber(Math.pow((supplyRatePerBlock.toNumber() / mantissa) * blocksPerDay + 1, daysPerYear - 1) - 1)
}

const getBorrowApy = async (contract: Contract): Promise<BigNumber> => {
    const mantissa = 1e18 // mantissa is the same even the underlying asset has different decimals
    const blocksPerDay = (24 * 60 * 60) / blockTime
    const daysPerYear = 365

    let borrowRatePerBlock
    try {
        borrowRatePerBlock = await contract.borrowRatePerBlock()
    } catch (e) {
        borrowRatePerBlock = new BigNumber(0)
    }

    return new BigNumber(Math.pow((borrowRatePerBlock.toNumber() / mantissa) * blocksPerDay + 1, daysPerYear - 1) - 1)
}

const getUnderlyingAmount = async (contract: Contract, decimals: number): Promise<number> => {
    const underlyingAmount = await contract.getCash()

    return +eX(underlyingAmount.toString(), -1 * decimals)
}

const getSupplyAndBorrowBalance = async (
    contract: Contract,
    underlyingPrice: number,
    decimals: number,
    account: string
): Promise<{ supplyBalanceInTokenUnit: BigNumber; supplyBalance: BigNumber; borrowBalanceInTokenUnit: BigNumber; borrowBalance: BigNumber }> => {
    const accountSnapshot = await contract.getAccountSnapshot(account)
    const supplyBalanceInTokenUnit = eX(accountSnapshot[1].mul(accountSnapshot[3]).toString(), -1 * decimals - 18)
    const supplyBalanceInUsd = supplyBalanceInTokenUnit.times(underlyingPrice)
    const borrowBalanceInTokenUnit = eX(accountSnapshot[2].toString(), -1 * decimals)
    const borrowBalanceInUsd = borrowBalanceInTokenUnit.times(underlyingPrice)

    return {
        supplyBalanceInTokenUnit,
        supplyBalance: supplyBalanceInUsd,
        borrowBalanceInTokenUnit,
        borrowBalance: borrowBalanceInUsd
    }
}

const getCollateralFactor = async (contract: Contract, address: string): Promise<BigNumber> => {
    const market = await contract.markets(address)

    return eX(market[1].toString(), -18)
}

export default (): { tokens: IToken[]; loading: boolean; total: ITokenTotal; fetch: () => void } => {
    const [tokens, setTokens] = useState<IToken[]>([])
    const [loading, setLoading] = useState(false)
    const { account } = useWeb3React()
    const [total, setTotal] = useState<ITokenTotal>({
        totalSupplyBalance: new BigNumber(0),
        totalBorrowBalance: new BigNumber(0),
        yearSupplyInterest: new BigNumber(0),
        yearBorrowInterest: new BigNumber(0),
        netApy: new BigNumber(0),
        allMarketsTotalSupplyBalance: new BigNumber(0),
        allMarketsTotalBorrowBalance: new BigNumber(0),
        totalBorrowLimitUsedPercent: new BigNumber(0),
        totalBorrowLimit: new BigNumber(0),
        totalLiquidity: new BigNumber(0)
    })

    const fetch = async (): Promise<void> => {
        if (!account) return setLoading(false)
        try {
            const comptrollerContract = await comptroller(config.Unitroller)
            const assetsIn = await comptrollerContract.getAssetsIn(account)
            const allMarkets = await comptrollerContract.getAllMarkets()
            const arr: IToken[] = []

            let totalSupplyBalance = new BigNumber(0)
            let totalBorrowBalance = new BigNumber(0)
            let yearSupplyInterest = new BigNumber(0)
            let yearBorrowInterest = new BigNumber(0)
            let allMarketsTotalSupplyBalance = new BigNumber(0)
            let allMarketsTotalBorrowBalance = new BigNumber(0)
            let totalBorrowLimit = new BigNumber(0)
            let totalLiquidity = new BigNumber(0)

            await Promise.all(
                await allMarkets.map(async (item: string) => {
                    const contract = config.cEther !== item ? await CToken(item) : await CEther(item)
                    let underlying = config.cEther
                    let symbol = ''
                    let decimals = 18

                    if (config.cEther !== item) {
                        underlying = await contract.underlying()
                        const underlyingContract = await CToken(underlying)
                        symbol = await underlyingContract.symbol()
                        decimals = await underlyingContract.decimals()
                    }

                    const underlyingPrice = await getUnderlyingPrice(item, decimals)
                    const underlyingAmount = await getUnderlyingAmount(contract, decimals)
                    const liquidity = +underlyingAmount * +underlyingPrice
                    const marketTotalSupplyInTokenUnit = await getMarketTotalSupplyInTokenUnit(contract, decimals)
                    const marketTotalSupply = marketTotalSupplyInTokenUnit.times(underlyingPrice)
                    const marketTotalBorrowInTokenUnit = await getMarketTotalBorrowInTokenUnit(contract, decimals)
                    const marketTotalBorrow = marketTotalBorrowInTokenUnit.times(underlyingPrice)
                    const supplyApy = await getSupplyApy(contract)
                    const borrowApy = await getBorrowApy(contract)

                    const isEnterMarket = assetsIn.includes(item)
                    const collateralFactor = await getCollateralFactor(comptrollerContract, underlying)
                    const supplyAndBorrowBalance = await getSupplyAndBorrowBalance(contract, underlyingPrice, decimals, account)

                    totalSupplyBalance = totalSupplyBalance.plus(supplyAndBorrowBalance.supplyBalance)
                    totalBorrowBalance = totalBorrowBalance.plus(supplyAndBorrowBalance.borrowBalance)
                    yearSupplyInterest = yearSupplyInterest.plus(supplyAndBorrowBalance.supplyBalance.times(supplyApy))
                    yearBorrowInterest = yearBorrowInterest.plus(supplyAndBorrowBalance.borrowBalance.times(borrowApy))
                    totalBorrowLimit = totalBorrowLimit.plus(isEnterMarket ? supplyAndBorrowBalance.supplyBalance.times(collateralFactor) : 0)

                    if (marketTotalSupply.isGreaterThan(0)) {
                        allMarketsTotalSupplyBalance = allMarketsTotalSupplyBalance.plus(marketTotalSupply)
                    }
                    if (marketTotalBorrow.isGreaterThan(0)) {
                        allMarketsTotalBorrowBalance = allMarketsTotalBorrowBalance.plus(marketTotalBorrow)
                    }

                    if (liquidity > 0) {
                        totalLiquidity = totalLiquidity.plus(liquidity)
                    }

                    arr.push({
                        address: item,
                        underlying,
                        symbol,
                        decimals,
                        underlyingPrice,
                        underlyingAmount,
                        liquidity,
                        supplyApy,
                        borrowApy,
                        marketTotalSupply,
                        marketTotalBorrow,
                        marketTotalSupplyInTokenUnit,
                        marketTotalBorrowInTokenUnit,
                        isEnterMarket,
                        collateralFactor,
                        ...supplyAndBorrowBalance
                    })
                })
            )

            setTokens(arr)
            setTotal({
                totalSupplyBalance,
                totalBorrowBalance,
                yearSupplyInterest,
                yearBorrowInterest,
                netApy: yearSupplyInterest.minus(yearBorrowInterest).div(totalSupplyBalance),
                allMarketsTotalSupplyBalance,
                allMarketsTotalBorrowBalance,
                totalBorrowLimitUsedPercent: totalBorrowBalance.div(totalBorrowLimit).times(100),
                totalBorrowLimit,
                totalLiquidity
            })
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    }

    useEffect(() => {
        setLoading(true)
        fetch()
        return () => {
            setTokens([])
        }
    }, [account])

    return { tokens, total, loading, fetch }
}
