import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'

import hashparkLogo from '../../assets/imgs/logo.png'

const Header = () => {
    return (
        <header className="relative w-full flex flex-row justify-start bg-secondary border-b-primary border-b-[0.5px] px-1 lg:px-8 py-4">
            <Link to='/' className='flex justify-between items-center w-full px-4'>
                <img
                    className='w-16 lg:w-[109px]'
                    src={hashparkLogo}
                />
            </Link>
            <div className='hidden xl:flex justify-center items-end gap-10 w-full'>
                <ul className='flex gap-14 font-bold text-xl leading-20px items-center'>
                    <li className='text-primary hover:text-hover cursor-pointer hover:text-accent'>
                        <Link to='/'>
                            <span>Home</span>
                        </Link>
                    </li>
                    <li className='text-primary hover:text-hover cursor-pointer hover:text-accent'>
                        <a href="https://hash-park-and-friends.gitbook.io/hashparkhub/hash-park-and-friends/overview" target='_blank' rel='noreferrer'>
                            <span>Roadmap</span>
                        </a>
                    </li>
                    <li className='text-primary hover:text-hover cursor-pointer hover:text-accent'>
                        <Link to="/staking">
                            <span>Staking</span>
                        </Link>
                    </li>
                    <li className='text-primary hover:text-hover cursor-pointer hover:text-accent'>
                        <Link className='group/marketplace relative'>
                            <span>Marketplace</span>
                            <span className='group/show invisible group-hover/marketplace:visible group-hover/show: absolute w-[90px] bg-mandatory px-2 py-1 text-[10px] font-bold rounded-full -top-8 left-8 animate-bounce text-primary'>Coming Soon</span>
                        </Link>
                    </li>
                </ul>
            </div>
            <div className='lg:hidden'>
                <Menu as="div" className="relative inline-block text-left bg-accent !z-50">
                    <div>
                        <Menu.Button className="inline-flex w-full justify-center rounded-md bg-black bg-opacity-20 px-8 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
                            <svg
                                width='24'
                                height='24'
                                viewBox='0 0 24 24'
                                fill='white'
                                xmlns='http://www.w3.org/2000/svg'
                            >
                                <rect x='2' y='4' width='14' height='2'></rect>
                                <rect x='2' y='11' width='20' height='2'></rect>
                                <rect x='8' y='18' width='14' height='2'></rect>
                            </svg>
                        </Menu.Button>
                    </div>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-primary shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="px-1 py-1">
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link to="/" className="text-primary hover:text-hover cursor-pointer hover:text-accent group flex w-full items-center rounded-md px-2 py-2 text-sm">
                                            Home
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <a href="https://hash-park-and-friends.gitbook.io/hashparkhub/hash-park-and-friends/overview" target='_blank' rel='noreferrer' className="text-primary hover:text-hover cursor-pointer hover:text-accent group flex w-full items-center rounded-md px-2 py-2 text-sm">
                                            Roadmap
                                        </a>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link to="/staking" className="text-primary hover:text-hover cursor-pointer hover:text-accent group flex w-full items-center rounded-md px-2 py-2 text-sm">
                                            Staking
                                        </Link>
                                    )}
                                </Menu.Item>
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link to="/" className="text-primary hover:text-hover cursor-pointer hover:text-accent group flex w-full items-center rounded-md px-2 py-2 text-sm">
                                            Marketplace
                                        </Link>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    )
}

export default Header
