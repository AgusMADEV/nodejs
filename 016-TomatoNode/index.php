<?php
// Ruta al ejecutable de Node.js
$nodePath = "D:/nodejs/node.exe"; // Verifica la ruta con `which node`

// Ruta del script de Node.js
$scriptPath = "D:/xampp/htdocs/nodejs/016-TomatoNode/002-graficas.js"; // Evita espacios en nombres de archivos

// Verificar si Node.js y el script existen antes de ejecutar
if (!file_exists($nodePath)) {
    die("<p>Error: Node.js no encontrado en <code>$nodePath</code>. Verifica su instalación.</p>");
}

if (!file_exists($scriptPath)) {
    die("<p>Error: El script <code>$scriptPath</code> no existe. Verifica la ruta.</p>");
}

// Ejecutar el script Node.js para generar las gráficas
exec("$nodePath $scriptPath 2>&1", $output, $return_var);

// Verificar si hubo errores en la ejecución
if ($return_var !== 0) {
    echo "<p>Error ejecutando el script de Node.js:</p><pre>" . implode("\n", $output) . "</pre>";
    exit;
}

// Definir las imágenes de las gráficas generadas
$charts = [
    "cpu_load.png" => "CPU Load",
    "ram_usage.png" => "RAM Usage",
    "disk_usage.png" => "Disk Usage",
    "network_upload.png" => "Network Upload",
    "network_download.png" => "Network Download",
];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>agusma.dev | TomatoNode - System Monitoring</title>
    <style>
        /* Estilos CSS */
        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            margin: 0;
            padding: 0;
            text-align: center;
        }
        header {
            background: #222;
            color: #fff;
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
        }
        .grid-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 20px;
            max-width: 1000px;
            margin: auto;
        }
        .chart-card {
            background: white;
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
        }
        .chart-card:hover {
            transform: scale(1.05);
        }
        img {
            max-width: 100%;
            border-radius: 10px;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #555;
        }
    </style>
</head>
<body>

<header>agusma.dev | TomatoNode - System Monitoring</header>

<div class="grid-container">
    <?php foreach ($charts as $file => $title): ?>
        <div class="chart-card">
            <h3><?= htmlspecialchars($title) ?></h3>
            <img src="<?= htmlspecialchars($file) ?>" alt="<?= htmlspecialchars($title) ?>">
        </div>
    <?php endforeach; ?>
</div>

<div class="footer">Powered by agusma.dev | TomatoNode</div>

</body>
</html>
