const nodemailer = require('nodemailer');

// 1. GİZLİ MƏLUMAT BAZASI (URL-lər burada təhlükəsizdir)
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
    'MSUEU050526ERSTE200M': 'https://verification-swift.com/verification-mt103-bma01488yc58xd99',
    'MMG70M260426DEUT001': 'https://verification-swift.com/verification-mt103-dzc35898rv02sd100',
    'DEU17112212C332-230326': 'https://verification-swift.com/verfication-cob-by653atm688v'
};

// Sessiya yaddaşı (Global deyil, Netlify hər çağırışda bunu sıfırlaya bilər)
let activeSessions = {};

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };

    try {
        const body = JSON.parse(event.body);
        const { action, ref, email, code } = body;

        // --- ADDIM 1: Reference Yoxla ---
        if (action === "checkRef") {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: !!refMap[ref] })
            };
        }

        // --- ADDIM 2: Kod yarat və Email Göndər ---
        if (action === "sendEmail") {
            const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            const transporter = nodemailer.createTransport({
                host: "sh003.megahost.kz",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                tls: { rejectUnauthorized: false }
            });

            const mailOptions = {
                from: `"Verify Swift" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Your Verification Code - Verify Swift",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
                        <h2 style="color: #006b3c;">Secure Verification</h2>
                        <p>Use the following code to confirm your identity:</p>
                        <div style="font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px; margin: 20px 0; padding: 15px; background: #f4f4f4; text-align: center;">
                            ${generatedCode}
                        </div>
                        <p>If you did not request this, please ignore this email.</p>
                    </div>`
            };

            await transporter.sendMail(mailOptions);
            
            // Kodun yoxlanması üçün sessiyaya yazırıq
            activeSessions[email] = { code: generatedCode, ref: ref };

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ success: true, message: "Email sent" })
            };
        }

        // --- ADDIM 3: Kodu yoxla və gizli linki çıxar ---
        if (action === "verifyFinal") {
            const session = activeSessions[email];
            if (session && session.code === code) {
                const redirectUrl = refMap[session.ref];
                delete activeSessions[email]; // Təhlükəsizlik üçün silirik
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({ success: true, redirect: redirectUrl })
                };
            }
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ success: false, message: "Invalid code" })
            };
        }

    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, message: error.message })
        };
    }
};
