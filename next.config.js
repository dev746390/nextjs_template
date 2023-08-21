/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,

    
    // for docker
    // This will create a folder at .next/standalone which can then be deployed on its own without installing node_modules.
    // "next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead
    output: 'standalone', 

    //  add a page route with html extension 
    // Rename the file under pages directory to `.html.tsx`
    pageExtensions: ['html.jsx', 'jsx', 'js', 'tsx', 'ts'],
    // omit the html extension 
    trailingSlash: false,
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });

        return config;
    },
    env: {
        STATIC_URL: '/public',
    }
    /*
    async redirects() {
        return [
            {
                source: '/',
                destination: process.env.NODE_ENV === 'development' ? '/index.html' : '/',
                permanent: true,
            },
        ]
    },
    async headers() {
        return [
            {
                source: '/about',
                headers: [
                    {
                        key: 'x-custom-header',
                        value: 'my custom header value',
                    },
                    {
                        key: 'x-another-custom-header',
                        value: 'my other custom header value',
                    },
                ],
            },
        ]
    },
    */
}

module.exports = nextConfig


