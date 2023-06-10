import { useState, useEffect } from 'react'
import { toast } from "react-toastify";

import { useHashConnect } from "../../components/common/HashConnectAPIProvider";
import { getRequest, postRequest } from "../../utils/api/apiRequests";
import LoadingLayout from "../../components/common/LoadingLayout"

import * as env from "../../env";

import pfpIcon from '../../assets/imgs/pfp.png'
import refreshIcon from '../../assets/imgs/refresh.png'
import walletIcon from '../../assets/imgs/wallet icon.png'

const StakingPage = () => {
    const { walletData, installedExtensions, connect, disconnect, allowanceNft, allowanceMultipleNft, receiveReward } = useHashConnect();
    const [walletId, setWalletId] = useState(null)

    const [loadingView, setLoadingView] = useState(false)
    const [rewardAmount, setRewardAmount] = useState(0)
    const [totalStakers, setTotalStakers] = useState(0)
    const [totalNFTCount, setTotalNFTCount] = useState(0)
    const [stakedNFTCount, setStakedNFTCount] = useState(0)
    const [stakeRatio, setStakeRatio] = useState('0')
    const [unstakedNFTList, setUnstakedNFTList] = useState([]);
    const [unstakedNFTCount, setUnstakedNFTCount] = useState(0);
    const [stakedNFTList, setStakedNFTList] = useState([]);
    const [checkedUnstakedNFTCount, setCheckedUnstakedNFTCount] = useState(0)
    const [checkedStakedNFTCount, setCheckedStakedNFTCount] = useState(0)

    const [checkboxValue, setCheckboxValue] = useState("")

    useEffect(() => {
        getStakeRatio()
    }, [])

    useEffect(() => {
        if (walletData.pairingData != null) {
            if (walletData.pairingData.length != 0) {
                if (walletData.pairingData.length == undefined) {
                    setWalletId(walletData.pairingData.accountIds[0])
                }
                else {
                    setWalletId(walletData.pairingData[0].accountIds[0])
                }
            }
        }
        else
            setWalletId(null)
    }, [walletData]);

    useEffect(() => {
        if (walletId != null)
            getTotalInfo();
        else {
            setRewardAmount(0)
            setUnstakedNFTList([])
            setUnstakedNFTCount(0)
            setStakedNFTList([])
            setStakedNFTCount(0)
        }
    }, [walletId]);

    const onClickConnectHashPack = () => {
        if (installedExtensions) {
            connect();
        } else {
            alert(
                "Please install HashPack wallet extension first. from chrome web store."
            );
        }
    }

    const onClickDisconnectHashPack = () => {
        disconnect();
    }

    const handleConnectWallet = () => {
        if (walletId != null) {
            setWalletId(null)
            onClickDisconnectHashPack()
        }
        else
            onClickConnectHashPack()
    }

    const getTotalInfo = async () => {
        setLoadingView(true)
        await getStakedNFTList()
        await getNFTList()
        await getRewardAmount()
        setLoadingView(false)
    }

    const getNFTList = async () => {
        let _newWalletNftInfo = [];
        let _nextLink = null;

        let _WNinfo = await getRequest(env.MIRROR_NET_URL + "/api/v1/accounts/" + walletId + "/nfts");
        if (!_WNinfo) {
            toast.error("Something wrong with network!");
            setLoadingView(false);
            return;
        }

        if (_WNinfo && _WNinfo.nfts.length > 0)
            _nextLink = _WNinfo.links.next;

        while (1) {
            let _tempNftInfo = _WNinfo.nfts;
            for (let i = 0; i < _tempNftInfo.length; i++) {
                if (_tempNftInfo[i].token_id === env.HASHPARK_NFT_ID) {
                    const _nftInfo = await getNftInfoFromMirrorNet(_tempNftInfo[i].token_id, _tempNftInfo[i].serial_number);
                    if (_nftInfo) {
                        _newWalletNftInfo.push({
                            token_id: _nftInfo.token_id,
                            serial_number: _nftInfo.serial_number,
                            imageUrl: _nftInfo.imageUrl,
                            name: _nftInfo.name,
                            selected: false,
                        })
                    }
                }
            }

            if (!_nextLink || _nextLink === null) break;

            _WNinfo = await getRequest(env.MIRROR_NET_URL + _nextLink);
            _nextLink = null;
            if (_WNinfo && _WNinfo.nfts.length > 0)
                _nextLink = _WNinfo.links.next;
        }
        setUnstakedNFTList(_newWalletNftInfo);
        setUnstakedNFTCount(_newWalletNftInfo.length);
    }

    const getNftInfoFromMirrorNet = async (tokenId_, serialNum_) => {
        const g_singleNftInfo = await getRequest(`${env.MIRROR_NET_URL}/api/v1/tokens/${tokenId_}/nfts?serialNumber=${serialNum_}`);
        if (g_singleNftInfo && g_singleNftInfo.nfts.length > 0) {
            let g_preMdUrl = base64ToUtf8(g_singleNftInfo.nfts[0].metadata).split("//");

            let _metadataUrl = '';
            let ipfsType = 0;
            if (g_preMdUrl[g_preMdUrl.length - 2].includes('ipfs') == true) {
                _metadataUrl = env.IPFS_URL + g_preMdUrl[g_preMdUrl.length - 1];
                ipfsType = 1;
            }
            else if (g_preMdUrl[g_preMdUrl.length - 2].includes('https') == true) {
                if (g_preMdUrl[g_preMdUrl.length - 1].includes('ipfs.infura.io') == true) {
                    let preMdUrlList = g_preMdUrl[g_preMdUrl.length - 1].split('/');
                    _metadataUrl = env.IPFS_URL + preMdUrlList[preMdUrlList?.length - 1];
                    ipfsType = 2;
                }
                else if (g_preMdUrl[g_preMdUrl.length - 1].includes('cloudflare-ipfs.com') == true) { //issue
                    return { result: false };
                    // let preMdUrlList = g_preMdUrl[g_preMdUrl.length - 1].split('/');
                    // _metadataUrl = env.IPFS_URL + preMdUrlList[preMdUrlList?.length - 1];
                    // ipfsType = 3;
                }
            }

            const _metadataInfo = await getRequest(_metadataUrl); // get NFT metadata
            if (_metadataInfo && _metadataInfo.image != undefined && _metadataInfo.image?.type != "string") {
                let _imageUrlList;
                if (ipfsType == 1)
                    _imageUrlList = _metadataInfo.image.split('://');
                else if (ipfsType == 2)
                    _imageUrlList = _metadataInfo.image.split('/');
                else if (ipfsType == 3)
                    _imageUrlList = _metadataInfo.image.description.split('ipfs/');

                let _imageUrlLen = _imageUrlList?.length;
                let _imageUrl = "";
                if (ipfsType == 1) {
                    if (_imageUrlLen == 2)
                        _imageUrl = env.IPFS_URL + _imageUrlList[_imageUrlLen - 1];
                    else if (_imageUrlLen == 3)
                        _imageUrl = env.IPFS_URL + _imageUrlList[_imageUrlLen - 2] + "/" + _imageUrlList[_imageUrlLen - 1];
                }
                else if (ipfsType == 2) {
                    _imageUrl = env.IPFS_URL + _imageUrlList[_imageUrlLen - 1];
                }
                else if (ipfsType == 3) {
                    _imageUrl = env.IPFS_URL + _imageUrlList[_imageUrlLen - 1];
                }

                const _metaData = {
                    token_id: tokenId_,
                    serial_number: serialNum_,
                    name: _metadataInfo.name,
                    imageUrl: _imageUrl
                };
                return _metaData;
            }
            toast.error("Something wrong with server!");
            setLoadingView(false);
            return null;
        }
        toast.error("Something wrong with server!");
        setLoadingView(false);
        return null;
    }

    const base64ToUtf8 = (base64Str_) => {
        // create a buffer
        const _buff = Buffer.from(base64Str_, 'base64');

        // decode buffer as UTF-8
        const _utf8Str = _buff.toString('utf-8');

        return _utf8Str;
    }

    const getStakeRatio = async () => {
        let _stakeRatioResult = await getRequest(env.SERVER_URL + "/api/stake/load_stake_ratio");
        if (!_stakeRatioResult) {
            toast.error("Something wrong with server!");
            setLoadingView(false);
            return;
        }
        if (!_stakeRatioResult.result) {
            toast.error(_stakeRatioResult.error);
            setLoadingView(false);
            return;
        }
        setStakeRatio(_stakeRatioResult.data.stakeRatio.toFixed(1));
        setStakedNFTCount(_stakeRatioResult.data.stakedNFTCount)
        setTotalNFTCount(_stakeRatioResult.data.totalNFTCount)
    }

    const getRewardAmount = async () => {
        let _res = await getRequest(env.SERVER_URL + "/api/stake/get_reward_amount?accountId=" + walletId);
        if (!_res) {
            toast.error("Something wrong with server!");
            setLoadingView(false);
            return;
        }
        if (!_res.result) {
            toast.error(_res.error);
            setLoadingView(false);
            return;
        }
        setRewardAmount(_res.data)
    }

    const getStakedNFTList = async () => {
        let _stakedResult = await getRequest(env.SERVER_URL + "/api/stake/load_staked_nfts?accountId=" + walletId);
        if (!_stakedResult) {
            toast.error("Something wrong with server!");
            setLoadingView(false);
            return;
        }
        if (!_stakedResult.result) {
            toast.error(_stakedResult.error);
            setLoadingView(false);
            return;
        }

        setStakedNFTList(_stakedResult.data);
        setStakedNFTCount(_stakedResult.data.length);
    }

    const handleStake = async () => {
        if (checkedUnstakedNFTCount === 0) {
            toast.error('Please select the nft!')
            return
        }
        setLoadingView(true)
        let _stakingList = []
        for (let i = 0; i < unstakedNFTList.length; i++) {
            if (unstakedNFTList[i].selected == true)
                _stakingList.push(unstakedNFTList[i])
        }
        console.log(_stakingList)

        const _tsxResult = await allowanceMultipleNft(_stakingList);
        if (!_tsxResult) {
            toast.error("Error! The transaction was rejected, or failed! Please try again!");
            setLoadingView(false);
            return;
        }

        const _postData = {
            accountId: walletId,
            nftList: JSON.stringify(_stakingList)
        };

        const _res = await postRequest(env.SERVER_URL + "/api/stake/stake_new_nfts", _postData);
        if (!_res) {
            toast.error("Something wrong with server!");
            setLoadingView(false);
            return;
        }
        if (!_res.result) {
            toast.error(_res.error);
            setLoadingView(false);
            return;
        }

        // reload nft list
        await getStakeRatio();
        await getStakedNFTList();
        await getNFTList()
        setUnstakedNFTCount(unstakedNFTCount - _stakingList.length);
        setStakedNFTCount(stakedNFTCount + _stakingList.length);
        toast.success("Staking Success!");
        setLoadingView(false);
    }

    return (
        <section className="flex flex-col gap-8 py-8 text-primary font-bold w-[90%] 2xl:w-[70%] mx-auto">
            <div className="flex flex-col gap-4 py-8">
                <div className='flex flex-row gap-2 items-center'>
                    <p className='text-2xl'>Staking</p>
                    <span className="bg-mandatory text-xl px-2.5 py rounded-xl">BETA</span>
                </div>
                <div className='flex flex-row items-center bg-secondary rounded-xl gap-4 p-4'>
                    <img className='rounded-xl' src={pfpIcon} />
                    <div className='flex flex-col gap-2 w-full'>
                        <div className='flex flex-row justify-between items-center'>
                            <p className='text-2xl'>HASH PARK & FRIENDS</p>
                            <button type="button" className='flex flex-row items-center gap-2 bg-mandatory hover:bg-hover rounded-xl px-4 py-0.5 text-xl'>
                                Refresh
                                <img src={refreshIcon} />
                            </button>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <p className='text-base'>Total Hash Friends Staked: {stakedNFTCount}/{totalNFTCount}</p>
                            <div className='h-7 bg-primary rounded-lg'>
                                <div className="flex items-center justify-center bg-[#FFDD41] h-7 text-sm text-black text-center leading-none rounded-lg" style={{
                                    width: `${stakeRatio}%`,
                                }}>
                                    {
                                        stakeRatio >= 4 &&
                                        `${stakeRatio}%`
                                    }
                                </div>
                            </div>
                            <p className='text-base'>Total Stakers: {totalStakers}</p>
                        </div>
                        <button type="button" className='w-[350px] bg-mandatory hover:bg-hover rounded-xl py-2 text-2xl' onClick={handleConnectWallet}>
                            {walletId != null ? walletId + " | Disconnect" : "Connect with HashPack"}
                        </button>
                    </div>
                </div>
            </div>
            {
                walletId === null ? (
                    <div className='rounded-xl bg-primary h-60 p-6'>
                        <div className='flex items-center rounded-xl bg-[#323D4D] h-full'>
                            <p className='text-lg text-center w-full'>Please connect wallet to get started.</p>
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col rounded-2xl bg-normal gap-8 px-4 py-4'>
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-row justify-between items-center'>
                                <p className='text-2xl'>My Wallet</p>
                                <div className='flex flex-row gap-4'>
                                    <button type='button' className='hidden text-xl bg-primary hover:bg-secondary px-4 py-1 rounded-xl'>Withdraw All</button>
                                    <button type='button' className='text-xl bg-mandatory hover:bg-hover px-4 py-1 rounded-xl' onClick={handleStake}>Stake</button>
                                </div>
                            </div>
                            <div className='flex flex-col rounded-2xl bg-secondary p-4 gap-2'>
                                <p className='text-base'>Total Hash Friends: {unstakedNFTCount}</p>
                                <div className='grid grid-cols-4 gap-4 w-[80%] mx-auto h-[300px] px-2 overflow-y-auto'>
                                    {
                                        unstakedNFTList?.map((item, index) => {
                                            return (
                                                <div key={index} className='relative group/nft'>
                                                    <img className='rounded-xl cursor-pointer' src={item.imageUrl} onClick={() => {
                                                        if (item.selected == false) {
                                                            if (checkedUnstakedNFTCount === env.NFT_SELECT_LIMIT) {
                                                                toast.error(`The maximum number of selectable NFTs is ${env.NFT_SELECT_LIMIT}!`)
                                                                return
                                                            }
                                                            item.selected = true
                                                        } else {
                                                            item.selected = false
                                                        }
                                                        item.selected == true ? setCheckedUnstakedNFTCount(checkedUnstakedNFTCount + 1) : setCheckedUnstakedNFTCount(checkedUnstakedNFTCount - 1)
                                                    }} />
                                                    {
                                                        item.selected == false ? (
                                                            <input type="checkbox" value={checkboxValue} className="absolute top-2 left-4 w-5 h-5 text-red-600 bg-primary border-gray-300 rounded focus:ring-0 focus:ring-offset-0" />
                                                        ) : (
                                                            <input checked type="checkbox" value={checkboxValue} className="absolute top-2 left-4 w-5 h-5 text-red-600 bg-primary border-gray-300 rounded focus:ring-0 focus:ring-offset-0" />
                                                        )
                                                    }
                                                    <div className='invisible group-hover/nft:visible absolute top-0 right-0 bg-mandatory w-20 py-0.5 rounded-tr-xl rounded-bl-xl'>
                                                        <p className='text-xl text-primary w-full text-center'>{item.serial_number}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <div className='flex flex-row justify-between items-center'>
                                <div className='flex flex-row gap-4'>
                                    <p className='text-2xl'>My Staking Wallet</p>
                                    <img src={walletIcon} />
                                </div>
                                <span className="hidden bg-mandatory text-xl px-2.5 py rounded-2xl">Status: Staked</span>
                            </div>
                            <div className='flex flex-col rounded-2xl bg-secondary p-4 gap-8'>
                                <div className='hidden flex flex-row justify-between items-center'>
                                    <div className='flex flex-col gap-2'>
                                        <p className='text-base'>Must stake until at least: May 30th, 4:43 pm</p>
                                        <p className='text-base'>
                                            Current lock - out period:
                                            <span className='text-secondary'> 7Days</span>
                                        </p>
                                    </div>
                                    <div className='flex flex-col gap-2'>
                                        <p className='text-base'>
                                            Lifetime withdrawn earnings:
                                            <span className='text-secondary'> 1500 $POOFS</span>
                                        </p>
                                        <p className='text-base'>
                                            Current per Hash Friend Rate:
                                            <span className='text-secondary'> 22 $POOFS/Day</span>
                                        </p>
                                    </div>
                                </div>
                                <div className='flex flex-row gap-8'>
                                    <button type='button' className='text-xl bg-mandatory hover:bg-hover px-4 py-1 rounded-xl w-full'>Unstake</button>
                                    <button type='button' className='text-xl bg-mandatory hover:bg-hover px-4 py-1 rounded-xl w-full'>
                                        Claim All<br />
                                        <span className='text-secondary text-base'>{rewardAmount} $POOFS</span>
                                    </button>
                                </div>
                                <div className='grid grid-cols-4 gap-4 w-[80%] mx-auto h-[300px] px-2 overflow-y-auto'>
                                    {
                                        stakedNFTList?.map((item, index) => {
                                            return (
                                                <div key={index} className='relative group/nft'>
                                                    <img className='rounded-xl cursor-pointer' src={item.imageUrl} onClick={() => {
                                                        if (item.selected == false) {
                                                            if (checkedStakedNFTCount === env.NFT_SELECT_LIMIT) {
                                                                toast.error(`The maximum number of selectable NFTs is ${env.NFT_SELECT_LIMIT}!`)
                                                                return
                                                            }
                                                            item.selected = true
                                                        } else {
                                                            item.selected = false
                                                        }
                                                        item.selected == true ? setCheckedStakedNFTCount(checkedStakedNFTCount + 1) : setCheckedStakedNFTCount(checkedStakedNFTCount - 1)
                                                    }} />
                                                    {
                                                        item.selected == false ? (
                                                            <input type="checkbox" value={checkboxValue} className="absolute top-2 left-4 w-5 h-5 text-red-600 bg-primary border-gray-300 rounded focus:ring-0 focus:ring-offset-0" />
                                                        ) : (
                                                            <input checked type="checkbox" value={checkboxValue} className="absolute top-2 left-4 w-5 h-5 text-red-600 bg-primary border-gray-300 rounded focus:ring-0 focus:ring-offset-0" />
                                                        )
                                                    }
                                                    <div className='invisible group-hover/nft:visible absolute top-0 right-0 bg-mandatory w-20 py-0.5 rounded-tr-xl rounded-bl-xl'>
                                                        <p className='text-xl text-primary w-full text-center'>{item.serial_number}</p>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                loadingView &&
                <LoadingLayout />
            }
        </section>
    )
}
export default StakingPage