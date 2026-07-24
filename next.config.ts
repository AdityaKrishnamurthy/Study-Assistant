import type { NextConfig } from "next";
import os from "os";

// Dynamically retrieve all local network IPv4 addresses to allow them in HMR development mode
const getLocalIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips = ["localhost", "127.0.0.1"];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4") {
        ips.push(net.address);
      }
    }
  }
  return ips;
};

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: getLocalIPs(),
};

export default nextConfig;
