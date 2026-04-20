import React, { useState } from 'react';
import { Mail, Send, User, MessageSquare, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SendMailFormProps {
    onBack?: () => void;
    clientName: string; 
  clientEmail: string; 
}

export default function SendMailForm({ onBack }: SendMailFormProps) {
    const router = useRouter();
    const [mailTo, setMailTo] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    const handleSendMail = () => {
        if (!mailTo.trim() || !subject.trim() || !message.trim()) {
            alert('Please fill in all fields before sending.');
            return;
        }
        alert('Mail sent successfully!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3">
            <div className="max-w-2xl mx-auto">


                {/* Header Section */}
                <div className="text-center mb-4">


                    {/* Back Button */}
                    <button
                        onClick={handleBack}
                        className="flex items-center text-[#F59E0B] hover:text-[#F59E0B] mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                    </button>
                    <h1 className="text-xl font-bold text-[#F9FAFB] mb-1">Send Email</h1>

                </div>

                {/* Main Form Card */}
                <div className="bg-[#111111] rounded-2xl shadow-lg border border-[#2A2A2A] overflow-hidden">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                        <h2 className="text-sm font-semibold text-[#F9FAFB] flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Email Composer
                        </h2>
                    </div>

                    {/* Form Content */}
                    <div className="p-4 space-y-4">
                        {/* Mail To Field */}
                        <div>
                            <label className="flex items-center text-xs font-semibold text-[#F9FAFB] mb-1">
                                <User className="w-3 h-3 mr-1 text-[#F59E0B]" />
                                Recipient Email
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={mailTo}
                                    onChange={(e) => setMailTo(e.target.value)}
                                    className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-[#F59E0B] focus:bg-[#111111] transition-all duration-300 text-[#F9FAFB] placeholder-gray-400"
                                    placeholder="Enter recipient's email address"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <Mail className="w-4 h-4 text-[#9CA3AF]" />
                                </div>
                            </div>
                        </div>

                        {/* Subject Field */}
                        <div>
                            <label className="flex items-center text-xs font-semibold text-[#F9FAFB] mb-1">
                                <MessageSquare className="w-3 h-3 mr-1 text-[#F59E0B]" />
                                Subject Line
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-[#F59E0B] focus:bg-[#111111] transition-all duration-300 text-[#F9FAFB] placeholder-gray-400"
                                placeholder="Enter email subject"
                            />
                        </div>

                        {/* Message Field */}
                        <div>
                            <label className="flex items-center justify-between text-xs font-semibold text-[#F9FAFB] mb-1">
                                <span className="flex items-center">
                                    <Mail className="w-3 h-3 mr-1 text-[#F59E0B]" />
                                    Message Content
                                </span>
                                <span className="text-xs font-normal text-[#9CA3AF]">
                                    Max 500 characters
                                </span>
                            </label>
                            <div className="relative">
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={6}
                                    maxLength={500}
                                    className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg focus:outline-none focus:border-[#F59E0B] focus:bg-[#111111] transition-all duration-300 text-[#F9FAFB] placeholder-gray-400 resize-none"
                                    placeholder="Type your message here..."
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-[#9CA3AF] bg-[#111111] px-2 py-1 rounded-md shadow-sm">
                                    {message.length}/500
                                </div>
                            </div>
                        </div>

                        {/* Send Button */}
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={handleSendMail}
                                className="group px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-[#F9FAFB] text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <span className="flex items-center">
                                    <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                                    Send Email
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-amber-50 border-t border-amber-100 px-4 py-3">
                        <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0">
                                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                            </div>
                            <div>
                                <h3 className="text-xs font-semibold text-amber-800 mb-1">
                                    Important Notice
                                </h3>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    Please do not modify mailmerge fields like <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">[[INVESTOR]]</code>, <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">[[LOGIN]]</code>, <code className="bg-amber-100 px-1 py-0.5 rounded text-xs">[[PASS]]</code> etc. These fields will be automatically populated with the selected investor's details when the email is sent.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 text-[#9CA3AF] text-xs">
                    <p>Secure email delivery • Professional communication platform</p>
                </div>
            </div>
        </div>
    );
}
