import { networkInterfaces } from "node:os";

const VIRTUAL_INTERFACE =
  /vethernet|wsl|hyper-v|virtualbox|vmware|docker|loopback/i;
const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function lanAddress() {
  if (process.env.LAN_ADDRESS) return process.env.LAN_ADDRESS;
  const addresses = Object.entries(networkInterfaces())
    .filter(([name]) => !VIRTUAL_INTERFACE.test(name))
    .flatMap(([, list]) => list ?? [])
    .filter(({ family, internal }) => family === "IPv4" && !internal)
    .map(({ address }) => address);
  return (
    addresses.find((address) => address.startsWith("192.168.")) ?? addresses[0]
  );
}

export function publicOrigin(host: string, protocol: string) {
  const url = new URL(`${protocol}://${host}`);
  const lan = lanAddress();
  if (LOCAL_HOSTNAMES.has(url.hostname) && lan) {
    url.hostname = lan;
  }
  return url.origin;
}
