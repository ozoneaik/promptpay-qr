'use client';

import {useEffect, useMemo, useRef, useState} from "react";
import generatePayload from "promptpay-qr";
import {useQRCode} from "next-qrcode";
import {
    detectRecipientType,
    formatRecipient,
    guessRecipientType,
    RecipientType,
    recipientTypeLabel,
    validateAmount,
    validateRecipient,
} from "@/lib/promptpay";

const QUICK_AMOUNTS = [20, 50, 100, 500];
const SEGMENTS: { type: RecipientType; label: string }[] = [
    {type: 'phone', label: 'เบอร์โทร'},
    {type: 'nationalId', label: 'บัตรประชาชน'},
    {type: 'eWallet', label: 'e-Wallet'},
];
const STORAGE_KEY = 'promptpay:recipient';

type Hud = { icon: string; text: string };

export default function Home() {
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [remember, setRemember] = useState(false);
    const [touched, setTouched] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    // มือถือแสดงทีละหน้า (ฟอร์ม -> QR) ส่วน desktop แสดงทั้งสองฝั่งพร้อมกัน
    const [showResult, setShowResult] = useState(false);
    const [hud, setHud] = useState<Hud | null>(null);
    const [ready, setReady] = useState(false);
    const hudTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const {Canvas} = useQRCode();

    const recipientError = validateRecipient(recipient);
    const amountError = validateAmount(amount);
    const amountValue = amount && !amountError ? parseFloat(amount) : 0;
    const showRecipientError = !!recipientError && (submitted || touched || !!detectRecipientType(recipient));
    const showAmountError = !!amountError;

    const qr = useMemo(() => {
        if (recipientError || amountError) return null;
        return generatePayload(recipient, {amount: amountValue || undefined});
    }, [recipient, amountValue, recipientError, amountError]);

    // โหลดหมายเลขที่จำไว้ และค่าจากลิงก์แชร์ (?id=...&amount=...)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const sharedId = params.get('id')?.replace(/\D/g, '');
        if (sharedId) {
            // เปิดจากลิงก์แชร์ = ผู้เปิดคือคนโอน ไม่ต้องเขียนทับหมายเลขที่จำไว้
            setRecipient(sharedId.slice(0, 15));
            setAmount(params.get('amount') ?? '');
            setShowResult(!validateRecipient(sharedId));
        } else {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setRecipient(saved);
                setRemember(true);
            }
        }
        setReady(true);
    }, []);

    useEffect(() => {
        if (ready && remember && !recipientError) localStorage.setItem(STORAGE_KEY, recipient);
    }, [ready, remember, recipient, recipientError]);

    function showHud(next: Hud) {
        clearTimeout(hudTimer.current);
        setHud(next);
        hudTimer.current = setTimeout(() => setHud(null), 1500);
    }

    function toggleRemember() {
        if (remember) localStorage.removeItem(STORAGE_KEY);
        setRemember(!remember);
    }

    function clearForm() {
        setRecipient('');
        setAmount('');
        setTouched(false);
        setSubmitted(false);
        setShowResult(false);
    }

    function genQr() {
        setSubmitted(true);
        if (qr) setShowResult(true);
    }

    function getQrCanvas() {
        return document.querySelector<HTMLCanvasElement>('#qr-container canvas');
    }

    async function copyQRImage() {
        const canvas = getQrCanvas();
        if (!canvas) return;
        try {
            // ส่ง Promise เข้า ClipboardItem ทันที เพื่อให้ Safari ยังนับว่าอยู่ใน user gesture
            const blob = new Promise<Blob>((resolve, reject) => {
                canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
            });
            await navigator.clipboard.write([new ClipboardItem({'image/png': blob})]);
            showHud({icon: '✓', text: 'คัดลอกแล้ว'});
        } catch (err) {
            console.error('Error copying image:', err);
            showHud({icon: '!', text: 'คัดลอกไม่ได้ ลองบันทึกรูปแทน'});
        }
    }

    function downloadQRImage() {
        const canvas = getQrCanvas();
        if (!canvas) return;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `promptpay-${recipient}${amountValue ? `-${amountValue.toFixed(2)}` : ''}.png`;
        link.click();
    }

    async function shareLink() {
        const params = new URLSearchParams({id: recipient});
        if (amountValue) params.set('amount', amountValue.toFixed(2));
        const url = `${window.location.origin}${window.location.pathname}?${params}`;

        if (navigator.share) {
            try {
                await navigator.share({title: 'พร้อมเพย์ QR', url});
                return;
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            showHud({icon: '✓', text: 'คัดลอกลิงก์แล้ว'});
        } catch {
            showHud({icon: '!', text: 'แชร์ลิงก์ไม่ได้'});
        }
    }

    const activeType = guessRecipientType(recipient);
    const recipientType = detectRecipientType(recipient);

    return (
        <main className="ios-linen h-dvh flex flex-col md:items-center md:justify-center md:p-8">
            <div className="ios-statusbar md:hidden"/>
            <div className="flex flex-1 min-h-0 w-full md:flex-none md:w-[980px] md:h-[640px] md:rounded-md md:overflow-hidden md:shadow-[0_10px_30px_rgba(0,0,0,.6),0_0_0_1px_#000]">

                {/* Form */}
                <section className={`${showResult ? 'hidden' : 'flex'} md:flex flex-1 min-w-0 md:flex-none md:w-[380px] flex-col ios-grouped md:border-r md:border-[#2d3642]`}>
                    <div className="ios-navbar">
                        <h1>พร้อมเพย์ QR</h1>
                        <button className="ios-barbtn right" onClick={clearForm}>ล้าง</button>
                    </div>

                    <div className="flex-1 overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom))]">
                        <div className="ios-section-h">ผู้รับเงิน</div>
                        <div className="ios-seg" role="group" aria-label="ประเภทผู้รับ (เลือกอัตโนมัติ)">
                            {SEGMENTS.map(({type, label}) => (
                                <div key={type} className={activeType === type ? 'on' : ''}>{label}</div>
                            ))}
                        </div>
                        <div className="ios-group">
                            <div className="ios-cell">
                                <label htmlFor="recipient" className="w-[88px]">หมายเลข</label>
                                <input
                                    id="recipient"
                                    value={formatRecipient(recipient)}
                                    onChange={(e) => setRecipient(e.target.value.replace(/\D/g, '').slice(0, 15))}
                                    onBlur={() => recipient && setTouched(true)}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    placeholder="เบอร์โทร / เลขบัตร"
                                    maxLength={19}
                                    className={showRecipientError ? 'text-[#b4231b]' : 'text-black'}
                                    aria-invalid={showRecipientError}
                                    aria-describedby="recipient-hint"
                                />
                                {showRecipientError && <span className="ios-badge error">!</span>}
                                {!recipientError && <span className="ios-badge">✓</span>}
                            </div>
                        </div>
                        <div id="recipient-hint" className={`ios-section-f ${showRecipientError ? 'error' : ''}`}>
                            {showRecipientError ? recipientError : 'ระบบเลือกประเภทให้อัตโนมัติจากจำนวนหลัก'}
                        </div>

                        <div className="ios-section-h">จำนวนเงิน</div>
                        <div className="ios-group">
                            <div className="ios-cell min-h-[58px]">
                                <label htmlFor="amount">บาท</label>
                                <input
                                    id="amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                                    type="text"
                                    inputMode="decimal"
                                    autoComplete="off"
                                    placeholder="0.00"
                                    className={`ios-amount ${showAmountError ? 'text-[#b4231b]' : 'text-black'}`}
                                    aria-invalid={showAmountError}
                                    aria-describedby="amount-hint"
                                />
                            </div>
                        </div>
                        <div id="amount-hint" className={`ios-section-f ${showAmountError ? 'error' : ''}`}>
                            {showAmountError ? amountError : 'ไม่ใส่ก็ได้ ผู้โอนจะกรอกยอดเอง'}
                        </div>
                        <div className="flex gap-2 px-2.5 pt-2.5">
                            {QUICK_AMOUNTS.map((value) => (
                                <button
                                    key={value}
                                    className={`ios-chip ${amountValue === value ? 'on' : ''}`}
                                    onClick={() => setAmount(String(value))}
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        <div className="ios-group mt-4">
                            <div className="ios-cell">
                                <span className="label" id="remember-label">จำหมายเลขนี้</span>
                                <button
                                    role="switch"
                                    aria-checked={remember}
                                    aria-labelledby="remember-label"
                                    className="ios-switch"
                                    onClick={toggleRemember}
                                >
                                    {remember ? 'ON' : 'OFF'}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={genQr}
                            className={`ios-button w-[calc(100%-20px)] mx-2.5 mt-5 md:hidden ${qr ? '' : 'dimmed'}`}
                        >
                            สร้าง QR Code
                        </button>

                        <p className="ios-section-f pt-6 md:hidden">Made with ❤️ by DevAof</p>
                    </div>
                </section>

                {/* Result */}
                <section className={`${showResult ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 flex-col ios-grouped`}>
                    <div className="ios-navbar">
                        <button className="ios-barbtn back md:hidden" onClick={() => setShowResult(false)}>แก้ไข</button>
                        <h1>QR Code</h1>
                        {qr && (
                            <button className="ios-barbtn right done hidden md:flex" onClick={shareLink}>แชร์ลิงก์</button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto flex flex-col items-center px-[22px] py-4 md:justify-center">
                        <div className="qr-card w-full max-w-[300px]">
                            <div className="qr-card-head">THAI QR PAYMENT</div>
                            {qr ? (
                                <>
                                    <div className="inline-block mt-2.5 px-2.5 border-2 border-[#113566] rounded-md text-[13px] font-bold text-[#113566]">
                                        PromptPay
                                    </div>
                                    <div id="qr-container" className="pt-3 pb-2">
                                        <Canvas
                                            text={qr}
                                            options={{
                                                errorCorrectionLevel: 'M',
                                                margin: 3,
                                                width: 400,
                                                color: {
                                                    dark: '#113566',
                                                    light: '#ffffff',
                                                },
                                            }}
                                        />
                                    </div>
                                    <div className="text-[13px] text-[#7a7f87]">
                                        โอนเงินเข้าพร้อมเพย์{recipientType ? ` (${recipientTypeLabel[recipientType]})` : ''}
                                    </div>
                                    <div className="text-[19px] font-bold text-[#222] mt-0.5">{formatRecipient(recipient)}</div>
                                    {amountValue > 0 && (
                                        <div className="text-[30px] font-bold text-[#113566] mt-1.5">
                                            ฿{amountValue.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </div>
                                    )}
                                    <div className="mx-4 mt-2 pt-1.5 pb-3 border-t border-dashed border-[#d7dbe0] text-[11px] text-[#9aa0a8]">
                                        สแกนด้วยแอปธนาคารใดก็ได้
                                    </div>
                                </>
                            ) : (
                                <div className="px-6 py-16 text-[15px] text-[#7a7f87]">
                                    กรอกหมายเลขผู้รับเงินด้านซ้าย<br/>QR Code จะแสดงที่นี่ทันที
                                </div>
                            )}
                        </div>

                        {qr && (
                            <div className="hidden md:flex gap-3 mt-5">
                                <button className="ios-button w-[150px] h-10 text-base" onClick={copyQRImage}>📋 คัดลอกรูป</button>
                                <button className="ios-button gray w-[150px] h-10 text-base" onClick={downloadQRImage}>⬇︎ บันทึก PNG</button>
                            </div>
                        )}
                    </div>

                    <nav className="ios-toolbar md:hidden">
                        <button onClick={copyQRImage}><CopyIcon/>คัดลอก</button>
                        <button onClick={downloadQRImage}><SaveIcon/>บันทึกรูป</button>
                        <button onClick={shareLink}><ShareIcon/>แชร์ลิงก์</button>
                    </nav>
                </section>
            </div>

            <p className="hidden md:block mt-3.5 text-[13px] text-[#9aa0aa] [text-shadow:0_1px_0_rgba(0,0,0,.6)]">
                Made with ❤️ by DevAof
            </p>

            {hud && (
                <div className="ios-hud" role="status">
                    <span className="text-[44px] leading-none">{hud.icon}</span>
                    {hud.text}
                </div>
            )}
        </main>
    );
}

function CopyIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" aria-hidden>
            <rect x="8" y="8" width="12" height="13" rx="2"/>
            <path d="M5 16V5a2 2 0 0 1 2-2h9"/>
        </svg>
    );
}

function SaveIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3v12M7 10l5 5 5-5"/>
            <path d="M4 17v3h16v-3"/>
        </svg>
    );
}

function ShareIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="9" width="18" height="12" rx="2"/>
            <path d="M12 15V3M8 7l4-4 4 4"/>
        </svg>
    );
}
