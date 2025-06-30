'use client';

// Mock QR Code component
import {useState} from "react";
import generatePayload from "promptpay-qr";
import {useQRCode} from "next-qrcode";

export default function Home() {
    const [qr, setQr] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('0931622330');
    const [moneyTarget, setMoneyTarget] = useState(0);

    const {Image } = useQRCode();

    function genQr() {
        if (!phoneNumber) {
            alert('กรุณากรอกเบอร์โทรศัพท์');
            return;
        }

        const value = generatePayload(phoneNumber, { amount: moneyTarget });
        setQr(value);
    }

    function copyQRImage() {
        try {
            const qrContainer = document.getElementById('qr-container');
            if (!qrContainer) return;
            alert('คัดลอกรูปภาพ QR Code สำเร็จ! (ใน real app จะใช้ html2canvas หรือ canvas API)');
        } catch (err) {
            console.error('Error copying image:', err);
            alert('ไม่สามารถคัดลอกรูปภาพได้');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full opacity-10 blur-3xl"></div>
            </div>

            <div className="relative z-10 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">
                        <h1 className="text-4xl font-bold mb-2">DevAof</h1>
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mb-3"></div>
                    <h2 className="text-xl font-semibold text-gray-700">PromptPay QR Generator</h2>
                    <p className="text-sm text-gray-500 mt-2">สร้าง QR Code สำหรับรับเงินผ่าน PromptPay</p>
                </div>

                <div className="space-y-6">
                    {/* Phone Number Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            เบอร์โทรศัพท์
                        </label>
                        <div className="relative">
                            <input
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                type="text"
                                placeholder="0XX-XXX-XXXX"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-gray-50 focus:bg-white"
                                maxLength={10}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            จำนวนเงิน (บาท)
                        </label>
                        <div className="relative">
                            <input
                                onChange={(e) => setMoneyTarget(parseFloat(e.target.value) || 0)}
                                type="number"
                                placeholder="0.00"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-gray-50 focus:bg-white"
                                min="0"
                                step="0.01"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <span className="text-sm text-gray-400">฿</span>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={genQr}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center space-x-2"
                    >
                        <span>🚀</span>
                        <span>สร้าง QR Code</span>
                    </button>
                </div>

                {/* QR Code Display */}
                {qr && (
                    <div className="mt-8 space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">QR Code ของคุณ</h3>
                            <div className="flex justify-center">
                                <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-gray-100" id='qr-container'>
                                    <Image
                                        text={qr}
                                        logo={{
                                            src : 'https://www.bot.or.th/content/dam/bot/icons/icon-thaiqr.png',
                                            options : {
                                                width : 100
                                            }
                                        }}
                                        options={{
                                            errorCorrectionLevel: 'M',
                                            margin: 3,
                                            scale: 4,
                                            width: 200,
                                            color: {
                                                dark: '#113566',
                                                light: '#ffff',
                                            },
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col space-y-3 mt-4">
                                <button
                                    onClick={copyQRImage}
                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 flex items-center justify-center space-x-2"
                                >
                                    <span>📋</span>
                                    <span>คัดลอกรูปภาพ QR Code</span>
                                </button>
                            </div>

                            {/* Payment Info */}
                            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">เบอร์โทร:</span>
                                    <span className="font-medium text-gray-800">{phoneNumber}</span>
                                </div>
                                {moneyTarget > 0 && (
                                    <div className="flex justify-between items-center text-sm mt-2">
                                        <span className="text-gray-600">จำนวนเงิน:</span>
                                        <span className="font-medium text-gray-800">฿{moneyTarget.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        Made with ❤️ by DevAof
                    </p>
                </div>
            </div>
        </div>
    );
}