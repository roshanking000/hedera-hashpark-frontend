import cartIcon from '../../assets/imgs/cart.png'
import discordIcon from '../../assets/imgs/discord.png'
import twitterIcon from '../../assets/imgs/twitter.png'

const HomePage = () => {
    return (
        <section className="flex flex-col gap-8 py-8 w-[90%] 2xl:w-[70%] mx-auto">
            <div className="flex flex-col gap-4 rounded-2xl px-16 py-8 bg-secondary">
                <p className="text-5xl font-bold text-primary">Upcoming Features</p>
                <a href="https://hash-park-and-friends.gitbook.io/hashparkhub/hash-park-and-friends/overview" target='_blank' rel='noreferrer' className="w-1/2 h-[489px] bg-cover bg-[url('assets/imgs/marketplace-bg.png')] rounded-3xl px-12">
                    <div className='flex flex-row justify-center items-center gap-8 h-full'>
                        <img className='w-16' src={cartIcon} />
                        <div className='flex flex-col gap-2'>
                            <p className='text-4xl text-primary font-bold'>Marketplace</p>
                            <p className='text-lg text-primary font-bold'>Shop Exclusive Hash Friends and collectables</p>
                        </div>
                    </div>
                </a>
            </div>
            <div className="flex flex-col rounded-2xl px-16 py-8 h-[319px] bg-cover bg-[url('assets/imgs/sentx-bg.png')] text-primary font-bold">
                <div className='flex flex-col'>
                    <p className='text-lg'>Collect your very own Hash Friends at</p>
                    <p className='text-[132px] -mt-8'>SentX</p>
                </div>
                <a href="https://sentx.io/nft-marketplace/0.0.2930427" target='_blank' rel='noreferrer' className="rounded-2xl bg-mandatory hover:bg-hover px-4 py-3 text-2xl text-center w-[200px]">
                    Shop Now
                </a>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl px-16 py-8 bg-secondary">
                <p className="text-5xl font-bold text-primary">Join Our Community</p>
                <div className='flex flex-row gap-16'>
                    <a href="https://discord.gg/k2h2wvjWds" target='_blank' rel='noreferrer' className="w-1/2 h-[350px] bg-cover bg-[url('assets/imgs/discord-bg.png')] rounded-3xl px-12">
                        <div className='flex flex-row justify-center items-center gap-8 h-full'>
                            <img src={discordIcon} />
                            <div className='flex flex-col gap-2'>
                                <p className='text-4xl text-primary font-bold'>Discord</p>
                                <p className='text-base text-primary font-bold'>Join our discord channel for the latest sneak peaks and insider information</p>
                            </div>
                        </div>
                    </a>
                    <a href="https://twitter.com/HashParkNFT" target='_blank' rel='noreferrer' className="w-1/2 h-[350px] bg-cover bg-[url('assets/imgs/twitter-bg.png')] rounded-3xl px-12">
                        <div className='flex flex-row justify-center items-center gap-8 h-full'>
                            <img src={twitterIcon} />
                            <div className='flex flex-col gap-2'>
                                <p className='text-4xl text-primary font-bold'>Twitter</p>
                                <p className='text-base text-primary font-bold'>Keep up-to-date and follow us on twitter</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </section>
    )
}
export default HomePage