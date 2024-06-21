/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
				pathname: "/dogsmwhda/**",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				port: "",
				pathname: "/**",
			},
		],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	headers: async () => {
		return [
			{
				source: "/(.*)",
				headers: [
					// Allow for specific domains to have access or * for all
					{
						key: "Access-Control-Allow-Origin",
						value: "http://localhost:3001",
						// DOES NOT WORK
						// value: process.env.ALLOWED_ORIGIN,
					},
					// Allows for specific methods accepted
					{
						key: "Access-Control-Allow-Methods",
						value: "GET, POST, PUT, DELETE, OPTIONS",
					},
					// Allows for specific headers accepted (These are a few standard ones)
					{
						key: "Access-Control-Allow-Headers",
						value: "Content-Type, Authorization",
					},
				],
			},
		];
	},

	reactStrictMode: false,
};

module.exports = nextConfig;
