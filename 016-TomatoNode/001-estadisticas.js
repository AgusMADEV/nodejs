const os = require("os");
const si = require("systeminformation");

async function getCpuLoad() {
  const load = await si.currentLoad();
  return load.currentLoad.toFixed(2);
}

async function getRamUsage() {
  const mem = await si.mem();
  return ((mem.active / mem.total) * 100).toFixed(2);
}

async function getDiskUsage() {
  const disks = await si.fsSize();
  const total = disks.reduce((acc, disk) => acc + disk.size, 0);
  const used = disks.reduce((acc, disk) => acc + disk.used, 0);
  return ((used / total) * 100).toFixed(2);
}

async function getNetworkUsage() {
  const netStart = await si.networkStats();
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
  const netEnd = await si.networkStats();

  const upload = netEnd.tx_bytes - netStart.tx_bytes;
  const download = netEnd.rx_bytes - netStart.rx_bytes;

  return {
    upload: upload ? (upload / 1024).toFixed(2) : "0", // Convert to KB/s
    download: download ? (download / 1024).toFixed(2) : "0",
  };
}

async function getSystemStats() {
  const cpuLoad = await getCpuLoad();
  const ramUsage = await getRamUsage();
  const diskUsage = await getDiskUsage();
  const networkUsage = await getNetworkUsage();

  console.log("CPU Load:", cpuLoad + "%");
  console.log("RAM Usage:", ramUsage + "%");
  console.log("Disk Usage:", diskUsage + "%");
  console.log("Network Upload:", networkUsage.upload + " KB/s");
  console.log("Network Download:", networkUsage.download + " KB/s");
}

getSystemStats();
