<?php
// Ambil URL dari parameter query string
$targetUrl = isset($_GET['url']) ? $_GET['url'] : null;

if (!$targetUrl) {
    // Jika tidak ada URL, kirim error
    header("HTTP/1.1 400 Bad Request");
    echo json_encode(['error' => 'Missing target URL']);
    exit;
}

// Validasi URL
$targetUrl = filter_var($targetUrl, FILTER_VALIDATE_URL);
if (!$targetUrl) {
    // Jika URL tidak valid
    header("HTTP/1.1 400 Bad Request");
    echo json_encode(['error' => 'Invalid target URL']);
    exit;
}

// Inisialisasi cURL
$ch = curl_init();

// Set URL tujuan yang ingin diakses
curl_setopt($ch, CURLOPT_URL, $targetUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Menambahkan header CORS untuk mengizinkan akses dari semua origin
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Access-Control-Allow-Origin: *',   // Mengizinkan akses dari semua origin
    'Access-Control-Allow-Methods: GET, POST, PUT, DELETE', // Metode yang didukung
    'Access-Control-Allow-Headers: Content-Type, Authorization, Origin, X-Requested-With' // Header yang diizinkan
]);

// Nonaktifkan verifikasi SSL sementara (hati-hati di lingkungan produksi)
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Kirim permintaan dan ambil respons
$response = curl_exec($ch);

// Periksa error dari cURL
if (curl_errno($ch)) {
    header("HTTP/1.1 500 Internal Server Error");
    echo json_encode(['error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}

// Ambil status kode HTTP dari respons
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

// Tutup sesi cURL
curl_close($ch);

// Set header CORS untuk mengizinkan akses dari origin yang berbeda
header("Access-Control-Allow-Origin: *");   // Agar semua origin bisa mengakses
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE"); // Metode yang didukung
header("Access-Control-Allow-Headers: Content-Type, Authorization, Origin, X-Requested-With"); // Header yang diperbolehkan

// Kirimkan kembali status kode yang diterima dari server tujuan
http_response_code($httpCode);

// Tampilkan respons dari API yang diminta
echo $response;
