import Link from 'next/link';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer
            className="border-t mt-auto"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)' }}
        >
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                T
                            </div>
                            <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                                TechFinder
                            </span>
                        </Link>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                            The marketplace for tech enthusiasts. Buy and sell quality tech products.
                        </p>
                        <div className="flex items-center gap-3">
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-blue-500 hover:text-white hover:border-blue-500"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                            >
                                <FiTwitter className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-gray-800 hover:text-white hover:border-gray-800"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                            >
                                <FiGithub className="w-4 h-4" />
                            </a>
                            <a
                                href="#"
                                className="w-9 h-9 rounded-full border flex items-center justify-center transition-colors hover:bg-red-500 hover:text-white hover:border-red-500"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                            >
                                <FiMail className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: '/browse', label: 'Browse Products' },
                                { href: '/sell', label: 'Sell Your Tech' },
                                { href: '/dashboard', label: 'Dashboard' },
                                { href: '/dashboard/wishlist', label: 'Wishlist' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors hover:text-blue-500"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Categories
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: '/browse?category_id=1', label: 'Laptops' },
                                { href: '/browse?category_id=2', label: 'CPUs' },
                                { href: '/browse?category_id=3', label: 'Graphics Cards' },
                            ].map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors hover:text-blue-500"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                            Support
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { href: '#', label: 'Help Center' },
                                { href: '#', label: 'Safety Tips' },
                                { href: '#', label: 'Terms of Service' },
                                { href: '#', label: 'Privacy Policy' },
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        href={link.href}
                                        className="text-sm transition-colors hover:text-blue-500"
                                        style={{ color: 'var(--text-muted)' }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div
                    className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4"
                    style={{ borderColor: 'var(--border)' }}
                >
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        © {currentYear} TechFinder. Built for tech enthusiasts.
                    </p>
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <Link href="#" className="hover:text-blue-500 transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-blue-500 transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-blue-500 transition-colors">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
