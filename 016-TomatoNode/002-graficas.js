const { createCanvas } = require("canvas");
const Chart = require("chart.js/auto");
const fs = require("fs");
const si = require("systeminformation");

async function getSystemStats() {
  const cpuLoad = (await si.currentLoad()).currentLoad.toFixed(2);
  const mem = await si.mem();
  const ramUsage = ((mem.active / mem.total) * 100).toFixed(2);
  const disks = await si.fsSize();
  const diskUsage = (
    (disks.reduce((acc, disk) => acc + disk.used, 0) /
      disks.reduce((acc, disk) => acc + disk.size, 0)) *
    100
  ).toFixed(2);

  const netStart = await si.networkStats();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const netEnd = await si.networkStats();
  const upload = ((netEnd.tx_bytes - netStart.tx_bytes) / 1024).toFixed(2);
  const download = ((netEnd.rx_bytes - netStart.rx_bytes) / 1024).toFixed(2);

  return { cpuLoad, ramUsage, diskUsage, upload, download };
}

// Function to create a pie chart
async function generatePieChart(title, used, free, fileName) {
  const width = 400;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Used (%)", "Free (%)"],
      datasets: [
        {
          data: [used, free],
          backgroundColor: ["gold", "purple"],
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: title,
        },
      },
    },
  });

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(fileName, buffer);
  console.log(`Chart saved as ${fileName}`);
}

async function main() {
  const { cpuLoad, ramUsage, diskUsage, upload, download } = await getSystemStats();

  await generatePieChart("CPU Load", cpuLoad, 100 - cpuLoad, "cpu_load.png");
  await generatePieChart("RAM Usage", ramUsage, 100 - ramUsage, "ram_usage.png");
  await generatePieChart("Disk Usage", diskUsage, 100 - diskUsage, "disk_usage.png");
  await generatePieChart("Network Upload", upload, 100 - upload, "network_upload.png");
  await generatePieChart("Network Download", download, 100 - download, "network_download.png");
}

main();
