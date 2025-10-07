import Link from 'next/link'

const footerLinks = {
  Products: [
    { name: 'Far Inference', href: '/inference' },
    { name: 'GPU Network', href: '/gpu' },
    { name: 'Farcana Game', href: '/gaming' },
    { name: 'Far DeSci', href: '/desci' },
  ],
  Resources: [
    { name: 'Documentation', href: '/docs' },
    { name: 'API Reference', href: '/api' },
    { name: 'Whitepaper', href: '/whitepaper' },
    { name: 'Tokenomics', href: '/tokenomics' },
  ],
  Community: [
    { name: 'Twitter', href: 'https://twitter.com/farlabs' },
    { name: 'Discord', href: 'https://discord.gg/farlabs' },
    { name: 'Telegram', href: 'https://t.me/farlabs' },
    { name: 'GitHub', href: 'https://github.com/farlabs' },
  ],
  Legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-dark-card border-t border-dark-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-400
                            flex items-center justify-center font-bold text-white">
                F
              </div>
              <span className="text-xl font-bold text-white">Far Labs</span>
            </Link>
            <p className="text-dark-text text-sm">
              Decentralized AI Infrastructure for the future of Web3
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-dark-text hover:text-white transition-colors text-sm"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-dark-border flex flex-col md:flex-row
                      justify-between items-center gap-4">
          <p className="text-dark-text text-sm">
            © 2024 Far Labs. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-dark-text hover:text-white text-sm">
              Terms
            </Link>
            <Link href="/privacy" className="text-dark-text hover:text-white text-sm">
              Privacy
            </Link>
            <span className="text-dark-text text-sm">
              Powered by BSC
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}