export type RecipientType = 'phone' | 'nationalId' | 'eWallet';

export const recipientTypeLabel: Record<RecipientType, string> = {
    phone: 'เบอร์โทรศัพท์',
    nationalId: 'เลขบัตรประชาชน',
    eWallet: 'e-Wallet ID',
};

export function detectRecipientType(id: string): RecipientType | null {
    if (id.length === 10) return 'phone';
    if (id.length === 13) return 'nationalId';
    if (id.length === 15) return 'eWallet';
    return null;
}

function isValidNationalId(id: string): boolean {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
        sum += Number(id[i]) * (13 - i);
    }
    return (11 - (sum % 11)) % 10 === Number(id[12]);
}

// คืนค่าข้อความ error หรือ null ถ้าข้อมูลถูกต้อง
export function validateRecipient(id: string): string | null {
    if (!id) return 'กรุณากรอกเบอร์โทรศัพท์ เลขบัตรประชาชน หรือ e-Wallet ID';
    if (!/^\d+$/.test(id)) return 'กรอกได้เฉพาะตัวเลขเท่านั้น';

    const type = detectRecipientType(id);
    if (!type) return 'ต้องเป็นเบอร์โทร 10 หลัก, เลขบัตรประชาชน 13 หลัก หรือ e-Wallet ID 15 หลัก';
    if (type === 'phone' && !/^0[689]\d{8}$/.test(id)) return 'เบอร์มือถือต้องขึ้นต้นด้วย 06, 08 หรือ 09';
    if (type === 'nationalId' && !isValidNationalId(id)) return 'เลขบัตรประชาชนไม่ถูกต้อง';
    return null;
}

export function validateAmount(amount: string): string | null {
    if (!amount) return null;
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return 'จำนวนเงินต้องเป็นตัวเลข ทศนิยมไม่เกิน 2 ตำแหน่ง';
    if (parseFloat(amount) <= 0) return 'จำนวนเงินต้องมากกว่า 0';
    return null;
}

export function formatRecipient(id: string): string {
    switch (detectRecipientType(id)) {
        case 'phone':
            return id.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
        case 'nationalId':
            return id.replace(/^(\d)(\d{4})(\d{5})(\d{2})(\d)$/, '$1-$2-$3-$4-$5');
        default:
            return id;
    }
}

// เดาประเภทระหว่างที่ยังพิมพ์ไม่ครบ ใช้ไฮไลต์ปุ่มประเภทให้ผู้ใช้เห็น
export function guessRecipientType(id: string): RecipientType {
    if (id.length > 13) return 'eWallet';
    if (id.length > 10) return 'nationalId';
    return 'phone';
}
